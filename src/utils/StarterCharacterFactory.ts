import { Character } from '../entities/Character';
import { StarterCharacterTemplate } from '../config/StarterCharacters';
import { RACES } from '../config/races';
import { CLASSES_BY_ID } from '../config/classes';
import { ITEM_TEMPLATES } from '../config/ItemProperties';
import { GAME_CONFIG } from '../config/GameConstants';
import { Item, CharacterStats } from '../types/GameTypes';
import { calculateExperienceRequired } from '../config/progression/ExperienceTable';

export class StarterCharacterFactory {
  static createFromTemplate(template: StarterCharacterTemplate): Character {
    const character = new Character(
      template.name,
      template.race,
      template.class,
      template.alignment,
      template.gender
    );

    const raceConfig = RACES[template.race.toLowerCase()];
    if (!raceConfig) {
      throw new Error(`Unknown race: ${template.race}`);
    }

    const baseStats: CharacterStats = {
      strength: raceConfig.stats.strength.min,
      intelligence: raceConfig.stats.intelligence.min,
      piety: raceConfig.stats.piety.min,
      vitality: raceConfig.stats.vitality.min,
      agility: raceConfig.stats.agility.min,
      luck: raceConfig.stats.luck.min
    };

    const finalStats: CharacterStats = {
      strength: baseStats.strength + template.bonusPointAllocation.strength,
      intelligence: baseStats.intelligence + template.bonusPointAllocation.intelligence,
      piety: baseStats.piety + template.bonusPointAllocation.piety,
      vitality: baseStats.vitality + template.bonusPointAllocation.vitality,
      agility: baseStats.agility + template.bonusPointAllocation.agility,
      luck: baseStats.luck + template.bonusPointAllocation.luck
    };

    character.baseStats = finalStats;
    character.stats = { ...finalStats };

    character.level = 4;
    character.experience = calculateExperienceRequired(4, template.race, template.class);

    character.maxHp = this.calculateMaxHp(character);
    character.hp = character.maxHp;
    character.maxMp = this.calculateMaxMp(character);
    character.mp = character.maxMp;

    character.gold = 50;

    if (template.equipmentIds.weapon) {
      const weapon = this.createItemFromTemplate(template.equipmentIds.weapon);
      if (weapon) {
        character.equipment.weapon = weapon;
      }
    }

    if (template.equipmentIds.armor) {
      const armor = this.createItemFromTemplate(template.equipmentIds.armor);
      if (armor) {
        character.equipment.armor = armor;
      }
    }

    return character;
  }

  private static createItemFromTemplate(itemId: string): Item | null {
    const template = ITEM_TEMPLATES.find(t => t.id === itemId);
    if (!template) {
      return null;
    }

    const item: Item = {
      id: itemId + '_starter',
      name: template.name || 'Unknown Item',
      unidentifiedName: template.unidentifiedName || '?Item',
      type: template.type || 'special',
      value: template.value || 0,
      weight: template.weight || 0,
      identified: true,
      cursed: false,
      blessed: false,
      enchantment: 0,
      equipped: true,
      quantity: 1,
      effects: template.effects || [],
      classRestrictions: template.classRestrictions,
      alignmentRestrictions: template.alignmentRestrictions,
      invokable: template.invokable,
      spellId: template.spellId,
      charges: template.charges,
      maxCharges: template.maxCharges
    };

    return item;
  }

  private static calculateMaxHp(character: Character): number {
    const classConfig = CLASSES_BY_ID[character.class.toLowerCase()];
    if (!classConfig) {
      throw new Error(`Unknown class: ${character.class}`);
    }

    const vitBonus = Math.floor((character.stats.vitality - 10) / 2);
    return Math.max(1, classConfig.hpBase + vitBonus) * character.level;
  }

  private static calculateMaxMp(character: Character): number {
    const spellcasterClasses = GAME_CONFIG.SPELLCASTER_CLASSES as readonly string[];
    if (!spellcasterClasses.includes(character.class)) {
      return 0;
    }

    const intBonus = Math.floor((character.stats.intelligence - 10) / 2);
    const pietyBonus = Math.floor((character.stats.piety - 10) / 2);

    let base = 0;

    if (character.class === 'Mage' || character.class === 'Bishop')
      base += GAME_CONFIG.MP_BASE.MAGE_PRIEST_BASE + intBonus;
    if (character.class === 'Priest' || character.class === 'Bishop')
      base += GAME_CONFIG.MP_BASE.MAGE_PRIEST_BASE + pietyBonus;
    if (character.class === 'Samurai' || character.class === 'Lord' || character.class === 'Ninja')
      base += GAME_CONFIG.MP_BASE.HYBRID_CLASS_BASE;
    if (character.class === 'Alchemist')
      base += GAME_CONFIG.MP_BASE.MAGE_PRIEST_BASE + intBonus;
    if (character.class === 'Psionic')
      base += GAME_CONFIG.MP_BASE.MAGE_PRIEST_BASE + intBonus;
    if (character.class === 'Bard' || character.class === 'Valkyrie')
      base += GAME_CONFIG.MP_BASE.HYBRID_CLASS_BASE;

    return Math.max(0, base * character.level);
  }
}
