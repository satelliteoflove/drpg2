import { SpellData, SpellSchool, SpellValidationResult } from '../../types/SpellTypes';
import { CharacterClass } from '../../types/GameTypes';
import { SPELLS } from '../../data/spells/SpellDatabase';
import { Character } from '../../entities/Character';
import { CharacterClasses } from './MagicConstants';

export class SpellRegistry {
  private static instance: SpellRegistry;
  private spellsBySchool: Map<SpellSchool, Map<number, SpellData[]>>;
  private spellsById: Map<string, SpellData>;
  private spellsByName: Map<string, SpellData>;

  private constructor() {
    this.spellsBySchool = new Map();
    this.spellsById = new Map();
    this.spellsByName = new Map();
    this.initializeRegistry();
  }

  static getInstance(): SpellRegistry {
    if (!SpellRegistry.instance) {
      SpellRegistry.instance = new SpellRegistry();
    }
    return SpellRegistry.instance;
  }

  private initializeRegistry(): void {
    for (const [id, spell] of Object.entries(SPELLS)) {
      this.spellsById.set(id, spell);
      this.spellsByName.set(spell.name.toLowerCase(), spell);

      if (!this.spellsBySchool.has(spell.school)) {
        this.spellsBySchool.set(spell.school, new Map());
      }

      const schoolMap = this.spellsBySchool.get(spell.school)!;
      if (!schoolMap.has(spell.level)) {
        schoolMap.set(spell.level, []);
      }

      schoolMap.get(spell.level)!.push(spell);
    }
  }

  getSpellById(id: string): SpellData | undefined {
    return this.spellsById.get(id);
  }

  getSpellByName(name: string): SpellData | undefined {
    return this.spellsByName.get(name.toLowerCase());
  }

  getSpellsBySchool(school: SpellSchool): SpellData[] {
    const schoolMap = this.spellsBySchool.get(school);
    if (!schoolMap) return [];

    const spells: SpellData[] = [];
    for (const levelSpells of schoolMap.values()) {
      spells.push(...levelSpells);
    }
    return spells;
  }

  getSpellsBySchoolAndLevel(school: SpellSchool, level: number): SpellData[] {
    const schoolMap = this.spellsBySchool.get(school);
    if (!schoolMap) return [];

    return schoolMap.get(level) || [];
  }

  getSpellsByClass(characterClass: CharacterClass): SpellData[] {
    const availableSchools = this.getSchoolsForClass(characterClass);
    const spells: SpellData[] = [];

    for (const school of availableSchools) {
      const schoolSpells = this.getSpellsBySchool(school);
      for (const spell of schoolSpells) {
        if (this.canClassLearnSpell(characterClass, spell)) {
          spells.push(spell);
        }
      }
    }

    return spells;
  }

  getSchoolsForClass(characterClass: CharacterClass): SpellSchool[] {
    switch (characterClass) {
      case CharacterClasses.MAGE:
        return ['mage'];
      case CharacterClasses.PRIEST:
        return ['priest'];
      case CharacterClasses.ALCHEMIST:
        return ['alchemist'];
      case CharacterClasses.PSIONIC:
        return ['psionic'];
      case CharacterClasses.BISHOP:
        return ['mage', 'priest'];
      case CharacterClasses.RANGER:
        return ['mage', 'alchemist'];
      case CharacterClasses.BARD:
        return ['mage'];
      case CharacterClasses.LORD:
        return ['priest'];
      case CharacterClasses.VALKYRIE:
        return ['priest'];
      case CharacterClasses.MONK:
        return ['psionic'];
      case CharacterClasses.SAMURAI:
        return ['mage'];
      default:
        return [];
    }
  }

  canClassLearnSpell(characterClass: CharacterClass, spell: SpellData): boolean {
    if (spell.restrictions?.classes) {
      return spell.restrictions.classes.includes(characterClass);
    }

    const classSchools = this.getSchoolsForClass(characterClass);
    return classSchools.includes(spell.school);
  }

  getSpellsAvailableAtLevel(
    characterClass: CharacterClass,
    characterLevel: number,
    school?: SpellSchool
  ): SpellData[] {
    const schools = school ? [school] : this.getSchoolsForClass(characterClass);
    const availableSpells: SpellData[] = [];

    for (const currentSchool of schools) {
      const maxSpellLevel = this.getMaxSpellLevelForCharacter(characterClass, characterLevel);

      for (let spellLevel = 1; spellLevel <= maxSpellLevel; spellLevel++) {
        const spells = this.getSpellsBySchoolAndLevel(currentSchool, spellLevel);
        for (const spell of spells) {
          if (this.canCharacterLearnSpell(characterClass, characterLevel, spell)) {
            availableSpells.push(spell);
          }
        }
      }
    }

    return availableSpells;
  }

  private getMaxSpellLevelForCharacter(
    characterClass: CharacterClass,
    characterLevel: number
  ): number {
    const isHybridClass = [
      CharacterClasses.BISHOP,
      CharacterClasses.RANGER,
      CharacterClasses.BARD,
      CharacterClasses.LORD,
      CharacterClasses.VALKYRIE,
      CharacterClasses.SAMURAI,
      CharacterClasses.MONK
    ].includes(characterClass);

    if (isHybridClass) {
      if (characterLevel < 4) return 0;
      return Math.min(7, Math.floor((characterLevel - 1) / 3));
    }

    const isPureCaster = [
      CharacterClasses.MAGE,
      CharacterClasses.PRIEST,
      CharacterClasses.ALCHEMIST,
      CharacterClasses.PSIONIC
    ].includes(characterClass);

    if (isPureCaster) {
      return Math.min(7, Math.floor((characterLevel + 1) / 2));
    }

    return 0;
  }

  canCharacterLearnSpell(
    characterClass: CharacterClass,
    characterLevel: number,
    spell: SpellData
  ): boolean {
    if (!this.canClassLearnSpell(characterClass, spell)) {
      return false;
    }

    if (spell.restrictions?.minLevel && characterLevel < spell.restrictions.minLevel) {
      return false;
    }

    const maxSpellLevel = this.getMaxSpellLevelForCharacter(
      characterClass,
      characterLevel
    );

    return spell.level <= maxSpellLevel;
  }

  checkPrerequisites(character: Character, spell: SpellData): boolean {
    if (!spell.prerequisites || spell.prerequisites.length === 0) {
      return true;
    }

    const knownSpells = character.getKnownSpells();
    for (const prerequisite of spell.prerequisites) {
      if (!knownSpells.includes(prerequisite)) {
        return false;
      }
    }

    return true;
  }

  validateSpellCasting(
    caster: Character,
    spell: SpellData,
    inCombat: boolean
  ): SpellValidationResult {
    if (!caster.knowsSpell(spell.id)) {
      return {
        canCast: false,
        reason: 'Character does not know this spell'
      };
    }

    if (caster.getCurrentMP() < spell.mpCost) {
      return {
        canCast: false,
        reason: 'Not enough MP',
        mpRequired: spell.mpCost,
        mpAvailable: caster.getCurrentMP()
      };
    }

    if (caster.hasStatusEffect('silenced')) {
      return {
        canCast: false,
        reason: 'Character is silenced'
      };
    }

    if (inCombat && !spell.inCombat) {
      return {
        canCast: false,
        reason: 'This spell cannot be cast in combat'
      };
    }

    if (!inCombat && !spell.outOfCombat) {
      return {
        canCast: false,
        reason: 'This spell can only be cast in combat'
      };
    }

    if (spell.restrictions?.alignment) {
      const characterAlignment = caster.getAlignment();
      if (!spell.restrictions.alignment.includes(characterAlignment)) {
        return {
          canCast: false,
          reason: `This spell requires ${spell.restrictions.alignment.join(' or ')} alignment`
        };
      }
    }

    return {
      canCast: true,
      mpRequired: spell.mpCost,
      mpAvailable: caster.getCurrentMP()
    };
  }

  calculateFizzleChance(caster: Character, spell: SpellData): number {
    const levelDiff = spell.level - Math.floor(caster.getLevel() / 2);
    const intModifier = Math.max(0, 18 - caster.getStats().intelligence) * 2;
    const classModifier = this.getClassCastingModifier(caster.getClass());
    const spellModifier = spell.fizzleModifier || 0;

    let baseChance = Math.max(0, levelDiff * 10);
    baseChance += intModifier;
    baseChance += classModifier;
    baseChance += spellModifier;

    const luckModifier = (18 - caster.getStats().luck) * 0.5;
    baseChance += luckModifier;

    return Math.max(0, Math.min(95, baseChance));
  }

  private getClassCastingModifier(characterClass: CharacterClass): number {
    switch (characterClass) {
      case CharacterClasses.MAGE:
      case CharacterClasses.PRIEST:
      case CharacterClasses.ALCHEMIST:
      case CharacterClasses.PSIONIC:
        return 0;
      case CharacterClasses.BISHOP:
        return 5;
      case CharacterClasses.RANGER:
      case CharacterClasses.BARD:
      case CharacterClasses.LORD:
      case CharacterClasses.VALKYRIE:
        return 10;
      case CharacterClasses.SAMURAI:
      case CharacterClasses.MONK:
        return 15;
      default:
        return 100;
    }
  }

  getAllSpells(): SpellData[] {
    return Array.from(this.spellsById.values());
  }

  searchSpells(query: string): SpellData[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllSpells().filter(spell =>
      spell.name.toLowerCase().includes(lowerQuery) ||
      spell.description.toLowerCase().includes(lowerQuery) ||
      spell.id.includes(lowerQuery) ||
      (spell.originalName && spell.originalName.toLowerCase().includes(lowerQuery))
    );
  }
}