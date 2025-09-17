import {
  CharacterAlignment,
  CharacterClass,
  CharacterRace,
  CharacterStats,
  CharacterStatus,
  Equipment,
  Character as ICharacter,
  Item,
  Spell,
} from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { TypeValidation } from '../utils/TypeValidation';
import { RACES } from '../config/races';
import { CLASSES_BY_ID } from '../config/classes';
import {
  getExperienceModifier,
  calculateExperienceRequired,
  calculateExperienceToNextLevel
} from '../config/progression/ExperienceTable';
import {
  getAvailableSpellLevels,
  getClassSpellSchools,
  canClassLearnSpells
} from '../config/progression/SpellLearningTable';

export class Character implements ICharacter {
  id: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  alignment: CharacterAlignment;
  gender: 'male' | 'female';
  level: number;
  experience: number;
  experienceModifier: number;
  pendingLevelUp: boolean;
  stats: CharacterStats;
  baseStats: CharacterStats;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  ac: number;
  status: CharacterStatus;
  age: number;
  gold: number;
  equipment: Equipment;
  inventory: Item[];
  spells: Spell[];
  isDead: boolean;
  deathCount: number;

  constructor(
    name: string,
    race: CharacterRace,
    charClass: CharacterClass,
    alignment: CharacterAlignment,
    gender: 'male' | 'female' = 'male'
  ) {
    this.id = TypeValidation.generateSecureId();
    this.name = name;
    this.race = race;
    this.class = charClass;
    this.alignment = alignment;
    this.gender = gender;
    this.level = 1;
    this.experience = 0;
    this.experienceModifier = getExperienceModifier(race, charClass);
    this.pendingLevelUp = false;
    this.age = this.getStartingAge();
    this.gold =
      Math.floor(
        Math.random() *
          (GAME_CONFIG.CHARACTER.STARTING_GOLD_MAX - GAME_CONFIG.CHARACTER.STARTING_GOLD_MIN)
      ) + GAME_CONFIG.CHARACTER.STARTING_GOLD_MIN;
    this.equipment = {};
    this.inventory = [];
    this.spells = [];
    this.isDead = false;
    this.deathCount = 0;
    this.status = 'OK';

    this.baseStats = this.rollStats();
    this.stats = { ...this.baseStats };

    this.maxHp = this.calculateMaxHp();
    this.hp = this.maxHp;
    this.maxMp = this.calculateMaxMp();
    this.mp = this.maxMp;
    this.ac = 10;

    this.learnStartingSpells();
  }

  private rollStats(): CharacterStats {
    // Test mode support for deterministic stats
    if ((window as any).testMode && (window as any).forceStats) {
      const forcedStats = (window as any).forceStats;
      return {
        strength: forcedStats.strength || 10,
        intelligence: forcedStats.intelligence || 10,
        piety: forcedStats.piety || 10,
        vitality: forcedStats.vitality || 10,
        agility: forcedStats.agility || 10,
        luck: forcedStats.luck || 10
      };
    }

    const raceConfig = RACES[this.race.toLowerCase()];
    if (!raceConfig) {
      throw new Error(`Unknown race: ${this.race}`);
    }

    const rollStatInRange = (min: number, max: number): number => {
      // Test mode with specific race stats
      if ((window as any).testMode && (window as any).testRace === this.race && (window as any).testStats) {
        const testRange = (window as any).testStats;
        if (testRange.str && min === raceConfig.stats.strength.min) {
          return Math.floor((testRange.str[0] + testRange.str[1]) / 2);
        }
        if (testRange.int && min === raceConfig.stats.intelligence.min) {
          return Math.floor((testRange.int[0] + testRange.int[1]) / 2);
        }
        if (testRange.pie && min === raceConfig.stats.piety.min) {
          return Math.floor((testRange.pie[0] + testRange.pie[1]) / 2);
        }
        if (testRange.vit && min === raceConfig.stats.vitality.min) {
          return Math.floor((testRange.vit[0] + testRange.vit[1]) / 2);
        }
        if (testRange.agi && min === raceConfig.stats.agility.min) {
          return Math.floor((testRange.agi[0] + testRange.agi[1]) / 2);
        }
        if (testRange.luk && min === raceConfig.stats.luck.min) {
          return Math.floor((testRange.luk[0] + testRange.luk[1]) / 2);
        }
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    let stats: CharacterStats;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      stats = {
        strength: rollStatInRange(raceConfig.stats.strength.min, raceConfig.stats.strength.max),
        intelligence: rollStatInRange(raceConfig.stats.intelligence.min, raceConfig.stats.intelligence.max),
        piety: rollStatInRange(raceConfig.stats.piety.min, raceConfig.stats.piety.max),
        vitality: rollStatInRange(raceConfig.stats.vitality.min, raceConfig.stats.vitality.max),
        agility: rollStatInRange(raceConfig.stats.agility.min, raceConfig.stats.agility.max),
        luck: rollStatInRange(raceConfig.stats.luck.min, raceConfig.stats.luck.max),
      };
      attempts++;
    } while (!this.meetsClassRequirements(stats) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error(`Cannot generate valid stats for ${this.race} ${this.class} after ${maxAttempts} attempts`);
    }

    return stats;
  }

  private meetsClassRequirements(stats: CharacterStats): boolean {
    const classConfig = CLASSES_BY_ID[this.class.toLowerCase()];
    if (!classConfig) {
      return true;
    }

    const requirements = classConfig.requirements;

    if (requirements.strength && stats.strength < requirements.strength) return false;
    if (requirements.intelligence && stats.intelligence < requirements.intelligence) return false;
    if (requirements.piety && stats.piety < requirements.piety) return false;
    if (requirements.vitality && stats.vitality < requirements.vitality) return false;
    if (requirements.agility && stats.agility < requirements.agility) return false;
    if (requirements.luck && stats.luck < requirements.luck) return false;

    return true;
  }


  private getStartingAge(): number {
    const baseAge =
      GAME_CONFIG.CHARACTER.STARTING_AGE[
        this.race.toUpperCase() as keyof typeof GAME_CONFIG.CHARACTER.STARTING_AGE
      ] || GAME_CONFIG.CHARACTER.STARTING_AGE.HUMAN;
    return baseAge + Math.floor(Math.random() * GAME_CONFIG.CHARACTER.AGE_VARIANCE);
  }

  private calculateMaxHp(): number {
    const base =
      GAME_CONFIG.HP_BONUSES[this.class.toUpperCase() as keyof typeof GAME_CONFIG.HP_BONUSES] || 4;
    const vitBonus = Math.floor((this.stats.vitality - 10) / 2);
    return Math.max(1, base + vitBonus) * this.level;
  }

  private calculateMaxMp(): number {
    if (!this.canCastSpells()) return 0;

    const intBonus = Math.floor((this.stats.intelligence - 10) / 2);
    const pietyBonus = Math.floor((this.stats.piety - 10) / 2);

    let base = 0;
    if (this.class === 'Mage' || this.class === 'Bishop')
      base += GAME_CONFIG.MP_BASE.MAGE_PRIEST_BASE + intBonus;
    if (this.class === 'Priest' || this.class === 'Bishop')
      base += GAME_CONFIG.MP_BASE.MAGE_PRIEST_BASE + pietyBonus;
    if (this.class === 'Samurai' || this.class === 'Lord' || this.class === 'Ninja')
      base += GAME_CONFIG.MP_BASE.HYBRID_CLASS_BASE;
    if (this.class === 'Alchemist')
      base += GAME_CONFIG.MP_BASE.MAGE_PRIEST_BASE + intBonus;
    if (this.class === 'Psionic')
      base += GAME_CONFIG.MP_BASE.MAGE_PRIEST_BASE + intBonus;
    if (this.class === 'Bard' || this.class === 'Valkyrie')
      base += GAME_CONFIG.MP_BASE.HYBRID_CLASS_BASE;

    return Math.max(0, base * this.level);
  }

  private canCastSpells(): boolean {
    const spellcasterClasses = [
      'Mage', 'Priest', 'Bishop', 'Samurai', 'Lord', 'Ninja',
      'Alchemist', 'Bard', 'Psionic', 'Valkyrie'
    ];
    return spellcasterClasses.includes(this.class);
  }

  private learnStartingSpells(): void {
    if (!this.canCastSpells()) return;

    if (this.class === 'Mage' || this.class === 'Bishop') {
      this.spells.push({
        id: 'halito',
        name: 'Halito',
        level: 1,
        type: 'mage',
        mpCost: 1,
        effect: { type: 'damage', element: 'fire', power: 8 },
        targetType: 'enemy',
        inCombat: true,
        outOfCombat: false,
      });
    }

    if (this.class === 'Priest' || this.class === 'Bishop') {
      this.spells.push({
        id: 'dios',
        name: 'Dios',
        level: 1,
        type: 'priest',
        mpCost: 1,
        effect: { type: 'heal', power: 8 },
        targetType: 'ally',
        inCombat: true,
        outOfCombat: true,
      });
    }

    if (this.class === 'Alchemist') {
      this.spells.push({
        id: 'heal_potion',
        name: 'Heal Potion',
        level: 1,
        type: 'alchemist',
        mpCost: 2,
        effect: { type: 'heal', power: 10 },
        targetType: 'ally',
        inCombat: true,
        outOfCombat: true,
      });
    }

    if (this.class === 'Psionic') {
      this.spells.push({
        id: 'mind_blast',
        name: 'Mind Blast',
        level: 1,
        type: 'psionic',
        mpCost: 1,
        effect: { type: 'damage', element: 'dark', power: 6 },
        targetType: 'enemy',
        inCombat: true,
        outOfCombat: false,
      });
    }
  }

  public checkForLevelUp(): void {
    const requiredXP = calculateExperienceRequired(this.level + 1, this.race, this.class);
    if (this.experience >= requiredXP) {
      this.pendingLevelUp = true;
    }
  }

  public confirmLevelUp(): void {
    if (!this.pendingLevelUp) return;

    this.level++;
    this.pendingLevelUp = false;
    const oldMaxHp = this.maxHp;
    const oldMaxMp = this.maxMp;

    this.maxHp = this.calculateMaxHp();
    this.maxMp = this.calculateMaxMp();

    this.hp += this.maxHp - oldMaxHp;
    this.mp += this.maxMp - oldMaxMp;

    if (Math.random() < GAME_CONFIG.CHARACTER.LEVEL_UP_STAT_CHANCE) {
      const stats = Object.keys(this.stats) as (keyof CharacterStats)[];
      const randomStat = stats[Math.floor(Math.random() * stats.length)];
      this.stats[randomStat]++;
    }

    this.checkForNewSpells();
  }

  private checkForNewSpells(): void {
    if (!canClassLearnSpells(this.class)) return;

    const availableSpellLevels = getAvailableSpellLevels(this.class, this.level);
    const spellSchools = getClassSpellSchools(this.class);

    // This is a placeholder - actual spell learning would integrate with spell data
    // For now, just track that new spell levels are available
    console.log(`${this.name} can now learn spell levels: ${availableSpellLevels.join(', ')} from schools: ${spellSchools.join(', ')}`);
  }

  public takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0 && !this.isDead) {
      this.status = 'Dead';
      this.isDead = true;
      this.deathCount++;
    }
  }

  public heal(amount: number): void {
    if (this.isDead) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  public resurrect(): void {
    if (!this.isDead) return;

    if (
      Math.random() <
      GAME_CONFIG.DEATH_SYSTEM.BASE_SURVIVAL_CHANCE +
        this.deathCount * GAME_CONFIG.DEATH_SYSTEM.DEATH_PENALTY_MULTIPLIER
    ) {
      this.status = 'Ashed';
      return;
    }

    this.isDead = false;
    this.status = 'OK';
    this.hp = 1;
    this.stats.vitality = Math.max(
      GAME_CONFIG.CHARACTER.STAT_MIN,
      this.stats.vitality - GAME_CONFIG.DEATH_SYSTEM.VITALITY_LOSS_ON_DEATH
    );
    this.age += GAME_CONFIG.DEATH_SYSTEM.AGE_INCREASE_ON_DEATH;
  }

  public getExperienceForNextLevel(): number {
    return calculateExperienceRequired(this.level + 1, this.race, this.class);
  }

  public getExperienceToNextLevel(): number {
    return calculateExperienceToNextLevel(this.experience, this.level, this.race, this.class);
  }

  public addExperience(amount: number): boolean {
    this.experience += amount;
    this.checkForLevelUp();
    return this.pendingLevelUp;
  }


  public getIdentificationChance(_item: Item): number {
    // Only Bishops can identify items (authentic Wizardry mechanic)
    if (this.class !== 'Bishop') {
      return 0;
    }

    // Authentic Wizardry formula: (Level × 5%) + 10%
    const successRate = Math.min(1.0, this.level * 0.05 + 0.1);

    return successRate;
  }

  public canEquipItem(item: Item): boolean {
    if (item.classRestrictions && item.classRestrictions.length > 0) {
      if (!item.classRestrictions.includes(this.class)) {
        return false;
      }
    }

    if (item.alignmentRestrictions && item.alignmentRestrictions.length > 0) {
      if (!item.alignmentRestrictions.includes(this.alignment)) {
        return false;
      }
    }

    return true;
  }
}
