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

export class Character implements ICharacter {
  id: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  alignment: CharacterAlignment;
  level: number;
  experience: number;
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
    alignment: CharacterAlignment
  ) {
    this.id = TypeValidation.generateSecureId();
    this.name = name;
    this.race = race;
    this.class = charClass;
    this.alignment = alignment;
    this.level = 1;
    this.experience = 0;
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
    this.applyRaceModifiers();

    this.maxHp = this.calculateMaxHp();
    this.hp = this.maxHp;
    this.maxMp = this.calculateMaxMp();
    this.mp = this.maxMp;
    this.ac = 10;

    this.learnStartingSpells();
  }

  private rollStats(): CharacterStats {
    const roll3d6 = () => {
      return (
        Math.floor(Math.random() * 6) +
        1 +
        Math.floor(Math.random() * 6) +
        1 +
        Math.floor(Math.random() * 6) +
        1
      );
    };

    const stats: CharacterStats = {
      strength: roll3d6(),
      intelligence: roll3d6(),
      piety: roll3d6(),
      vitality: roll3d6(),
      agility: roll3d6(),
      luck: roll3d6(),
    };

    while (!this.meetsClassRequirements(stats)) {
      stats.strength = roll3d6();
      stats.intelligence = roll3d6();
      stats.piety = roll3d6();
      stats.vitality = roll3d6();
      stats.agility = roll3d6();
      stats.luck = roll3d6();
    }

    return stats;
  }

  private meetsClassRequirements(stats: CharacterStats): boolean {
    switch (this.class) {
      case 'Fighter':
        return stats.strength >= 11;
      case 'Mage':
        return stats.intelligence >= 11;
      case 'Priest':
        return stats.piety >= 11;
      case 'Thief':
        return stats.agility >= 11;
      case 'Bishop':
        return stats.intelligence >= 12 && stats.piety >= 12;
      case 'Samurai':
        return (
          stats.strength >= 15 &&
          stats.intelligence >= 11 &&
          stats.piety >= 10 &&
          stats.vitality >= 14 &&
          stats.agility >= 10
        );
      case 'Lord':
        return (
          stats.strength >= 15 &&
          stats.intelligence >= 12 &&
          stats.piety >= 12 &&
          stats.vitality >= 15 &&
          stats.agility >= 14 &&
          stats.luck >= 15
        );
      case 'Ninja':
        return (
          stats.strength >= 15 &&
          stats.intelligence >= 15 &&
          stats.piety >= 15 &&
          stats.vitality >= 15 &&
          stats.agility >= 15 &&
          stats.luck >= 15
        );
      default:
        return true;
    }
  }

  private applyRaceModifiers(): void {
    switch (this.race) {
      case 'Elf':
        this.stats.intelligence += 2;
        this.stats.agility += 1;
        this.stats.vitality -= 2;
        break;
      case 'Dwarf':
        this.stats.strength += 2;
        this.stats.vitality += 3;
        this.stats.agility -= 2;
        break;
      case 'Gnome':
        this.stats.intelligence += 1;
        this.stats.piety += 2;
        this.stats.strength -= 2;
        break;
      case 'Hobbit':
        this.stats.agility += 3;
        this.stats.luck += 2;
        this.stats.strength -= 3;
        break;
    }

    Object.keys(this.stats).forEach(key => {
      const statKey = key as keyof CharacterStats;
      this.stats[statKey] = TypeValidation.clampNumber(
        this.stats[statKey],
        GAME_CONFIG.CHARACTER.STAT_MIN,
        GAME_CONFIG.CHARACTER.STAT_MAX
      );
    });
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

    return Math.max(0, base * this.level);
  }

  private canCastSpells(): boolean {
    return (GAME_CONFIG.SPELLCASTER_CLASSES as readonly string[]).includes(this.class);
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
  }

  public levelUp(): void {
    this.level++;
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
    return Math.floor(1000 * Math.pow(1.5, this.level - 1));
  }

  public addExperience(amount: number): boolean {
    this.experience += amount;
    const requiredExp = this.getExperienceForNextLevel();

    if (this.experience >= requiredExp) {
      this.experience -= requiredExp;
      this.levelUp();
      return true;
    }
    return false;
  }

  public getIdentificationChance(_item: Item): number {
    // Only Bishops can identify items (authentic Wizardry mechanic)
    if (this.class !== 'Bishop') {
      return 0;
    }
    
    // Authentic Wizardry formula: (Level × 5%) + 10%
    const successRate = Math.min(
      1.0,
      (this.level * 0.05) + 0.10
    );
    
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
