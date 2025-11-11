import { Character } from '../entities/Character';
import { Encounter, Item, Monster, CharacterStatus } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { DebugLogger } from '../utils/DebugLogger';
import { SpellCaster } from './magic/SpellCaster';
import { SpellCastingContext, SpellId } from '../types/SpellTypes';
import { DiceRoller } from '../utils/DiceRoller';
import { EntityUtils } from '../utils/EntityUtils';
import { StatusEffectSystem } from './StatusEffectSystem';
import { ModifierSystem } from './ModifierSystem';
import { GameServices } from '../services/GameServices';

interface CombatDebugData {
  currentTurn: string;
  turnOrder: string[];
  escapeChances: { name: string; chance: number }[];
  isActive: boolean;
}

export class CombatSystem {
  private encounter: Encounter | null = null;
  private dungeonLevel: number = 1;
  private party: Character[] = [];
  private spellCaster: SpellCaster;
  private statusEffectSystem: StatusEffectSystem;
  private modifierSystem: ModifierSystem;
  private onCombatEnd?: (
    victory: boolean,
    rewards?: { experience: number; gold: number; items: Item[] },
    escaped?: boolean
  ) => void;
  private onMessage?: (message: string) => void;
  private isProcessingTurn: boolean = false;

  private static debugData: CombatDebugData = {
    currentTurn: '',
    turnOrder: [],
    escapeChances: [],
    isActive: false,
  };

  constructor(spellCaster?: SpellCaster, statusEffectSystem?: StatusEffectSystem) {
    this.spellCaster = spellCaster || SpellCaster.getInstance();
    this.statusEffectSystem = statusEffectSystem || StatusEffectSystem.getInstance();
    this.modifierSystem = ModifierSystem.getInstance();
  }

  public startCombat(
    monsters: Monster[],
    party: Character[],
    dungeonLevel: number,
    onCombatEnd: (
      victory: boolean,
      rewards?: { experience: number; gold: number; items: Item[] },
      escaped?: boolean
    ) => void,
    onMessage?: (message: string) => void
  ): void {
    this.onCombatEnd = onCombatEnd;
    this.onMessage = onMessage;
    this.dungeonLevel = dungeonLevel;
    this.party = party;
    this.resetTurnState();

    this.encounter = {
      monsters: monsters,
      surprise: Math.random() < GAME_CONFIG.ENCOUNTER.SURPRISE_CHANCE,
      turnOrder: this.calculateTurnOrder(party, monsters),
      currentTurn: 0,
    };

    if (this.encounter.surprise) {
      this.encounter.turnOrder = this.encounter.turnOrder.filter((unit) => EntityUtils.isCharacter(unit as Character | Monster));
    }

    // Update debug data
    this.updateCombatDebugData();
  }

  private resetTurnState(): void {
    // Reset processing flag
    this.isProcessingTurn = false;
  }

  private calculateTurnOrder(party: Character[], monsters: Monster[]): (Character | Monster)[] {
    const allUnits: (Character | Monster)[] = [...party.filter((c) => !c.isDead), ...monsters];

    return allUnits.sort((a, b) => {
      const aAgility = 'stats' in a ? a.stats.agility : 10;
      const bAgility = 'stats' in b ? b.stats.agility : 10;
      return bAgility - aAgility + (Math.random() - 0.5) * 2;
    });
  }

  public getCurrentUnit(): Character | Monster | null {
    if (!this.encounter) return null;
    return this.encounter.turnOrder[this.encounter.currentTurn] as Character | Monster || null;
  }

  public getMonsters(): Monster[] {
    return this.encounter?.monsters || [];
  }

  public getParty(): Character[] {
    return this.party || [];
  }

  public canPlayerAct(): boolean {
    const currentUnit = this.getCurrentUnit();
    return currentUnit !== null && EntityUtils.isCharacter(currentUnit);
  }

  public getPlayerOptions(): string[] {
    const currentUnit = this.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) return [];

    const options = ['Attack', 'Defend', 'Use Item', 'Escape'];

    if (currentUnit.spells.length > 0 && currentUnit.mp > 0) {
      options.push('Cast Spell');
    }

    return options;
  }

  public executePlayerAction(action: string, targetIndex?: number, spellId?: string, target?: Character | Monster): string {
    const currentUnit = this.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit) || !this.encounter) {
      return 'Invalid action';
    }

    // Prevent multiple simultaneous actions
    if (this.isProcessingTurn) {
      DebugLogger.debug('CombatSystem', 'Action rejected - already processing turn');
      return 'Action already in progress';
    }

    DebugLogger.info('CombatSystem', 'Executing player action', {
      action,
      currentUnit: currentUnit.name,
      currentTurnIndex: this.encounter.currentTurn,
      targetIndex,
      spellId
    });

    this.isProcessingTurn = true;

    let result = '';

    switch (action) {
      case 'Attack':
        result = this.executeAttack(currentUnit, targetIndex);
        break;
      case 'Cast Spell':
        result = this.executeCastSpell(currentUnit, spellId, target);
        break;
      case 'Defend':
        result = `${currentUnit.name} defends!`;
        break;
      case 'Use Item':
        result = `${currentUnit.name} uses an item!`;
        break;
      case 'Escape':
        if (this.attemptEscape(currentUnit)) {
          this.isProcessingTurn = false;
          this.endCombat(false, undefined, true); // Pass escaped = true
          return `${currentUnit.name} successfully leads the party to safety!`;
        } else {
          result = `${currentUnit.name} could not escape!`;
        }
        break;
      default:
        result = 'Invalid action';
    }

    this.isProcessingTurn = false;

    return result;
  }

  private executeAttack(attacker: Character, targetIndex?: number): string {
    if (!this.encounter) return 'No active combat';

    const aliveMonsters = this.encounter.monsters.filter((m) => m.hp > 0);
    if (aliveMonsters.length === 0) return 'No targets available';

    const target =
      targetIndex !== undefined && targetIndex < aliveMonsters.length
        ? aliveMonsters[targetIndex]
        : aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];

    const damage = this.calculateDamage(attacker, target);
    target.hp = Math.max(0, target.hp - damage);

    let result = `${attacker.name} attacks ${target.name} for ${damage} damage!`;

    const weapon = attacker.equipment.weapon;
    if (weapon?.onHitEffect && target.hp > 0) {
      const roll = Math.random();
      if (roll < weapon.onHitEffect.chance) {
        const effectApplied = this.applyWeaponEffect(attacker, target, weapon);
        if (effectApplied) {
          result += ` ${effectApplied}`;
        }
      }
    }

    if (target.hp === 0) {
      target.isDead = true;
      result += ` ${target.name} is defeated!`;
      this.cleanupDeadUnits();
    }

    return result;
  }

  private applyWeaponEffect(attacker: Character, target: Monster, weapon: Item): string | null {
    if (!weapon.onHitEffect) return null;

    const statusType = weapon.onHitEffect.statusType;
    const duration = weapon.onHitEffect.duration;

    DebugLogger.info('CombatSystem', `${weapon.name} triggers on-hit effect`, {
      attacker: attacker.name,
      target: target.name,
      effect: statusType,
      duration
    });

    const applied = this.statusEffectSystem.applyStatusEffect(target, statusType, {
      duration,
      source: weapon.name,
      ignoreResistance: false
    });

    if (applied) {
      return `${target.name} is afflicted by ${this.getStatusEffectName(statusType)}!`;
    } else {
      return `${target.name} resisted ${this.getStatusEffectName(statusType)}!`;
    }
  }

  private getStatusEffectName(status: CharacterStatus): string {
    const names: Record<CharacterStatus, string> = {
      'OK': 'OK',
      'Dead': 'death',
      'Ashed': 'ashes',
      'Lost': 'lost',
      'Paralyzed': 'paralysis',
      'Stoned': 'petrification',
      'Poisoned': 'poison',
      'Sleeping': 'sleep',
      'Silenced': 'silence',
      'Blinded': 'blindness',
      'Confused': 'confusion',
      'Afraid': 'fear',
      'Charmed': 'charm',
      'Berserk': 'berserk',
      'Blessed': 'blessing',
      'Cursed': 'curse'
    };
    return names[status] || status.toLowerCase();
  }

  private executeCastSpell(caster: Character, spellId?: string, selectedTarget?: Character | Monster): string {
    if (!this.encounter || !spellId) return 'Invalid spell';

    const aliveMonsters = this.encounter.monsters.filter((m) => {
      return !m.isDead && m.hp > 0;
    });
    const aliveParty = this.party.filter(c => !c.isDead);

    const spell = caster.getKnownSpells().find(s => s === spellId);

    if (!spell) return 'Spell not found';

    const spellData = this.spellCaster['registry'].getSpellById(spellId as SpellId);
    if (!spellData) return 'Invalid spell';

    let target: Character | Monster | undefined;

    if (selectedTarget) {
      // Use the target entity directly if provided
      target = selectedTarget;
    } else if (spellData.targetType === 'self') {
      target = caster;
    } else {
      // Fallback for any cases without explicit target
      if (spellData.targetType === 'enemy' && aliveMonsters.length > 0) {
        target = aliveMonsters[0];
      } else if (spellData.targetType === 'ally') {
        target = caster;
      }
    }

    const context: SpellCastingContext = {
      casterId: caster.id,
      caster: caster,
      target: target,
      party: aliveParty,
      enemies: aliveMonsters,
      inCombat: true
    };

    DebugLogger.debug('CombatSystem', 'Casting spell with context', {
      spell: spellId,
      enemyIds: aliveMonsters.map((m: any) => m.id || 'no-id'),
      enemyNames: aliveMonsters.map(m => m.name)
    });

    const result = this.spellCaster.castSpell(caster, spellId, context);

    this.cleanupDeadUnits();

    if (result.success) {
      return result.messages.join(' ');
    } else {
      return result.messages[0] || 'Spell failed';
    }
  }


  public executeMonsterTurn(): string {
    const currentUnit = this.getCurrentUnit();
    if (!currentUnit || !this.encounter) {
      // Silently skip if no unit or encounter
      this.resetTurnState();
      return '';
    }

    if (EntityUtils.isCharacter(currentUnit)) {
      // It's a player's turn, not a monster's - reset flag and skip
      this.isProcessingTurn = false;
      return '';
    }

    const monster = currentUnit;

    if (monster.hp <= 0 || monster.isDead) {
      DebugLogger.debug('CombatSystem', 'Monster is dead, skipping turn', {
        name: monster.name,
        hp: monster.hp,
        isDead: monster.isDead
      });
      this.isProcessingTurn = false;
      return '';
    }

    if (this.statusEffectSystem.isDisabled(monster)) {
      const status = this.statusEffectSystem.hasStatus(monster, 'Sleeping') ? 'asleep' :
                     this.statusEffectSystem.hasStatus(monster, 'Paralyzed') ? 'paralyzed' :
                     this.statusEffectSystem.hasStatus(monster, 'Stoned') ? 'petrified' : 'disabled';
      DebugLogger.info('CombatSystem', `${monster.name} is ${status}, cannot act`);
      this.isProcessingTurn = false;
      return `${monster.name} is ${status} and cannot act!`;
    }

    const alivePlayers = this.encounter.turnOrder.filter(
      (unit) => EntityUtils.isCharacter(unit as Character | Monster) && !unit.isDead
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

      let message = `${monster.name} uses ${attack.name} on ${target.name} for ${damage} damage!`;

      if (attack.effect && !target.isDead) {
        const effectType = this.mapMonsterEffectToStatus(attack.effect);
        if (effectType) {
          const applied = this.statusEffectSystem.applyStatusEffect(target, effectType, {
            ignoreResistance: false
          });

          if (applied) {
            message += ` ${target.name} is ${this.getEffectDescription(attack.effect)}!`;
          }
        }
      }

      return message;
    } else {
      return `${monster.name} attacks ${target.name} but misses!`;
    }
  }

  private mapMonsterEffectToStatus(effect: string): CharacterStatus | null {
    const effectMap: Record<string, CharacterStatus> = {
      'poison': 'Poisoned',
      'paralysis': 'Paralyzed',
      'sleep': 'Sleeping',
      'petrify': 'Stoned',
      'afraid': 'Afraid'
    };
    return effectMap[effect.toLowerCase()] || null;
  }

  private getEffectDescription(effect: string): string {
    const descriptions: Record<string, string> = {
      'poison': 'poisoned',
      'paralysis': 'paralyzed',
      'sleep': 'put to sleep',
      'petrify': 'turned to stone',
      'afraid': 'frightened'
    };
    return descriptions[effect.toLowerCase()] || effect;
  }

  private calculateDamage(attacker: Character, target: Monster): number {
    let baseDamage = Math.floor(attacker.stats.strength / 2) + Math.floor(Math.random() * 6) + 1;

    // Add weapon damage if equipped
    const weapon = attacker.equipment.weapon;
    if (weapon && weapon.effects) {
      const damageEffect = weapon.effects.find((effect) => effect.type === 'damage');
      if (damageEffect && damageEffect.type === 'damage') {
        baseDamage += damageEffect.value;
        DebugLogger.info(
          'CombatSystem',
          `${attacker.name} attacks with ${weapon.name} for +${damageEffect.value} damage!`
        );
      }
    }

    const attackBonus = attacker.effectiveAttack - Math.floor(attacker.level / 2);
    const damageBonus = attacker.effectiveDamage;
    baseDamage += attackBonus + damageBonus;

    const defense = Math.floor(target.ac / 2);
    return Math.max(1, baseDamage - defense);
  }

  private rollDamage(damageString: string): number {
    return DiceRoller.roll(damageString);
  }

  private attemptEscape(character: Character): boolean {
    if (!this.encounter) return false;

    // Base escape chance is 50%
    let escapeChance = 0.5;

    // Character agility affects escape chance
    // Higher agility = better escape chance
    const agilityBonus = (character.stats.agility - 10) * 0.02; // +/-2% per point above/below 10
    escapeChance = Math.max(0.1, Math.min(0.9, escapeChance + agilityBonus));

    const success = Math.random() < escapeChance;

    DebugLogger.info(
      'CombatSystem',
      `${character.name} attempts escape: ${Math.round(escapeChance * 100)}% chance, ${success ? 'SUCCESS' : 'FAILED'}`
    );

    return success;
  }

  private nextTurn(): void {
    if (!this.encounter) {
      this.resetTurnState();
      return;
    }

    // Advance to next turn
    const previousTurn = this.encounter.currentTurn;
    this.encounter.currentTurn = (this.encounter.currentTurn + 1) % this.encounter.turnOrder.length;

    const nextUnit = this.encounter.turnOrder[this.encounter.currentTurn];
    DebugLogger.debug('CombatSystem', 'Turn advanced', {
      previousTurn,
      newTurn: this.encounter.currentTurn,
      nextUnit: nextUnit ? EntityUtils.getName(nextUnit as Character | Monster) : 'none',
      nextUnitId: nextUnit ? nextUnit.id || 'no-id' : 'none'
    });

    // Remove dead units from turn order
    this.cleanupDeadUnits();

    // Check if combat should end
    if (this.checkCombatEnd()) {
      this.resetTurnState();
      return;
    }

    const currentUnit = this.getCurrentUnit();

    if (currentUnit && EntityUtils.isCharacter(currentUnit)) {
      this.statusEffectSystem.tick(currentUnit, 'combat');
      this.modifierSystem.tick(currentUnit, 'combat');

      if (currentUnit.isDead) {
        this.cleanupDeadUnits();
        if (this.checkCombatEnd()) {
          this.resetTurnState();
          return;
        }
        this.nextTurn();
        return;
      }
    }

    if (currentUnit && EntityUtils.isMonster(currentUnit)) {
      const monster = currentUnit as Monster;
      this.statusEffectSystem.tick(monster, 'combat');

      if (monster.isDead || monster.hp <= 0) {
        this.cleanupDeadUnits();
        if (this.checkCombatEnd()) {
          this.resetTurnState();
          return;
        }
        this.nextTurn();
        return;
      }
    }

    this.isProcessingTurn = false;
    this.updateCombatDebugData();
  }

  private cleanupDeadUnits(): void {
    if (!this.encounter) return;

    this.encounter.turnOrder = this.encounter.turnOrder.filter((unit) => {
      if (EntityUtils.isCharacter(unit as Character | Monster)) {
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

    const alivePlayers = this.encounter.turnOrder.filter((unit) => EntityUtils.isCharacter(unit as Character | Monster) && !unit.isDead);
    const aliveMonsters = this.encounter.monsters.filter((m) => m.hp > 0);

    if (alivePlayers.length === 0) {
      this.endCombat(false);
      return true;
    }

    if (aliveMonsters.length === 0) {
      DebugLogger.info('CombatSystem', 'All monsters defeated! Calculating rewards...', {
        monsters: this.encounter.monsters,
      });

      const totalExp = this.encounter.monsters.reduce((sum, m) => {
        DebugLogger.debug('CombatSystem', `Monster ${m.name} gives ${m.experience} experience`);
        return sum + m.experience;
      }, 0);

      const totalGold = this.encounter.monsters.reduce((sum, m) => {
        DebugLogger.debug('CombatSystem', `Monster ${m.name} gives ${m.gold} gold`);
        return sum + m.gold;
      }, 0);

      const partyLevel = this.getAveragePartyLevel();
      const lootGenerator = GameServices.getInstance().getLootGenerator();
      const droppedItems = lootGenerator.generateMonsterLoot(
        this.encounter.monsters,
        partyLevel,
        this.dungeonLevel,
        this.party
      );

      DebugLogger.info(
        'CombatSystem',
        `Total rewards: ${totalExp} experience, ${totalGold} gold, ${droppedItems.length} items`
      );
      this.endCombat(true, { experience: totalExp, gold: totalGold, items: droppedItems });
      return true;
    }

    return false;
  }

  private getAveragePartyLevel(): number {
    if (!this.encounter) return 1;

    const partyMembers = this.encounter.turnOrder.filter((unit) => EntityUtils.isCharacter(unit as Character | Monster)) as Character[];
    if (partyMembers.length === 0) return 1;

    const totalLevel = partyMembers.reduce((sum, character) => sum + character.level, 0);
    return Math.floor(totalLevel / partyMembers.length);
  }

  private endCombat(
    victory: boolean,
    rewards?: { experience: number; gold: number; items: Item[] },
    escaped?: boolean
  ): void {
    if (this.onCombatEnd) {
      this.onCombatEnd(victory, rewards, escaped);
    }
    this.encounter = null;
    this.isProcessingTurn = false;

    // Update debug data to reflect combat ended
    CombatSystem.debugData = {
      currentTurn: '',
      turnOrder: [],
      escapeChances: [],
      isActive: false,
    };
  }

  public getEncounter(): Encounter | null {
    return this.encounter;
  }

  public getCombatStatus(): string {
    if (!this.encounter) return 'No active combat';

    const aliveMonsters = this.encounter.monsters.filter((m) => m.hp > 0);
    const alivePlayers = this.encounter.turnOrder.filter(
      (unit) => EntityUtils.isCharacter(unit as Character | Monster) && !unit.isDead
    ).length;

    return `Players: ${alivePlayers} | Monsters: ${aliveMonsters.length}`;
  }

  public forceCheckCombatEnd(): void {
    this.checkCombatEnd();
  }

  public processTurnsUntilPlayer(): void {
    if (!this.encounter) return;

    while (!this.canPlayerAct() && this.encounter) {
      const currentUnit = this.getCurrentUnit();
      if (!currentUnit || EntityUtils.isCharacter(currentUnit)) break;

      const result = this.executeMonsterTurn();
      if (result && this.onMessage) {
        this.onMessage(result);
      }

      this.nextTurn();

      if (this.checkCombatEnd()) break;
    }
  }

  public processNextTurn(): void {
    if (!this.encounter) return;
    this.nextTurn();
  }

  private updateCombatDebugData(): void {
    const currentUnit = this.getCurrentUnit();
    const currentTurnName = currentUnit
      ? EntityUtils.isCharacter(currentUnit)
        ? currentUnit.name
        : currentUnit.name
      : 'No active unit';

    const turnOrderNames =
      this.encounter?.turnOrder.map((unit) =>
        EntityUtils.isCharacter(unit as Character | Monster) ? `${unit.name} (${(unit as Character).class})` : unit.name
      ) || [];

    CombatSystem.debugData = {
      currentTurn: currentTurnName,
      turnOrder: turnOrderNames,
      escapeChances: this.calculateEscapeChances(),
      isActive: this.encounter !== null,
    };
  }

  private calculateEscapeChances(): { name: string; chance: number }[] {
    if (!this.encounter) return [];

    const partyMembers = this.encounter.turnOrder.filter((unit) => EntityUtils.isCharacter(unit as Character | Monster)) as Character[];
    return partyMembers.map((char) => {
      let escapeChance = 0.5;
      const agilityBonus = (char.stats.agility - 10) * 0.02;
      escapeChance = Math.max(0.1, Math.min(0.9, escapeChance + agilityBonus));

      return {
        name: char.name,
        chance: escapeChance,
      };
    });
  }

  public static getCombatDebugData(): CombatDebugData {
    return { ...CombatSystem.debugData };
  }
}
