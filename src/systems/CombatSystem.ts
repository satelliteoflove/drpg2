import { Character } from '../entities/Character';
import { Encounter, Item, Monster, CharacterStatus } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { DebugLogger } from '../utils/DebugLogger';
import { SpellCaster } from './magic/SpellCaster';
import { DiceRoller } from '../utils/DiceRoller';
import { EntityUtils } from '../utils/EntityUtils';
import { StatusEffectSystem } from './StatusEffectSystem';
import { ModifierSystem } from './ModifierSystem';
import { GameServices } from '../services/GameServices';
import { CombatActionRegistry } from './combat/actions/CombatActionRegistry';
import { CombatActionContext, CombatActionParams } from './combat/actions/CombatAction';
import { DamageCalculator } from './combat/helpers/DamageCalculator';
import { WeaponEffectApplicator } from './combat/helpers/WeaponEffectApplicator';
import { BanterEventTracker } from '../types/BanterTypes';
import { SFX_CATALOG } from '../config/AudioConstants';
import { InitiativeTracker } from './InitiativeTracker';
import { InitiativeSnapshot, GhostSimulationResult } from '../types/InitiativeTypes';
import { INITIATIVE, calculateAttackChargeTime } from '../config/InitiativeConstants';

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
  private actionRegistry: CombatActionRegistry;
  private damageCalculator: DamageCalculator;
  private weaponEffectApplicator: WeaponEffectApplicator;
  private initiativeTracker: InitiativeTracker;
  private onCombatEnd?: (
    victory: boolean,
    rewards?: { experience: number; gold: number; items: Item[] },
    escaped?: boolean
  ) => void;
  private onMessage?: (message: string) => void;
  private isProcessingTurn: boolean = false;
  private eventTracker: BanterEventTracker | null = null;

  private static debugData: CombatDebugData = {
    currentTurn: '',
    turnOrder: [],
    escapeChances: [],
    isActive: false,
  };

  constructor(
    spellCaster?: SpellCaster,
    statusEffectSystem?: StatusEffectSystem,
    modifierSystem?: ModifierSystem,
    actionRegistry?: CombatActionRegistry
  ) {
    this.spellCaster = spellCaster || SpellCaster.getInstance();
    this.statusEffectSystem = statusEffectSystem || StatusEffectSystem.getInstance();
    this.modifierSystem = modifierSystem || ModifierSystem.getInstance();
    this.actionRegistry = actionRegistry || new CombatActionRegistry();
    this.damageCalculator = new DamageCalculator();
    this.weaponEffectApplicator = new WeaponEffectApplicator(this.statusEffectSystem);
    this.initiativeTracker = new InitiativeTracker();

    try {
      this.eventTracker = GameServices.getInstance().getBanterEventTracker();
    } catch (e) {
      DebugLogger.warn('CombatSystem', 'BanterEventTracker not available');
    }
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

    const surprised = Math.random() < GAME_CONFIG.ENCOUNTER.SURPRISE_CHANCE;

    const activeCharacters = party.filter(c => !c.isDead);
    const activeMonsters = monsters.filter(m => m.hp > 0);

    this.initiativeTracker.initialize(activeCharacters, activeMonsters, surprised);

    this.encounter = {
      monsters: monsters,
      surprise: surprised,
      turnOrder: this.calculateTurnOrder(party, monsters),
      currentTurn: 0,
      initiative: this.initiativeTracker.getSnapshot(),
    };

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
    const entity = this.initiativeTracker.getChoosingEntity();
    return entity as Character | Monster || null;
  }

  private updateInitiative(entityId: string, chargeTime: number): void {
    this.initiativeTracker.assignChargeTime(entityId, chargeTime);
    if (this.encounter) {
      this.encounter.initiative = this.initiativeTracker.getSnapshot();
    }
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

    const combatAction = this.actionRegistry.get(action);
    if (!combatAction) {
      return 'Invalid action';
    }

    const context: CombatActionContext = {
      encounter: this.encounter,
      party: this.party,
      spellCaster: this.spellCaster,
      statusEffectSystem: this.statusEffectSystem,
      modifierSystem: this.modifierSystem,
      damageCalculator: this.damageCalculator,
      weaponEffectApplicator: this.weaponEffectApplicator,
      getCurrentUnit: () => this.getCurrentUnit(),
      cleanupDeadUnits: () => this.cleanupDeadUnits(),
      endCombat: (victory, rewards, escaped) => this.endCombat(victory, rewards, escaped)
    };

    const params: CombatActionParams = {
      targetIndex,
      spellId,
      target
    };

    if (!combatAction.canExecute(context, params)) {
      return `Cannot execute ${action}`;
    }

    this.isProcessingTurn = true;

    const result = combatAction.execute(context, params);

    if (result.delay > 0) {
      this.updateInitiative(currentUnit.id, result.delay);
    }

    this.isProcessingTurn = false;

    if (result.shouldEndCombat) {
      this.endCombat(
        result.shouldEndCombat.victory,
        result.shouldEndCombat.rewards,
        result.shouldEndCombat.escaped
      );
    }

    return result.message;
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
      this.updateInitiative(monster.id, INITIATIVE.BASE_CHARGE_TIMES.SKIP_TURN);
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

    const monsterAgility = monster.agility ?? INITIATIVE.DEFAULT_MONSTER_AGILITY;
    const monsterChargeTime = calculateAttackChargeTime(monsterAgility, 'standard');

    if (Math.random() < attack.chance) {
      const damage = this.rollDamage(attack.damage);
      target.takeDamage(damage);
      GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.COMBAT.PARTY_DAMAGE);

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

      this.updateInitiative(monster.id, monsterChargeTime);

      return message;
    } else {
      this.updateInitiative(monster.id, monsterChargeTime);
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

  private rollDamage(damageString: string): number {
    return DiceRoller.roll(damageString);
  }

  private nextTurn(): void {
    if (!this.encounter) {
      this.resetTurnState();
      return;
    }

    this.cleanupDeadUnits();

    if (this.checkCombatEnd()) {
      this.resetTurnState();
      return;
    }

    const nextActor = this.initiativeTracker.advanceUntilChoice();

    if (!nextActor) {
      DebugLogger.warn('CombatSystem', 'No next actor found in initiative tracker');
      this.resetTurnState();
      return;
    }

    DebugLogger.debug('CombatSystem', 'Turn advanced via initiative', {
      nextActorId: nextActor.id,
      nextActorName: EntityUtils.getName(nextActor as Character | Monster),
    });

    this.encounter.initiative = this.initiativeTracker.getSnapshot();

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
      const isDead = EntityUtils.isCharacter(unit as Character | Monster)
        ? unit.isDead
        : unit.hp <= 0;

      if (isDead) {
        this.initiativeTracker.removeEntity(unit.id);

        if (EntityUtils.isCharacter(unit as Character | Monster) && this.eventTracker) {
          this.eventTracker.recordCharacterDeath(unit.name);
          DebugLogger.info('CombatSystem', 'Character death detected and recorded', {
            characterName: unit.name
          });
        }
        return false;
      }
      return true;
    });

    if (this.encounter.currentTurn >= this.encounter.turnOrder.length) {
      this.encounter.currentTurn = 0;
    }

    this.encounter.initiative = this.initiativeTracker.getSnapshot();
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

      if (this.eventTracker) {
        const monsterNames = this.encounter.monsters.map(m => m.name).join(', ');
        this.eventTracker.recordCombatVictory(`Defeated ${this.encounter.monsters.length} monsters: ${monsterNames}`);
        DebugLogger.info('CombatSystem', 'Combat victory recorded', {
          monstersDefeated: this.encounter.monsters.length,
          monsterNames
        });
      }

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
    this.initiativeTracker.reset();

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

  public getInitiativeSnapshot(): InitiativeSnapshot | null {
    if (!this.encounter) return null;
    return this.initiativeTracker.getSnapshot();
  }

  public simulateGhostPosition(chargeTime: number): GhostSimulationResult {
    return this.initiativeTracker.simulateGhostPosition(chargeTime);
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

  public applySkipTurnDelay(entityId: string): void {
    this.updateInitiative(entityId, INITIATIVE.BASE_CHARGE_TIMES.SKIP_TURN);
  }

  public getActionDelays(): Map<string, number> {
    const delays = new Map<string, number>();
    if (!this.encounter) return delays;

    const context: CombatActionContext = {
      encounter: this.encounter,
      party: this.party,
      spellCaster: this.spellCaster,
      statusEffectSystem: this.statusEffectSystem,
      modifierSystem: this.modifierSystem,
      damageCalculator: this.damageCalculator,
      weaponEffectApplicator: this.weaponEffectApplicator,
      getCurrentUnit: () => this.getCurrentUnit(),
      cleanupDeadUnits: () => this.cleanupDeadUnits(),
      endCombat: (victory, rewards, escaped) => this.endCombat(victory, rewards, escaped)
    };

    const actionNames = ['Attack', 'Defend', 'Use Item', 'Escape', 'Cast Spell'];
    for (const name of actionNames) {
      const action = this.actionRegistry.get(name);
      if (action) {
        delays.set(name, action.getDelay(context, {}));
      }
    }

    return delays;
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
