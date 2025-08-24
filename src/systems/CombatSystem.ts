import { Character } from '../entities/Character';
import { Encounter, Monster, Spell, Item } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { InventorySystem } from './InventorySystem';

export class CombatSystem {
  private encounter: Encounter | null = null;
  private onCombatEnd?: (victory: boolean, rewards?: { experience: number; gold: number; items: Item[] }) => void;
  private onMessage?: (message: string) => void;
  private isProcessingTurn: boolean = false; // Prevent simultaneous turn processing

  public startCombat(
    monsters: Monster[],
    party: Character[],
    onCombatEnd: (victory: boolean, rewards?: { experience: number; gold: number; items: Item[] }) => void,
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
    // Reset processing flag
    this.isProcessingTurn = false;
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
    let baseDamage = Math.floor(attacker.stats.strength / 2) + Math.floor(Math.random() * 6) + 1;
    
    // Add weapon damage if equipped
    const weapon = attacker.equipment.weapon;
    if (weapon && weapon.effects) {
      const damageEffect = weapon.effects.find(effect => effect.type === 'damage');
      if (damageEffect) {
        baseDamage += damageEffect.value;
        console.log(`${attacker.name} attacks with ${weapon.name} for +${damageEffect.value} damage!`);
      }
    }
    
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
    if (!this.encounter) {
      this.resetTurnState();
      return;
    }

    // Advance to next turn
    this.encounter.currentTurn = (this.encounter.currentTurn + 1) % this.encounter.turnOrder.length;

    // Remove dead units from turn order
    this.cleanupDeadUnits();

    // Check if combat should end
    if (this.checkCombatEnd()) {
      this.resetTurnState();
      return;
    }

    const currentUnit = this.getCurrentUnit();
    const isMonster = currentUnit && !('class' in currentUnit);
    
    if (isMonster) {
      // Execute monster turn immediately
      const result = this.executeMonsterTurn();
      if (result && this.onMessage) {
        this.onMessage(result);
      }
      
      // Continue to next turn immediately
      this.nextTurn();
    } else {
      // Player turn - reset state to allow player input
      this.isProcessingTurn = false;
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

      const partyLevel = this.getAveragePartyLevel();
      const droppedItems = InventorySystem.generateMonsterLoot(this.encounter.monsters, partyLevel);
      
      console.log(`Total rewards: ${totalExp} experience, ${totalGold} gold, ${droppedItems.length} items`);
      this.endCombat(true, { experience: totalExp, gold: totalGold, items: droppedItems });
      return true;
    }

    return false;
  }

  private getAveragePartyLevel(): number {
    if (!this.encounter) return 1;
    
    const partyMembers = this.encounter.turnOrder.filter(unit => 'class' in unit) as Character[];
    if (partyMembers.length === 0) return 1;
    
    const totalLevel = partyMembers.reduce((sum, character) => sum + character.level, 0);
    return Math.floor(totalLevel / partyMembers.length);
  }

  private endCombat(victory: boolean, rewards?: { experience: number; gold: number; items: Item[] }): void {
    if (this.onCombatEnd) {
      this.onCombatEnd(victory, rewards);
    }
    this.encounter = null;
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

  public forceCheckCombatEnd(): void {
    this.checkCombatEnd();
  }
}
