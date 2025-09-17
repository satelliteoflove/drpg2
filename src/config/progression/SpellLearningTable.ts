import { CharacterClass } from '../../types/GameTypes';

// Spell learning schedules by class (from Wizardry Gaiden IV documentation)
// Maps spell level to character level when that spell level is learned

export const SPELL_LEARNING_TABLE: Record<CharacterClass, Record<number, number>> = {
  // Pure Spellcasters - Learn spells at levels 1,3,5,7,9,11,13,21
  Mage: {
    1: 1,
    2: 3,
    3: 5,
    4: 7,
    5: 9,
    6: 11,
    7: 13,
    8: 21
  },
  Priest: {
    1: 1,
    2: 3,
    3: 5,
    4: 7,
    5: 9,
    6: 11,
    7: 13,
    8: 21
  },
  Alchemist: {
    1: 1,
    2: 3,
    3: 5,
    4: 7,
    5: 9,
    6: 11,
    7: 13,
    8: 21
  },
  Psionic: {
    1: 1,
    2: 3,
    3: 5,
    4: 7,
    5: 9,
    6: 11,
    7: 13,
    8: 21
  },

  // Hybrid Spellcasters - Learn at levels 4,6,8,10,12,14,16,24
  Samurai: {
    1: 4,
    2: 7,
    3: 10,
    4: 13,
    5: 16,
    6: 19,
    7: 22,
    8: 30
  },
  Lord: {
    1: 4,
    2: 6,
    3: 8,
    4: 10,
    5: 12,
    6: 14,
    7: 16,
    8: 24
  },
  Valkyrie: {
    1: 4,
    2: 6,
    3: 8,
    4: 10,
    5: 12,
    6: 14,
    7: 16,
    8: 24
  },
  Ranger: {
    1: 4,
    2: 6,
    3: 8,
    4: 10,
    5: 12,
    6: 14,
    7: 16,
    8: 24
  },
  Bard: {
    1: 4,
    2: 6,
    3: 8,
    4: 10,
    5: 12,
    6: 14,
    7: 16,
    8: 24
  },

  // Multi-School Spellcasters
  Bishop: {
    1: 1,
    2: 5,
    3: 9,
    4: 13,
    5: 17,
    6: 21,
    7: 25,
    8: 33
  },
  Ninja: {
    1: 7,
    2: 10,
    3: 13,
    4: 16,
    5: 19,
    6: 22,
    7: 25,
    8: 33
  },
  Monk: {
    1: 7,
    2: 10,
    3: 13,
    4: 16,
    5: 19,
    6: 22,
    7: 25,
    8: 33
  },

  // Non-spellcasting classes
  Fighter: {},
  Thief: {}
};

// Define which spell schools each class can learn from
export const CLASS_SPELL_SCHOOLS: Record<CharacterClass, string[]> = {
  Mage: ['mage'],
  Priest: ['priest'],
  Alchemist: ['alchemist'],
  Psionic: ['psionic'],
  Samurai: ['mage'],
  Lord: ['priest'],
  Valkyrie: ['priest'],
  Ranger: ['priest', 'alchemist'], // Nature-oriented mix
  Bard: ['mage'], // Musical magic treated as mage spells
  Bishop: ['mage', 'priest'], // Multi-school access
  Ninja: ['mage', 'alchemist'], // Stealth and utility magic
  Monk: ['priest', 'psionic'], // Spiritual and mental disciplines
  Fighter: [], // No spellcasting
  Thief: [] // No spellcasting
};

/**
 * Get the character level at which a class learns spells of a specific level.
 *
 * @param characterClass - The character's class
 * @param spellLevel - The spell level (1-8)
 * @returns Character level when spell level is learned, or null if class can't learn that spell level
 */
export function getSpellLearningLevel(
  characterClass: CharacterClass,
  spellLevel: number
): number | null {
  if (spellLevel < 1 || spellLevel > 8) {
    throw new Error(`Invalid spell level: ${spellLevel}. Spell level must be between 1 and 8.`);
  }

  const classTable = SPELL_LEARNING_TABLE[characterClass];
  return classTable[spellLevel] || null;
}

/**
 * Get all spell levels that a character can learn at their current level.
 *
 * @param characterClass - The character's class
 * @param characterLevel - The character's current level
 * @returns Array of spell levels the character can learn
 */
export function getAvailableSpellLevels(
  characterClass: CharacterClass,
  characterLevel: number
): number[] {
  const classTable = SPELL_LEARNING_TABLE[characterClass];
  const availableSpellLevels: number[] = [];

  for (const spellLevel in classTable) {
    const requiredLevel = classTable[parseInt(spellLevel)];
    if (characterLevel >= requiredLevel) {
      availableSpellLevels.push(parseInt(spellLevel));
    }
  }

  return availableSpellLevels.sort((a, b) => a - b);
}

/**
 * Get the spell schools that a character class can learn from.
 *
 * @param characterClass - The character's class
 * @returns Array of spell school names the class can learn from
 */
export function getClassSpellSchools(characterClass: CharacterClass): string[] {
  return CLASS_SPELL_SCHOOLS[characterClass] || [];
}

/**
 * Check if a character class can learn spells.
 *
 * @param characterClass - The character's class
 * @returns True if the class can learn spells, false otherwise
 */
export function canClassLearnSpells(characterClass: CharacterClass): boolean {
  const classTable = SPELL_LEARNING_TABLE[characterClass];
  return Object.keys(classTable).length > 0;
}

/**
 * Get the next spell level that a character will learn, if any.
 *
 * @param characterClass - The character's class
 * @param characterLevel - The character's current level
 * @returns Object with next spell level and required character level, or null if no more spells
 */
export function getNextSpellLearningOpportunity(
  characterClass: CharacterClass,
  characterLevel: number
): { spellLevel: number; requiredLevel: number } | null {
  const classTable = SPELL_LEARNING_TABLE[characterClass];

  for (const spellLevel in classTable) {
    const requiredLevel = classTable[parseInt(spellLevel)];
    if (characterLevel < requiredLevel) {
      return {
        spellLevel: parseInt(spellLevel),
        requiredLevel: requiredLevel
      };
    }
  }

  return null; // No more spells to learn
}

/**
 * Get all spell learning milestones for a character class.
 *
 * @param characterClass - The character's class
 * @returns Array of objects containing spell level and required character level
 */
export function getAllSpellLearningMilestones(
  characterClass: CharacterClass
): { spellLevel: number; requiredLevel: number }[] {
  const classTable = SPELL_LEARNING_TABLE[characterClass];
  const milestones: { spellLevel: number; requiredLevel: number }[] = [];

  for (const spellLevel in classTable) {
    milestones.push({
      spellLevel: parseInt(spellLevel),
      requiredLevel: classTable[parseInt(spellLevel)]
    });
  }

  return milestones.sort((a, b) => a.requiredLevel - b.requiredLevel);
}