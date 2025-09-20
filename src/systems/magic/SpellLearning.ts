import { Character } from '../../entities/Character';
import { SpellData, SpellSchool, SpellLearningResult } from '../../types/SpellTypes';
import { CharacterClass } from '../../types/GameTypes';
import { SpellRegistry } from './SpellRegistry';
import { CharacterClasses } from './MagicConstants';

export class SpellLearning {
  private static instance: SpellLearning;
  private spellRegistry: SpellRegistry;

  private constructor() {
    this.spellRegistry = SpellRegistry.getInstance();
  }

  static getInstance(): SpellLearning {
    if (!SpellLearning.instance) {
      SpellLearning.instance = new SpellLearning();
    }
    return SpellLearning.instance;
  }

  learnSpellsOnLevelUp(character: Character, newLevel: number): SpellLearningResult[] {
    const results: SpellLearningResult[] = [];
    const characterClass = character.getClass();
    const schools = this.spellRegistry.getSchoolsForClass(characterClass);

    if (schools.length === 0) {
      return results;
    }

    for (const school of schools) {
      const schoolResults = this.learnSpellsForSchool(character, newLevel, school);
      results.push(...schoolResults);
    }

    const missedSpells = this.attemptMissedSpells(character, newLevel);
    results.push(...missedSpells);

    return results;
  }

  private learnSpellsForSchool(
    character: Character,
    level: number,
    school: SpellSchool
  ): SpellLearningResult[] {
    const results: SpellLearningResult[] = [];
    const spellsForLevel = this.getNewSpellsAtLevel(character.getClass(), level, school);

    for (const spell of spellsForLevel) {
      if (character.knowsSpell(spell.id)) {
        continue;
      }

      const canLearn = this.checkLearningEligibility(character, spell);
      if (!canLearn.eligible) {
        results.push({
          spellId: spell.id,
          spellName: spell.name,
          learned: false,
          reason: canLearn.reason
        });
        continue;
      }

      const learned = this.attemptSpellLearning(character, spell);
      results.push({
        spellId: spell.id,
        spellName: spell.name,
        learned: learned,
        reason: learned ? undefined : 'Failed learning check'
      });

      if (learned) {
        character.learnSpell(spell.id);
      }
    }

    return results;
  }

  private getNewSpellsAtLevel(
    characterClass: CharacterClass,
    level: number,
    school: SpellSchool
  ): SpellData[] {
    const spellLevel = this.calculateSpellLevelAccess(characterClass, level);
    if (spellLevel === 0) return [];

    const previousSpellLevel = this.calculateSpellLevelAccess(characterClass, level - 1);

    if (spellLevel > previousSpellLevel) {
      return this.spellRegistry.getSpellsBySchoolAndLevel(school, spellLevel);
    }

    return [];
  }

  private calculateSpellLevelAccess(
    characterClass: CharacterClass,
    level: number
  ): number {
    if (level < 1) return 0;

    const isHybridClass = this.isHybridCaster(characterClass);
    const isPureClass = this.isPureCaster(characterClass);

    if (isPureClass) {
      return Math.min(7, Math.floor((level + 1) / 2));
    }

    if (isHybridClass) {
      if (level < 4) return 0;
      return Math.min(7, Math.floor((level - 1) / 3));
    }

    return 0;
  }

  private isHybridCaster(characterClass: CharacterClass): boolean {
    return [
      CharacterClasses.BISHOP,
      CharacterClasses.RANGER,
      CharacterClasses.BARD,
      CharacterClasses.LORD,
      CharacterClasses.VALKYRIE,
      CharacterClasses.SAMURAI,
      CharacterClasses.MONK
    ].includes(characterClass);
  }

  private isPureCaster(characterClass: CharacterClass): boolean {
    return [
      CharacterClasses.MAGE,
      CharacterClasses.PRIEST,
      CharacterClasses.ALCHEMIST,
      CharacterClasses.PSIONIC
    ].includes(characterClass);
  }

  private checkLearningEligibility(
    character: Character,
    spell: SpellData
  ): { eligible: boolean; reason?: string } {
    if (character.knowsSpell(spell.id)) {
      return { eligible: false, reason: 'Already knows spell' };
    }

    if (!this.spellRegistry.canClassLearnSpell(character.getClass(), spell)) {
      return { eligible: false, reason: 'Class cannot learn this spell' };
    }

    if (!this.spellRegistry.checkPrerequisites(character, spell)) {
      return { eligible: false, reason: 'Missing prerequisites' };
    }

    if (spell.restrictions?.alignment) {
      const alignment = character.getAlignment();
      if (!spell.restrictions.alignment.includes(alignment)) {
        return { eligible: false, reason: 'Wrong alignment' };
      }
    }

    return { eligible: true };
  }

  private attemptSpellLearning(character: Character, spell: SpellData): boolean {
    const intelligence = character.getStats().intelligence;
    const luck = character.getStats().luck;
    const characterClass = character.getClass();

    let baseChance = this.getBaseLearnChance(intelligence);

    if (characterClass === CharacterClasses.BISHOP) {
      baseChance *= 0.85;
    }

    const luckBonus = Math.floor((luck - 10) / 2);
    baseChance += luckBonus;

    const levelDifference = spell.level - Math.floor(character.getLevel() / 2);
    if (levelDifference > 0) {
      baseChance -= levelDifference * 10;
    }

    baseChance = Math.max(20, Math.min(95, baseChance));

    const roll = Math.random() * 100;
    return roll < baseChance;
  }

  private getBaseLearnChance(intelligence: number): number {
    if (intelligence >= 18) return 95;
    if (intelligence >= 16) return 85;
    if (intelligence >= 14) return 75;
    if (intelligence >= 12) return 65;
    if (intelligence >= 10) return 55;
    if (intelligence >= 8) return 45;
    return 35;
  }

  private attemptMissedSpells(character: Character, currentLevel: number): SpellLearningResult[] {
    const results: SpellLearningResult[] = [];
    const characterClass = character.getClass();
    const schools = this.spellRegistry.getSchoolsForClass(characterClass);

    for (const school of schools) {
      const availableSpells = this.spellRegistry.getSpellsAvailableAtLevel(
        characterClass,
        currentLevel,
        school
      );

      for (const spell of availableSpells) {
        if (character.knowsSpell(spell.id)) {
          continue;
        }

        const spellAccessLevel = this.getMinLevelForSpell(characterClass, spell);
        if (spellAccessLevel >= currentLevel - 2) {
          continue;
        }

        const canLearn = this.checkLearningEligibility(character, spell);
        if (!canLearn.eligible) {
          continue;
        }

        const bonusChance = Math.min(30, (currentLevel - spellAccessLevel) * 5);
        const roll = Math.random() * 100;

        if (roll < bonusChance) {
          character.learnSpell(spell.id);
          results.push({
            spellId: spell.id,
            spellName: spell.name,
            learned: true,
            reason: 'Learned missed spell from earlier level'
          });
        }
      }
    }

    return results;
  }

  private getMinLevelForSpell(characterClass: CharacterClass, spell: SpellData): number {
    const isPure = this.isPureCaster(characterClass);
    const isHybrid = this.isHybridCaster(characterClass);

    if (isPure) {
      return spell.level * 2 - 1;
    }

    if (isHybrid) {
      return spell.level * 3 + 1;
    }

    return 99;
  }

  getSpellsForClass(characterClass: CharacterClass): Map<number, SpellData[]> {
    const spellsByLevel = new Map<number, SpellData[]>();
    const schools = this.spellRegistry.getSchoolsForClass(characterClass);

    for (let level = 1; level <= 50; level++) {
      const spellsAtLevel: SpellData[] = [];

      for (const school of schools) {
        const newSpells = this.getNewSpellsAtLevel(characterClass, level, school);
        spellsAtLevel.push(...newSpells);
      }

      if (spellsAtLevel.length > 0) {
        spellsByLevel.set(level, spellsAtLevel);
      }
    }

    return spellsByLevel;
  }

  calculateSpellPoints(character: Character): Map<SpellSchool, number> {
    const spellPoints = new Map<SpellSchool, number>();
    const characterClass = character.getClass();
    const level = character.getLevel();
    const schools = this.spellRegistry.getSchoolsForClass(characterClass);
    const stats = character.getStats();

    for (const school of schools) {
      let baseMP = 0;

      if (this.isPureCaster(characterClass)) {
        baseMP = level * 2;

        switch (school) {
          case 'mage':
            baseMP += Math.floor((stats.intelligence - 10) / 2);
            break;
          case 'priest':
            baseMP += Math.floor((stats.piety - 10) / 2);
            break;
          case 'alchemist':
            baseMP += Math.floor((stats.intelligence - 10) / 3);
            break;
          case 'psionic':
            baseMP += Math.floor((stats.intelligence + stats.piety - 20) / 4);
            break;
        }
      } else if (this.isHybridCaster(characterClass)) {
        baseMP = Math.floor(level * 0.75);

        if (characterClass === CharacterClasses.BISHOP) {
          baseMP = Math.floor(level * 1.5);
        }

        const statBonus = this.getHybridStatBonus(characterClass, school, stats);
        baseMP += statBonus;
      }

      if (baseMP > 0) {
        spellPoints.set(school, baseMP);
      }
    }

    return spellPoints;
  }

  private getHybridStatBonus(
    characterClass: CharacterClass,
    school: SpellSchool,
    stats: any
  ): number {
    switch (characterClass) {
      case CharacterClasses.BISHOP:
        if (school === 'mage') return Math.floor((stats.intelligence - 10) / 3);
        if (school === 'priest') return Math.floor((stats.piety - 10) / 3);
        break;
      case CharacterClasses.RANGER:
        return Math.floor((stats.intelligence - 10) / 4);
      case CharacterClasses.BARD:
      case CharacterClasses.SAMURAI:
        return Math.floor((stats.intelligence - 10) / 5);
      case CharacterClasses.LORD:
      case CharacterClasses.VALKYRIE:
        return Math.floor((stats.piety - 10) / 4);
      case CharacterClasses.MONK:
        return Math.floor((stats.intelligence + stats.piety - 20) / 6);
    }
    return 0;
  }
}