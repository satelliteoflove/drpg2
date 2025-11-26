import { GameState, Item, Monster } from '../../types/GameTypes';
import { CombatRewards } from '../../scenes/combat/CombatStateManager';

export type CombatResultsState = 'summary' | 'loot';

export interface DefeatedMonsterSummary {
  name: string;
  count: number;
  totalXp: number;
  totalGold: number;
}

export interface CombatResultsStateContext {
  currentState: CombatResultsState;
  selectedOption: number;
  rewards: CombatRewards | null;
  defeatedMonsters: DefeatedMonsterSummary[];
  totalXp: number;
  totalGold: number;
  items: Item[];
  levelUpCharacters: string[];
}

export class CombatResultsStateManager {
  private gameState: GameState;
  public currentState: CombatResultsState = 'summary';
  public selectedOption: number = 0;
  public rewards: CombatRewards | null = null;
  public defeatedMonsters: DefeatedMonsterSummary[] = [];
  public levelUpCharacters: string[] = [];

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public reset(): void {
    this.currentState = 'summary';
    this.selectedOption = 0;
    this.rewards = null;
    this.defeatedMonsters = [];
    this.levelUpCharacters = [];
  }

  public setRewards(rewards: CombatRewards, monsters: Monster[]): void {
    this.rewards = rewards;
    this.defeatedMonsters = this.aggregateMonsters(monsters);
    this.checkForPendingLevelUps();
  }

  private aggregateMonsters(monsters: Monster[]): DefeatedMonsterSummary[] {
    const monsterMap = new Map<string, DefeatedMonsterSummary>();

    monsters.forEach(monster => {
      const baseName = monster.name.replace(/ \d+$/, '');
      const existing = monsterMap.get(baseName);

      if (existing) {
        existing.count++;
        existing.totalXp += monster.experience;
        existing.totalGold += monster.gold;
      } else {
        monsterMap.set(baseName, {
          name: baseName,
          count: 1,
          totalXp: monster.experience,
          totalGold: monster.gold
        });
      }
    });

    return Array.from(monsterMap.values());
  }

  private checkForPendingLevelUps(): void {
    this.levelUpCharacters = [];
    const characters = this.gameState.party.characters || [];

    characters.forEach((char: any) => {
      if (!char.isDead && char.pendingLevelUp) {
        this.levelUpCharacters.push(char.name);
      }
    });
  }

  public getStateContext(): CombatResultsStateContext {
    return {
      currentState: this.currentState,
      selectedOption: this.selectedOption,
      rewards: this.rewards,
      defeatedMonsters: this.defeatedMonsters,
      totalXp: this.rewards?.experience || 0,
      totalGold: this.rewards?.gold || 0,
      items: this.rewards?.items || [],
      levelUpCharacters: this.levelUpCharacters
    };
  }

  public setState(state: CombatResultsState): void {
    this.currentState = state;
    this.selectedOption = 0;
  }

  public hasLoot(): boolean {
    return (this.rewards?.items?.length || 0) > 0;
  }
}
