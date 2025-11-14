import { Character } from '../entities/Character';
import { StarterCharacterTemplate } from '../config/StarterCharacters';
import { RACES } from '../config/races';
import { CLASSES_BY_ID } from '../config/classes';
import { GAME_CONFIG } from '../config/GameConstants';
import { CharacterStats } from '../types/GameTypes';
import { calculateExperienceRequired } from '../config/progression/ExperienceTable';
import { SpellId } from '../types/SpellTypes';
import { DataLoader } from './DataLoader';
import { CharacterPersonalityService } from '../services/banter/CharacterPersonalityService';

export class StarterCharacterFactory {
  private static personalityService = new CharacterPersonalityService();

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
      const weapon = DataLoader.createItemInstance(template.equipmentIds.weapon);
      if (weapon) {
        weapon.equipped = true;
        weapon.identified = true;
        character.equipment.weapon = weapon;
      }
    }

    if (template.equipmentIds.armor) {
      const armor = DataLoader.createItemInstance(template.equipmentIds.armor);
      if (armor) {
        armor.equipped = true;
        armor.identified = true;
        character.equipment.armor = armor;
      }
    }

    if (template.inventoryItemIds) {
      for (const itemId of template.inventoryItemIds) {
        const item = DataLoader.createItemInstance(itemId);
        if (item) {
          character.inventory.push(item);
        }
      }
    }

    this.assignStartingSpells(character);

    this.personalityService.initializeCharacterPersonality(character);

    return character;
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

  private static assignStartingSpells(character: Character): void {
    const charClass = character.class;
    const startingSpells: SpellId[] = [];

    switch (charClass) {
      case 'Mage':
        startingSpells.push('m1_sleep' as SpellId);
        startingSpells.push('m1_flame_dart' as SpellId);
        startingSpells.push('m2_petrify' as SpellId);
        startingSpells.push('m2_group_flame' as SpellId);
        break;

      case 'Priest':
        startingSpells.push('p1_cure_light_wounds' as SpellId);
        startingSpells.push('p1_harm' as SpellId);
        startingSpells.push('p2_silence' as SpellId);
        startingSpells.push('p2_party_shield' as SpellId);
        break;

      case 'Alchemist':
        startingSpells.push('a1_attack_boost' as SpellId);
        startingSpells.push('a1_breath_effect' as SpellId);
        startingSpells.push('a2_paralyze' as SpellId);
        startingSpells.push('a2_fire_cloud' as SpellId);
        break;

      case 'Psionic':
        startingSpells.push('psi1_mind_blast' as SpellId);
        startingSpells.push('psi1_minor_heal' as SpellId);
        break;

      case 'Bishop':
        startingSpells.push('m1_sleep' as SpellId);
        startingSpells.push('p1_cure_light_wounds' as SpellId);
        break;
    }

    for (const spellId of startingSpells) {
      character.learnSpell(spellId);
    }
  }
}
