import { GameState } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { LevelUpResult, RoomType } from './InnStateManager';
import { StatusEffectSystem } from '../StatusEffectSystem';

export class InnTransactionHandler {
  private gameState: GameState;
  private messageLog: any;
  private statusEffectSystem: StatusEffectSystem;

  constructor(gameState: GameState, messageLog: any) {
    this.gameState = gameState;
    this.messageLog = messageLog;
    this.statusEffectSystem = StatusEffectSystem.getInstance();
  }

  public canAffordService(cost: number, characterIndex?: number): boolean {
    const pooledGold = this.gameState.party.pooledGold || 0;

    // Check pooled gold first
    if (pooledGold >= cost) {
      return true;
    }

    // If a character index is provided, check their individual gold
    if (characterIndex !== undefined && this.gameState.party.characters) {
      const character = this.gameState.party.characters[characterIndex];
      if (character && character.gold >= cost) {
        return true;
      }
    }

    return false;
  }

  public deductGold(amount: number, characterIndex?: number): void {
    const pooledGold = this.gameState.party.pooledGold || 0;

    // Try to deduct from pooled gold first
    if (pooledGold >= amount) {
      if (this.gameState.party.pooledGold !== undefined) {
        this.gameState.party.pooledGold -= amount;
      }
    } else if (characterIndex !== undefined && this.gameState.party.characters) {
      // Otherwise deduct from character's individual gold
      const character = this.gameState.party.characters[characterIndex];
      if (character && character.gold >= amount) {
        character.gold -= amount;
      }
    }
  }

  public restCharacter(characterIndex: number, roomType: RoomType): LevelUpResult | null {
    if (!this.gameState.party.characters ||
        characterIndex < 0 ||
        characterIndex >= this.gameState.party.characters.length) {
      return null;
    }

    const character = this.gameState.party.characters[characterIndex];
    const roomInfo = this.getRoomInfo(roomType);

    // Dead characters cannot rest at the inn
    if (character.isDead) {
      if (this.messageLog?.add) {
        this.messageLog.add(`${character.name} is dead. Visit the Temple for resurrection.`);
      }
      return null;
    }

    // Calculate weeks needed for full recovery
    const hpNeeded = character.maxHp - character.hp;
    let weeksStayed = 0;
    let totalCost = 0;

    if (roomType === 'stables') {
      // Stables: Free, restores MP only, ages 1 day
      character.mp = character.maxMp;
      if (character.age !== undefined) {
        character.age += 1; // Age 1 day
      }

      // Tick status effects for 1 day
      this.statusEffectSystem.tick(character, 'town');

      // Check if character died from status effects
      if (character.isDead) {
        if (this.messageLog?.add) {
          this.messageLog.add(`${character.name} succumbed to their condition while resting!`);
        }
        return null;
      }

      if (this.messageLog?.add) {
        this.messageLog.add(`${character.name} rests in the Stables for 1 day.`);
        this.messageLog.add(`${character.name} restored all MP.`);
      }
    } else {
      // Other rooms: Restore HP per week, always restore full MP
      weeksStayed = roomInfo.hpPerWeek > 0 ? Math.ceil(hpNeeded / roomInfo.hpPerWeek) : 1;
      if (weeksStayed < 1) weeksStayed = 1; // Minimum 1 week

      const hpRecovered = Math.min(hpNeeded, roomInfo.hpPerWeek * weeksStayed);
      character.hp = Math.min(character.maxHp, character.hp + hpRecovered);
      character.mp = character.maxMp;

      // Age the character
      if (character.age !== undefined) {
        character.age += weeksStayed * 7; // Age in days
      }

      // Tick status effects for each day of rest
      const daysStayed = weeksStayed * 7;
      for (let day = 0; day < daysStayed; day++) {
        this.statusEffectSystem.tick(character, 'town');

        // Check if character died from status effects during rest
        if (character.isDead) {
          if (this.messageLog?.add) {
            this.messageLog.add(`${character.name} succumbed to their condition while resting!`);
            this.messageLog.add(`Cost: ${roomInfo.cost * Math.ceil((day + 1) / 7)} gold.`);
          }
          return null;
        }
      }

      totalCost = roomInfo.cost * weeksStayed;

      if (this.messageLog?.add) {
        this.messageLog.add(`${character.name} rests in the ${roomInfo.name} for ${weeksStayed} week${weeksStayed > 1 ? 's' : ''}.`);
        if (hpRecovered > 0) {
          this.messageLog.add(`${character.name} recovered ${hpRecovered} HP.`);
        }
        this.messageLog.add(`${character.name} restored all MP.`);
        this.messageLog.add(`Cost: ${totalCost} gold.`);
      }
    }

    // Apply pending level up (happens with any rest)
    if (character.pendingLevelUp) {
      const result = this.applyLevelUp(character);
      if (result && this.messageLog?.add) {
        this.messageLog.add(`${character.name} gained a level while resting!`);
      }
      return result;
    }

    return null;
  }

  private getRoomInfo(roomType: RoomType): any {
    const roomInfoMap = {
      stables: { name: 'Stables', cost: 0, hpPerWeek: 0 },
      cots: { name: 'Cots', cost: 10, hpPerWeek: 1 },
      economy: { name: 'Economy Rooms', cost: 50, hpPerWeek: 3 },
      merchant: { name: 'Merchant Suites', cost: 200, hpPerWeek: 7 },
      royal: { name: 'Royal Suite', cost: 500, hpPerWeek: 10 }
    };
    return roomInfoMap[roomType];
  }

  public applyLevelUp(character: Character): LevelUpResult | null {
    if (!character.pendingLevelUp) return null;

    const oldLevel = character.level;
    const oldMaxHp = character.maxHp;
    const oldMaxMp = character.maxMp;

    const spellResults = character.confirmLevelUp();

    const newLevel = character.level;
    const hpGained = character.maxHp - oldMaxHp;
    const mpGained = character.maxMp - oldMaxMp;
    const spellsLearned = spellResults.map(result => result.spellName);

    return {
      character,
      oldLevel,
      newLevel,
      hpGained,
      mpGained,
      spellsLearned
    };
  }


  public removeFromParty(characterIndex: number): boolean {
    if (!this.gameState.party.characters) return false;

    if (characterIndex < 0 || characterIndex >= this.gameState.party.characters.length) {
      return false;
    }

    if (this.gameState.party.characters.length <= 1) {
      if (this.messageLog?.add) {
        this.messageLog.add("Cannot remove the last party member!");
      }
      return false;
    }

    const character = this.gameState.party.characters[characterIndex];
    this.gameState.party.characters.splice(characterIndex, 1);

    if (this.messageLog?.add) {
      this.messageLog.add(`${character.name} has left the party.`);
    }

    return true;
  }

  public reorderParty(fromIndex: number, toIndex: number): boolean {
    if (!this.gameState.party.characters) return false;

    const characters = this.gameState.party.characters;
    if (fromIndex < 0 || fromIndex >= characters.length ||
        toIndex < 0 || toIndex >= characters.length) {
      return false;
    }

    const character = characters.splice(fromIndex, 1)[0];
    characters.splice(toIndex, 0, character);

    if (this.messageLog?.add) {
      this.messageLog.add(`Party order has been changed.`);
    }

    return true;
  }
}