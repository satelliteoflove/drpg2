import { Character } from '../entities/Character';
import { CombatEntity, EntityUtils } from './EntityUtils';
import { DiceRoller } from './DiceRoller';

export type SaveType = 'physical' | 'mental' | 'magical' | 'death';

export class SavingThrowCalculator {
  static calculateSaveTarget(entity: CombatEntity, saveType: SaveType, modifier: number = 0): number {
    const level = EntityUtils.getLevel(entity);
    let baseSave = 20 - level;

    switch (saveType) {
      case 'physical':
        baseSave -= Math.floor(EntityUtils.getVitality(entity) / 3);
        break;
      case 'mental':
        baseSave -= Math.floor(EntityUtils.getIntelligence(entity) / 3);
        break;
      case 'magical':
        baseSave -= Math.floor(EntityUtils.getIntelligence(entity) / 3);
        baseSave -= Math.floor(EntityUtils.getLuck(entity) / 5);
        break;
      case 'death':
        baseSave -= Math.floor(EntityUtils.getVitality(entity) / 4);
        baseSave -= Math.floor(EntityUtils.getLuck(entity) / 4);
        break;
    }

    baseSave += modifier;
    return Math.max(1, Math.min(20, baseSave));
  }

  static makeSavingThrow(entity: CombatEntity, saveType: SaveType, modifier: number = 0): boolean {
    const target = this.calculateSaveTarget(entity, saveType, modifier);
    const roll = DiceRoller.rollD20();
    return roll >= target;
  }

  static calculateResistanceChance(entity: CombatEntity, saveType: SaveType, modifier: number = 0): number {
    let saveChance = 50;

    switch (saveType) {
      case 'physical':
        saveChance -= Math.max(0, EntityUtils.getVitality(entity) - 10) * 3;
        break;
      case 'mental':
        saveChance -= Math.max(0, EntityUtils.getIntelligence(entity) - 10) * 3;
        break;
      case 'magical':
        const magicResistance = EntityUtils.getMagicResistance(entity);
        if (magicResistance > 0) {
          saveChance -= magicResistance;
        } else {
          saveChance -= Math.max(0, EntityUtils.getIntelligence(entity) - 10) * 2;
        }
        break;
      case 'death':
        saveChance -= Math.max(0, EntityUtils.getVitality(entity) - 10) * 2;
        saveChance -= Math.max(0, EntityUtils.getLuck(entity) - 10) * 2;
        break;
    }

    saveChance += modifier;
    return Math.max(5, Math.min(95, saveChance));
  }

  static checkResistance(entity: CombatEntity, saveType: SaveType, modifier: number = 0): boolean {
    const chance = this.calculateResistanceChance(entity, saveType, modifier);
    return Math.random() * 100 >= chance;
  }

  static getClassSaveBonus(characterClass: string, saveType: SaveType): number {
    const bonuses: Record<string, Partial<Record<SaveType, number>>> = {
      Fighter: { physical: -2, death: -1 },
      Samurai: { physical: -3, mental: -1, death: -2 },
      Lord: { physical: -2, magical: -2, death: -2 },
      Valkyrie: { physical: -2, mental: -1, death: -1 },
      Monk: { physical: -1, mental: -2, magical: -1 },
      Ninja: { physical: -1, mental: -1, death: -1 },
      Mage: { magical: -3, mental: -1 },
      Bishop: { magical: -2, mental: -2 },
      Priest: { magical: -2, death: -2 },
      Alchemist: { magical: -2, physical: -1 },
      Psionic: { mental: -3, magical: -1 },
      Bard: { mental: -2 },
      Ranger: { physical: -1, mental: -1 },
      Thief: { physical: -1 }
    };

    return bonuses[characterClass]?.[saveType] || 0;
  }

  static makeCharacterSavingThrow(
    character: Character,
    saveType: SaveType,
    modifier: number = 0
  ): boolean {
    const classBonus = this.getClassSaveBonus(character.getClass(), saveType);
    return this.makeSavingThrow(character, saveType, modifier + classBonus);
  }

  static checkStatusResistance(entity: CombatEntity, statusType: string): boolean {
    const resistanceMap: Record<string, SaveType> = {
      sleep: 'mental',
      confused: 'mental',
      afraid: 'mental',
      charmed: 'mental',
      berserk: 'mental',
      paralyzed: 'physical',
      poisoned: 'physical',
      stoned: 'magical',
      silenced: 'magical',
      blinded: 'physical',
      cursed: 'magical',
      dead: 'death',
      ashed: 'death'
    };

    const saveType = resistanceMap[statusType] || 'magical';
    return this.makeSavingThrow(entity, saveType, 0);
  }

  static calculateGroupSaveChance(entities: CombatEntity[], saveType: SaveType, modifier: number = 0): number[] {
    return entities.map(entity => {
      const chance = this.calculateResistanceChance(entity, saveType, modifier);
      return 100 - chance;
    });
  }

  static rollGroupSaves(entities: CombatEntity[], saveType: SaveType, modifier: number = 0): boolean[] {
    return entities.map(entity => this.makeSavingThrow(entity, saveType, modifier));
  }
}