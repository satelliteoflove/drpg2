import { Character } from '../entities/Character';
import { Encounter, Monster, Spell } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { ErrorHandler, ErrorSeverity } from '../utils/ErrorHandler';

export class CombatSystem {
  private encounter: Encounter | null = null;
  private onCombatEnd?: (victory: boolean, rewards?: { experience: number; gold: number }) => void;
  private onMessage?: (message: string) => void;
  private recursionDepth: number = 0;
  private isProcessingTurn: boolean = false; // Prevent simultaneous turn processing
  private turnTimeoutId: number | null = null; // Safety timeout for stuck turns
  private lastTurnStartTime: number = 0; // Track turn start time
  private isCallingNextTurn: boolean = false; // Prevent recursive nextTurn calls

  public startCombat(
    monsters: Monster[],
    party: Character[],
    onCombatEnd: (victory: boolean, rewards?: { experience: number; gold: number }) => void,
    onMessage?: (message: string) => void
  ): void {
    this.onCombatEnd = onCombatEnd;
    this.onMessage = onMessage;
    this.resetTurnState(); // Ensure clean state

    this.encounter = {
      monsters: monsters.map(m => ({ ...m })),
      surprise: Math.random() < GAME_CONFIG.ENCOUNTER.SURPRISE_CHANCE,
      canRun: true,
      turnOrder: this.calculateTurnOrder(party, monsters),
      currentTurn: 0,
    };

    if (this.encounter.surprise) {
      this.encounter.turnOrder = this.encounter.turnOrder.filter(unit => 'class' in unit);
    }
  }

  private resetTurnState(): void {
    // Clear any existing timeout
    if (this.turnTimeoutId !== null) {
      clearTimeout(this.turnTimeoutId);
      this.turnTimeoutId = null;
    }
    
    // Reset all flags
    this.isProcessingTurn = false;
    this.recursionDepth = 0;
    this.lastTurnStartTime = 0;
    this.isCallingNextTurn = false;
  }

  private startTurnTimeout(): void {
    // Clear any existing timeout
    if (this.turnTimeoutId !== null) {
      clearTimeout(this.turnTimeoutId);
    }

    this.lastTurnStartTime = Date.now();
    
    // Set timeout to force reset if turn takes too long (10 seconds)
    this.turnTimeoutId = window.setTimeout(() => {
      ErrorHandler.logError(
        `Turn processing timeout - forcing reset after ${Date.now() - this.lastTurnStartTime}ms`,
        ErrorSeverity.HIGH,
        'CombatSystem.startTurnTimeout'
      );
      
      // Log current state for debugging
      this.logCombatState('TIMEOUT');
      
      this.resetTurnState();
      if (this.onMessage) {
        this.onMessage('Turn processing timeout - continuing combat...');
      }
      
      // Validate state before continuing
      if (this.validateCombatState()) {
        this.nextTurn();
      } else {
        ErrorHandler.logError(
          'Invalid combat state after timeout - ending combat',
          ErrorSeverity.CRITICAL,
          'CombatSystem.startTurnTimeout'
        );
        this.endCombat(false);
      }
    }, 10000);
  }

  private validateCombatState(): boolean {
    if (!this.encounter) {
      return false;
    }
    
    // Check if encounter has valid turn order
    if (!this.encounter.turnOrder || this.encounter.turnOrder.length === 0) {
      return false;
    }
    
    // Check if current turn index is valid
    if (this.encounter.currentTurn < 0 || this.encounter.currentTurn >= this.encounter.turnOrder.length) {
      return false;
    }
    
    // Check if there are any alive units
    const aliveUnits = this.encounter.turnOrder.filter(unit => {
      if ('class' in unit) {
        return !unit.isDead;
      } else {
        return unit.hp > 0;
      }
    });
    
    return aliveUnits.length > 0;
  }

  private logCombatState(context: string): void {
    if (!this.encounter) {
      console.warn(`[${context}] No active encounter`);
      return;
    }
    
    const currentUnit = this.getCurrentUnit();
    const aliveUnits = this.encounter.turnOrder.filter(unit => {
      if ('class' in unit) {
        return !unit.isDead;
      } else {
        return unit.hp > 0;
      }
    });
    
    console.warn(`[${context}] Combat State:`, {
      isProcessingTurn: this.isProcessingTurn,
      recursionDepth: this.recursionDepth,
      currentTurn: this.encounter.currentTurn,
      turnOrderLength: this.encounter.turnOrder.length,
      aliveUnitsCount: aliveUnits.length,
      currentUnit: currentUnit ? ('class' in currentUnit ? currentUnit.name : currentUnit.name) : 'none',
      turnDuration: this.lastTurnStartTime > 0 ? Date.now() - this.lastTurnStartTime : 0,
      hasTimeout: this.turnTimeoutId !== null
    });
  }

  private calculateTurnOrder(party: Character[], monsters: Monster[]): (Character | Monster)[] {
    const allUnits: (Character | Monster)[] = [...party.filter(c => !c.isDead), ...monsters];

    return allUnits.sort((a, b) => {
      const aAgility = 'stats' in a ? a.stats.agility : 10;
      const bAgility = 'stats' in b ? b.stats.agility : 10;
      return bAgility - aAgility + (Math.random() - 0.5) * 2;
    });
  }

  public getCurrentUnit(): any {
    if (!this.encounter) return null;
    return this.encounter.turnOrder[this.encounter.currentTurn] || null;
  }

  public canPlayerAct(): boolean {
    const currentUnit = this.getCurrentUnit();
    return currentUnit !== null && 'class' in currentUnit;
  }

  public getPlayerOptions(): string[] {
    const currentUnit = this.getCurrentUnit();
    if (!currentUnit || !('class' in currentUnit)) return [];

    const options = ['Attack', 'Defend', 'Use Item'];

    if (currentUnit.spells.length > 0 && currentUnit.mp > 0) {
      options.push('Cast Spell');
    }

    if (this.encounter?.canRun) {
      options.push('Run');
    }

    return options;
  }

  public executePlayerAction(action: string, targetIndex?: number, spellId?: string): string {
    // Validate combat state before processing action
    if (!this.validateCombatState()) {
      ErrorHandler.logError(
        'Invalid combat state when executing player action',
        ErrorSeverity.HIGH,
        'CombatSystem.executePlayerAction'
      );
      this.logCombatState('INVALID_STATE');
      return 'Combat state invalid';
    }

    const currentUnit = this.getCurrentUnit();
    if (!currentUnit || !('class' in currentUnit) || !this.encounter) {
      return 'Invalid action';
    }

    // Prevent multiple simultaneous actions
    if (this.isProcessingTurn) {
      console.log(`[DEBUG] Action rejected - already processing turn`);
      return 'Action already in progress';
    }

    this.isProcessingTurn = true;
    this.startTurnTimeout(); // Start safety timeout

    let result = '';

    switch (action) {
      case 'Attack':
        result = this.executeAttack(currentUnit, targetIndex);
        break;
      case 'Cast Spell':
        result = this.executeCastSpell(currentUnit, spellId, targetIndex);
        break;
      case 'Defend':
        result = `${currentUnit.name} defends!`;
        break;
      case 'Use Item':
        result = `${currentUnit.name} uses an item!`;
        break;
      case 'Run':
        if (this.attemptRun()) {
          this.isProcessingTurn = false;
          this.endCombat(false);
          return 'Successfully ran away!';
        } else {
          result = 'Could not escape!';
        }
        break;
      default:
        result = 'Invalid action';
    }

    this.nextTurn();
    
    // Additional safety: if we end up back at a player turn immediately, reset processing flag
    if (this.canPlayerAct()) {
      this.isProcessingTurn = false;
      if (this.turnTimeoutId !== null) {
        clearTimeout(this.turnTimeoutId);
        this.turnTimeoutId = null;
      }
    }
    
    return result;
  }

  private executeAttack(attacker: Character, targetIndex?: number): string {
    if (!this.encounter) return 'No active combat';

    const aliveMonsters = this.encounter.monsters.filter(m => m.hp > 0);
    if (aliveMonsters.length === 0) return 'No targets available';

    const target =
      targetIndex !== undefined && targetIndex < aliveMonsters.length
        ? aliveMonsters[targetIndex]
        : aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];

    const damage = this.calculateDamage(attacker, target);
    target.hp = Math.max(0, target.hp - damage);

    let result = `${attacker.name} attacks ${target.name} for ${damage} damage!`;

    if (target.hp === 0) {
      result += ` ${target.name} is defeated!`;
    }

    return result;
  }

  private executeCastSpell(caster: Character, spellId?: string, targetIndex?: number): string {
    if (!this.encounter || !spellId) return 'Invalid spell';

    const spell = caster.spells.find(s => s.id === spellId);
    if (!spell) return 'Spell not found';

    if (caster.mp < spell.mpCost) return 'Not enough MP';

    caster.mp -= spell.mpCost;

    let target: Character | Monster | null = null;
    let result = `${caster.name} casts ${spell.name}!`;

    switch (spell.targetType) {
      case 'enemy':
        const aliveMonsters = this.encounter.monsters.filter(m => m.hp > 0);
        target =
          targetIndex !== undefined && targetIndex < aliveMonsters.length
            ? aliveMonsters[targetIndex]
            : aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];
        break;
      case 'ally':
      case 'self':
        target = caster;
        break;
    }

    if (target) {
      result += ' ' + this.applySpellEffect(spell, target);
    }

    return result;
  }

  private applySpellEffect(spell: Spell, target: Character | Monster): string {
    switch (spell.effect.type) {
      case 'damage':
        const damage = spell.effect.power + Math.floor(Math.random() * 6);
        if ('hp' in target) {
          target.hp = Math.max(0, target.hp - damage);
          return `${target.name} takes ${damage} damage!`;
        }
        break;
      case 'heal':
        if ('heal' in target) {
          const healing = spell.effect.power + Math.floor(Math.random() * 6);
          target.heal(healing);
          return `${target.name} recovers ${healing} HP!`;
        }
        break;
      default:
        return 'The spell has no effect!';
    }
    return '';
  }

  public executeMonsterTurn(): string {
    const currentUnit = this.getCurrentUnit();
    if (!currentUnit || !this.encounter) {
      // Silently skip if no unit or encounter
      this.resetTurnState();
      return '';
    }
    
    if ('class' in currentUnit) {
      // It's a player's turn, not a monster's - reset flag and skip
      this.isProcessingTurn = false;
      return '';
    }

    const monster = currentUnit;
    const alivePlayers = this.encounter.turnOrder.filter(
      unit => 'class' in unit && !unit.isDead
    ) as Character[];

    if (alivePlayers.length === 0) {
      this.isProcessingTurn = false;
      this.endCombat(false);
      return 'Party defeated!';
    }

    const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    const attack = monster.attacks[Math.floor(Math.random() * monster.attacks.length)];

    if (Math.random() < attack.chance) {
      const damage = this.rollDamage(attack.damage);
      target.takeDamage(damage);

      // Don't call nextTurn() here - let the timeout handler manage turn progression
      return `${monster.name} uses ${attack.name} on ${target.name} for ${damage} damage!`;
    } else {
      // Don't call nextTurn() here - let the timeout handler manage turn progression  
      return `${monster.name} attacks ${target.name} but misses!`;
    }
  }

  private calculateDamage(attacker: Character, target: Monster): number {
    const baseDamage = Math.floor(attacker.stats.strength / 2) + Math.floor(Math.random() * 6) + 1;
    const defense = Math.floor(target.ac / 2);
    return Math.max(1, baseDamage - defense);
  }

  private rollDamage(damageString: string): number {
    const match = damageString.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return 1;

    const [, numDice, dieSize, bonus] = match;
    let total = 0;

    for (let i = 0; i < parseInt(numDice); i++) {
      total += Math.floor(Math.random() * parseInt(dieSize)) + 1;
    }

    return total + (bonus ? parseInt(bonus) : 0);
  }

  private attemptRun(): boolean {
    if (!this.encounter) return false;

    const escapeChance = 0.5;
    const success = Math.random() < escapeChance;

    if (!success) {
      this.encounter.canRun = false;
    }

    return success;
  }

  private nextTurn(): void {
    // Prevent recursive calls to nextTurn
    if (this.isCallingNextTurn) {
      console.log(`[DEBUG] nextTurn() blocked - already in progress`);
      return;
    }
    
    this.isCallingNextTurn = true;
    console.log(`[DEBUG] nextTurn() starting`);
    
    try {
      // Validate state before proceeding
      if (!this.validateCombatState()) {
        ErrorHandler.logError(
          'Invalid combat state in nextTurn - ending combat',
          ErrorSeverity.HIGH,
          'CombatSystem.nextTurn'
        );
        this.logCombatState('INVALID_NEXT_TURN');
        this.resetTurnState();
        this.endCombat(false);
        return;
      }

      if (!this.encounter) {
        this.resetTurnState();
        return;
      }

      this.encounter.currentTurn = (this.encounter.currentTurn + 1) % this.encounter.turnOrder.length;

      this.cleanupDeadUnits();

      // Re-validate after cleanup in case turn order changed
      if (!this.validateCombatState() || this.checkCombatEnd()) {
        this.resetTurnState();
        return;
      }

      // Prevent infinite recursion
      if (this.recursionDepth >= GAME_CONFIG.COMBAT.MAX_RECURSION_DEPTH) {
        ErrorHandler.logError(
          `Combat recursion depth exceeded (${this.recursionDepth}), ending combat`,
          ErrorSeverity.HIGH,
          'CombatSystem.nextTurn'
        );
        this.logCombatState('MAX_RECURSION');
        this.resetTurnState();
        this.endCombat(false);
        return;
      }

      const currentUnit = this.getCurrentUnit();
      const isMonster = currentUnit && !('class' in currentUnit);
      
      if (isMonster) {
        // Monster turn - keep processing flag set and start timeout for monster turn
        this.recursionDepth++;
        this.startTurnTimeout();

        console.log(`[DEBUG] Starting monster turn with ${GAME_CONFIG.COMBAT.MONSTER_TURN_DELAY}ms delay`);
        ErrorHandler.safeCanvasOperation(
          () => {
            setTimeout(() => {
              console.log(`[DEBUG] Monster turn timeout executing after delay`);
              try {
                const result = this.executeMonsterTurn();
                if (result && this.onMessage) {
                  this.onMessage(result);
                }
                console.log(`[DEBUG] Monster turn completed: ${result}`);
                
                // Now proceed to next turn after monster action completes
                console.log(`[DEBUG] Monster turn finished, proceeding to next turn`);
                this.nextTurn();
              } catch (error) {
                ErrorHandler.logError(
                  'Monster turn execution failed',
                  ErrorSeverity.HIGH,
                  'CombatSystem.executeMonsterTurn',
                  error instanceof Error ? error : undefined
                );
                this.recursionDepth = Math.max(0, this.recursionDepth - 1);
                this.resetTurnState();
                this.nextTurn();
              }
            }, GAME_CONFIG.COMBAT.MONSTER_TURN_DELAY);
            return undefined;
          },
          undefined,
          'Combat Timer Setup'
        );
      } else {
        // Player turn - reset state to allow player input
        this.recursionDepth = 0;
        this.isProcessingTurn = false;
        
        // Clear timeout since player can take their time
        if (this.turnTimeoutId !== null) {
          clearTimeout(this.turnTimeoutId);
          this.turnTimeoutId = null;
        }
      }
    } finally {
      // Always reset the flag when nextTurn completes
      this.isCallingNextTurn = false;
      console.log(`[DEBUG] nextTurn() completed`);
    }
  }

  private cleanupDeadUnits(): void {
    if (!this.encounter) return;

    this.encounter.turnOrder = this.encounter.turnOrder.filter(unit => {
      if ('class' in unit) {
        return !unit.isDead;
      } else {
        return unit.hp > 0;
      }
    });

    if (this.encounter.currentTurn >= this.encounter.turnOrder.length) {
      this.encounter.currentTurn = 0;
    }
  }

  private checkCombatEnd(): boolean {
    if (!this.encounter) return true;

    const alivePlayers = this.encounter.turnOrder.filter(unit => 'class' in unit && !unit.isDead);
    const aliveMonsters = this.encounter.monsters.filter(m => m.hp > 0);

    if (alivePlayers.length === 0) {
      this.endCombat(false);
      return true;
    }

    if (aliveMonsters.length === 0) {
      console.log('All monsters defeated! Calculating rewards...');
      console.log('Monsters:', this.encounter.monsters);
      
      const totalExp = this.encounter.monsters.reduce((sum, m) => {
        console.log(`Monster ${m.name} gives ${m.experience} experience`);
        return sum + m.experience;
      }, 0);
      
      const totalGold = this.encounter.monsters.reduce((sum, m) => {
        console.log(`Monster ${m.name} gives ${m.gold} gold`);
        return sum + m.gold;
      }, 0);
      
      console.log(`Total rewards: ${totalExp} experience, ${totalGold} gold`);
      this.endCombat(true, { experience: totalExp, gold: totalGold });
      return true;
    }

    return false;
  }

  private endCombat(victory: boolean, rewards?: { experience: number; gold: number }): void {
    if (this.onCombatEnd) {
      this.onCombatEnd(victory, rewards);
    }
    this.encounter = null;
    this.recursionDepth = 0;
    this.isProcessingTurn = false;
  }

  public getEncounter(): Encounter | null {
    return this.encounter;
  }

  public getCombatStatus(): string {
    if (!this.encounter) return 'No active combat';

    const aliveMonsters = this.encounter.monsters.filter(m => m.hp > 0);
    const alivePlayers = this.encounter.turnOrder.filter(
      unit => 'class' in unit && !unit.isDead
    ).length;

    return `Players: ${alivePlayers} | Monsters: ${aliveMonsters.length}`;
  }
}
