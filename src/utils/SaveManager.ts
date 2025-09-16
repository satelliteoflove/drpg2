import { GameState, Character as ICharacter } from '../types/GameTypes';
import { DebugLogger } from './DebugLogger';

export interface SaveData {
  version: string;
  gameState: GameState;
  saveDate: number;
  playtimeSeconds: number;
}

export class SaveManager {
  private static readonly SAVE_KEY = 'drpg2_save';
  private static readonly VERSION = '1.0.0';
  private static readonly MAX_SAVES = 5;

  public static saveGame(gameState: GameState, playtimeSeconds: number): boolean {
    try {
      const saveData: SaveData = {
        version: this.VERSION,
        gameState: this.sanitizeGameState(gameState),
        saveDate: Date.now(),
        playtimeSeconds,
      };

      const serialized = JSON.stringify(saveData);
      localStorage.setItem(this.SAVE_KEY, serialized);

      this.addToSaveHistory(saveData);
      return true;
    } catch (error) {
      DebugLogger.error('SaveManager', 'Failed to save game', error);
      return false;
    }
  }

  public static loadGame(): SaveData | null {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) return null;

      const saveData: SaveData = JSON.parse(saved);

      if (!this.isValidSave(saveData)) {
        DebugLogger.warn('SaveManager', 'Invalid save data detected');
        return null;
      }

      return saveData;
    } catch (error) {
      DebugLogger.error('SaveManager', 'Failed to load game', error);
      return null;
    }
  }

  public static deleteSave(): boolean {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      return true;
    } catch (error) {
      DebugLogger.error('SaveManager', 'Failed to delete save', error);
      return false;
    }
  }

  public static hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  private static sanitizeGameState(gameState: GameState): GameState {
    const sanitized = JSON.parse(JSON.stringify(gameState));

    sanitized.party.characters.forEach((char: ICharacter) => {
      if (char.isDead && char.status === 'Dead') {
        this.applyPermadeath(char);
      }
    });

    return sanitized;
  }

  private static applyPermadeath(character: ICharacter): void {
    const deathRollChance = 0.5 + character.deathCount * 0.1;

    if (Math.random() < deathRollChance) {
      character.status = 'Ashed';
      character.stats.vitality = Math.max(3, character.stats.vitality - 2);
      character.age += 5;
    }

    if (character.deathCount >= 5) {
      character.status = 'Ashed';
    }

    if (character.status === 'Ashed' && Math.random() < 0.1) {
      character.status = 'Lost';
    }
  }

  private static isValidSave(saveData: any): saveData is SaveData {
    return (
      typeof saveData === 'object' &&
      typeof saveData.version === 'string' &&
      typeof saveData.gameState === 'object' &&
      typeof saveData.saveDate === 'number' &&
      typeof saveData.playtimeSeconds === 'number' &&
      this.isValidGameState(saveData.gameState)
    );
  }

  private static isValidGameState(gameState: any): gameState is GameState {
    return (
      typeof gameState === 'object' &&
      typeof gameState.party === 'object' &&
      Array.isArray(gameState.party.characters) &&
      Array.isArray(gameState.dungeon) &&
      typeof gameState.currentFloor === 'number' &&
      typeof gameState.inCombat === 'boolean' &&
      typeof gameState.gameTime === 'number' &&
      typeof gameState.turnCount === 'number' &&
      (gameState.combatEnabled === undefined || typeof gameState.combatEnabled === 'boolean')
    );
  }

  private static addToSaveHistory(saveData: SaveData): void {
    try {
      const historyKey = 'drpg2_save_history';
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

      history.unshift({
        date: saveData.saveDate,
        floor: saveData.gameState.currentFloor,
        playtime: saveData.playtimeSeconds,
        partySize: saveData.gameState.party.characters.length,
        aliveCount: saveData.gameState.party.characters.filter((c: ICharacter) => !c.isDead).length,
      });

      if (history.length > this.MAX_SAVES) {
        history.splice(this.MAX_SAVES);
      }

      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      DebugLogger.warn('SaveManager', 'Failed to save history', error);
    }
  }

  public static getSaveHistory(): any[] {
    try {
      const historyKey = 'drpg2_save_history';
      return JSON.parse(localStorage.getItem(historyKey) || '[]');
    } catch (error) {
      DebugLogger.warn('SaveManager', 'Failed to load save history', error);
      return [];
    }
  }

  public static exportSave(): string | null {
    try {
      const saveData = this.loadGame();
      if (!saveData) return null;

      return btoa(JSON.stringify(saveData));
    } catch (error) {
      DebugLogger.error('SaveManager', 'Failed to export save', error);
      return null;
    }
  }

  public static importSave(importData: string): boolean {
    try {
      const decoded = atob(importData);
      const saveData: SaveData = JSON.parse(decoded);

      if (!this.isValidSave(saveData)) {
        return false;
      }

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      DebugLogger.error('SaveManager', 'Failed to import save', error);
      return false;
    }
  }

  public static createBackup(): boolean {
    try {
      const saveData = this.loadGame();
      if (!saveData) return false;

      const backupKey = `drpg2_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(saveData));

      this.cleanupOldBackups();
      return true;
    } catch (error) {
      DebugLogger.error('SaveManager', 'Failed to create backup', error);
      return false;
    }
  }

  private static cleanupOldBackups(): void {
    try {
      const keys = Object.keys(localStorage);
      const backupKeys = keys.filter((key) => key.startsWith('drpg2_backup_'));

      backupKeys
        .sort()
        .slice(0, -3)
        .forEach((key) => {
          localStorage.removeItem(key);
        });
    } catch (error) {
      DebugLogger.warn('SaveManager', 'Failed to cleanup backups', error);
    }
  }

  public static getGameStats(gameState: GameState): {
    totalPlaytime: number;
    currentFloor: number;
    partyLevel: number;
    totalGold: number;
    aliveCharacters: number;
    totalDeaths: number;
    battlesWon: number;
  } {
    const characters = gameState.party.characters;

    return {
      totalPlaytime: 0, // Would be tracked separately in actual game
      currentFloor: gameState.currentFloor,
      partyLevel: Math.floor(
        characters.reduce((sum: number, c: any) => sum + c.level, 0) / characters.length
      ),
      totalGold: characters.reduce((sum: number, c: any) => sum + c.gold, 0),
      aliveCharacters: characters.filter((c: any) => !c.isDead).length,
      totalDeaths: characters.reduce((sum: number, c: any) => sum + c.deathCount, 0),
      battlesWon: 0, // Would be tracked separately in actual game
    };
  }

  public static handlePermadeath(character: ICharacter): {
    survived: boolean;
    newStatus: string;
    message: string;
  } {
    const baseChance = 0.5;
    const deathPenalty = character.deathCount * 0.15;
    const levelBonus = character.level * 0.02;
    const vitalityBonus = (character.stats.vitality - 10) * 0.03;

    const survivalChance = Math.max(0.1, baseChance - deathPenalty + levelBonus + vitalityBonus);
    const survived = Math.random() < survivalChance;

    if (survived) {
      character.isDead = false;
      character.status = 'OK';
      character.hp = 1;
      character.stats.vitality = Math.max(3, character.stats.vitality - 1);
      character.age += 1;

      return {
        survived: true,
        newStatus: 'Injured',
        message: `${character.name} barely survives with permanent injuries!`,
      };
    } else {
      character.status = 'Ashed';
      character.stats.vitality = Math.max(3, character.stats.vitality - 2);

      return {
        survived: false,
        newStatus: 'Ashed',
        message: `${character.name} crumbles to ash and cannot be revived!`,
      };
    }
  }
}
