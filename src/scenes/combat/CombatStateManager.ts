import { GameState, Monster, Item } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { CombatSystem } from '../../systems/CombatSystem';
import { DataLoader } from '../../utils/DataLoader';
import { InventorySystem } from '../../systems/InventorySystem';
import { DebugLogger } from '../../utils/DebugLogger';
import { SaveManager } from '../../utils/SaveManager';
import { GAME_CONFIG } from '../../config/GameConstants';
import { StatusEffectSystem } from '../../systems/StatusEffectSystem';
import { EntityUtils } from '../../utils/EntityUtils';

export type ActionState = 'select_action' | 'select_target' | 'select_spell' | 'spell_target' | 'waiting';

export interface CombatRewards {
  experience: number;
  gold: number;
  items: Item[];
}

export class CombatStateManager {
  private gameState: GameState;
  private combatSystem: CombatSystem;
  private messageLog: any;

  private actionState: ActionState = 'select_action';
  private selectedAction: number = 0;
  private selectedTarget: number = 0;
  private selectedSpell: number = 0;
  private pendingSpellId: string | null = null;
  private isProcessingAction: boolean = false;
  private lastActionTime: number = 0;
  private isProcessingInitialTurns: boolean = false;
  private lastMonsterTurnTime: number = 0;

  private onCombatEndCallback?: (victory: boolean, rewards?: CombatRewards, escaped?: boolean) => void;

  constructor(gameState: GameState, combatSystem: CombatSystem) {
    this.gameState = gameState;
    this.combatSystem = combatSystem;
    this.messageLog = gameState.messageLog;

    if (!this.messageLog) {
      DebugLogger.warn('CombatStateManager', 'MessageLog not found in gameState');
    }
  }

  public getActionState(): ActionState {
    return this.actionState;
  }

  public setActionState(state: ActionState): void {
    this.actionState = state;
  }

  public getSelectedAction(): number {
    return this.selectedAction;
  }

  public setSelectedAction(index: number): void {
    this.selectedAction = index;
  }

  public getSelectedTarget(): number {
    return this.selectedTarget;
  }

  public setSelectedTarget(index: number): void {
    this.selectedTarget = index;
  }

  public getSelectedSpell(): number {
    return this.selectedSpell;
  }

  public setSelectedSpell(index: number): void {
    this.selectedSpell = index;
  }

  public getPendingSpellId(): string | null {
    return this.pendingSpellId;
  }

  public setPendingSpellId(id: string | null): void {
    this.pendingSpellId = id;
  }

  public isProcessing(): boolean {
    return this.isProcessingAction;
  }

  public setProcessing(processing: boolean): void {
    this.isProcessingAction = processing;
  }

  public shouldDebounce(): boolean {
    const now = Date.now();
    return now - this.lastActionTime < 100;
  }

  public updateLastActionTime(): void {
    this.lastActionTime = Date.now();
  }

  public resetSelections(): void {
    this.selectedAction = 0;
    this.selectedTarget = 0;
    this.selectedSpell = 0;
    this.pendingSpellId = null;
  }

  public resetState(): void {
    this.actionState = 'select_action';
    this.selectedAction = 0;
    this.selectedTarget = 0;
    this.selectedSpell = 0;
    this.isProcessingAction = false;
    this.lastActionTime = 0;
    this.pendingSpellId = null;
  }

  public canPlayerAct(): boolean {
    return this.combatSystem.canPlayerAct();
  }

  public setOnCombatEnd(callback: (victory: boolean, rewards?: CombatRewards, escaped?: boolean) => void): void {
    this.onCombatEndCallback = callback;
  }

  public initializeCombat(): void {
    const monsters = this.generateMonsters();
    const aliveCharacters = this.gameState.party.getAliveCharacters();

    this.generateEncounterMessage(monsters);

    this.combatSystem.startCombat(
      monsters,
      aliveCharacters,
      this.gameState.currentFloor,
      (victory: boolean, rewards, escaped) => {
        this.handleCombatEnd(victory, rewards, escaped);
      },
      (message: string) => {
        if (message) {
          this.messageLog.addCombatMessage(message);
        }
      }
    );
  }

  public processInitialMonsterTurns(): void {
    if (!this.combatSystem.canPlayerAct()) {
      this.isProcessingInitialTurns = true;
      this.lastMonsterTurnTime = Date.now();
    }
  }

  public updateMonsterTurns(): boolean {
    if (!this.isProcessingInitialTurns) {
      return false;
    }

    if (this.combatSystem.canPlayerAct()) {
      this.isProcessingInitialTurns = false;
      return false;
    }

    const now = Date.now();
    if (now - this.lastMonsterTurnTime < GAME_CONFIG.COMBAT.MONSTER_TURN_DELAY) {
      return true;
    }

    this.lastMonsterTurnTime = now;
    const currentUnit = this.combatSystem.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isMonster(currentUnit)) {
      this.isProcessingInitialTurns = false;
      return false;
    }

    const monster = currentUnit as Monster;
    const statusSystem = StatusEffectSystem.getInstance();

    if (statusSystem.isDisabled(monster)) {
      const status = statusSystem.hasStatus(monster, 'Sleeping') ? 'asleep' :
                     statusSystem.hasStatus(monster, 'Paralyzed') ? 'paralyzed' :
                     statusSystem.hasStatus(monster, 'Stoned') ? 'petrified' : 'disabled';
      if (this.messageLog) {
        this.messageLog.addCombatMessage(`${monster.name} is ${status} and cannot act!`);
      }
    } else {
      const result = this.combatSystem.executeMonsterTurn();
      if (result && this.messageLog) {
        this.messageLog.addCombatMessage(result);
      }
    }

    this.combatSystem.processNextTurn();

    if (this.combatSystem.canPlayerAct() || this.checkCombatEnd()) {
      this.isProcessingInitialTurns = false;
    }

    return true;
  }

  private checkCombatEnd(): boolean {
    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return true;

    const aliveMonsters = encounter.monsters.filter(m => m.hp > 0);
    const aliveCharacters = this.gameState.party.getAliveCharacters();

    return aliveMonsters.length === 0 || aliveCharacters.length === 0;
  }

  private generateMonsters(): Monster[] {
    const dungeonLevel = this.gameState.currentFloor;
    const partyLevel = this.getAveragePartyLevel();
    return DataLoader.generateMonstersForLevel(dungeonLevel, partyLevel);
  }

  private getAveragePartyLevel(): number {
    const aliveCharacters = this.gameState.party.getAliveCharacters();
    if (aliveCharacters.length === 0) return 1;

    const totalLevel = aliveCharacters.reduce(
      (sum: number, character: any) => sum + character.level,
      0
    );
    return Math.floor(totalLevel / aliveCharacters.length);
  }

  private generateEncounterMessage(monsters: Monster[]): void {
    const monsterCounts = new Map<string, number>();
    monsters.forEach((monster) => {
      const baseName = monster.name.replace(/ \d+$/, '');
      monsterCounts.set(baseName, (monsterCounts.get(baseName) || 0) + 1);
    });

    const monsterTypes = Array.from(monsterCounts.entries());

    const withArticle = (word: string): string => {
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const article = vowels.includes(word[0].toLowerCase()) ? 'an' : 'a';
      return `${article} ${word}`;
    };

    if (monsterTypes.length === 1) {
      const [type, count] = monsterTypes[0];
      if (count === 1) {
        this.messageLog.addCombatMessage(
          `${withArticle(type.toLowerCase()).charAt(0).toUpperCase() + withArticle(type.toLowerCase()).slice(1)} appears!`
        );
      } else {
        this.messageLog.addCombatMessage(`A group of ${count} ${type.toLowerCase()}s appears!`);
      }
    } else {
      const typeList = monsterTypes
        .map(([type, count]) =>
          count === 1 ? withArticle(type.toLowerCase()) : `${count} ${type.toLowerCase()}s`
        )
        .join(', ');
      this.messageLog.addCombatMessage(`A hostile group appears: ${typeList}!`);
    }

    this.gameState.encounterContext = undefined;
  }

  private handleCombatEnd(
    victory: boolean,
    rewards?: { experience: number; gold: number; items: Item[] },
    escaped?: boolean
  ): void {
    try {
      DebugLogger.debug('CombatStateManager', 'handleCombatEnd called', { victory, rewards });

      this.isProcessingAction = false;

      if (victory && rewards) {
        this.messageLog.addSystemMessage(
          `Victory! Gained ${rewards.experience} experience and ${rewards.gold} gold!`
        );

        DebugLogger.debug('CombatStateManager', 'Distributing rewards to party...');
        this.gameState.party.distributeExperience(rewards.experience);
        this.gameState.party.distributeGold(rewards.gold);

        if (rewards.items && rewards.items.length > 0) {
          this.messageLog.addSystemMessage(`Found ${rewards.items.length} item(s)!`);
          rewards.items.forEach((item) => {
            this.messageLog.addSystemMessage(
              `- ${item.identified ? item.name : item.unidentifiedName || '?Item'}`
            );
          });

          this.gameState.pendingLoot = rewards.items;
        }

        DebugLogger.debug('CombatStateManager', 'Rewards distributed successfully');
      } else if (escaped) {
        this.messageLog.addSystemMessage('Successfully ran away!');
      } else {
        this.messageLog.addDeathMessage('Defeated...');
      }

      SaveManager.saveGame(this.gameState, this.gameState.playtimeSeconds || 0);
      DebugLogger.debug('CombatStateManager', 'Game saved after combat');

      if (this.onCombatEndCallback) {
        this.onCombatEndCallback(victory, rewards, escaped);
      }
    } catch (error) {
      DebugLogger.error('CombatStateManager', 'Error in handleCombatEnd', error);
      this.messageLog.addWarningMessage('Error processing combat results');
      this.isProcessingAction = false;

      if (this.onCombatEndCallback) {
        this.onCombatEndCallback(false, undefined, false);
      }
    }
  }

  public checkPartyWiped(): boolean {
    if (this.gameState.party.isWiped()) {
      this.messageLog.addDeathMessage('Party defeated!');
      this.isProcessingAction = false;
      this.handleCombatEnd(false, undefined, false);
      return true;
    }
    return false;
  }

  public updateForPlayerTurn(): void {
    const canPlayerAct = this.combatSystem.canPlayerAct();
    if (canPlayerAct && this.actionState === 'waiting') {
      this.actionState = 'select_action';
      this.isProcessingAction = false;
    }
  }

  public getDebugData(): any {
    const lootData = InventorySystem.getLootDebugData();
    const combatData = CombatSystem.getCombatDebugData();

    const totalLuck = this.gameState.party.characters.reduce(
      (sum: number, char: Character) => sum + char.stats.luck,
      0
    );
    const averageLevel =
      this.gameState.party.characters.reduce(
        (sum: number, char: Character) => sum + char.level,
        0
      ) / this.gameState.party.characters.length;

    return {
      lootSystem: lootData,
      partyStats: {
        totalLuck,
        luckMultiplier: lootData.luckMultiplier,
        averageLevel,
      },
      combatSystem: combatData,
    };
  }

  public getTestState(): any {
    return {
      actionState: this.actionState,
      currentUnit: this.combatSystem.getCurrentUnit(),
      monsters: this.combatSystem.getMonsters(),
      party: this.combatSystem.getParty(),
      selectedAction: this.selectedAction,
      selectedTarget: this.selectedTarget,
      selectedSpell: this.selectedSpell,
      isProcessingAction: this.isProcessingAction,
      pendingSpellId: this.pendingSpellId
    };
  }
}
