import { CharacterRace, CharacterClass } from '../../types/GameTypes';

// Base experience requirements per level (from Wizardry Gaiden IV documentation)
export const BASE_EXPERIENCE_TABLE: Record<number, number> = {
  1: 0,
  2: 1000,
  3: 2500,
  4: 5000,
  5: 9000,
  6: 15000,
  7: 25000,
  8: 40000,
  9: 60000,
  10: 90000,
  11: 135000,
  12: 200000,
  13: 280000,
  14: 380000,
  15: 500000,
  16: 650000,
  17: 830000,
  18: 1050000,
  19: 1300000,
  20: 1600000
};

// Race and class experience modifiers (from Wizardry Gaiden IV documentation)
// Lower modifiers = faster leveling, Higher modifiers = slower leveling
export const EXPERIENCE_MODIFIERS: Record<CharacterRace, Record<CharacterClass, number>> = {
  Human: {
    Fighter: 1.0,
    Mage: 1.0,
    Priest: 1.0,
    Thief: 1.0,
    Alchemist: 1.0,
    Bishop: 1.2,
    Bard: 1.1,
    Ranger: 1.1,
    Psionic: 1.1,
    Valkyrie: 1.2,
    Samurai: 1.3,
    Lord: 1.3,
    Monk: 1.3,
    Ninja: 1.4
  },
  Elf: {
    Fighter: 1.1,
    Mage: 0.9,
    Priest: 0.9,
    Thief: 1.1,
    Alchemist: 1.0,
    Bishop: 1.1,
    Bard: 1.0,
    Ranger: 1.0,
    Psionic: 1.0,
    Valkyrie: 1.3,
    Samurai: 1.4,
    Lord: 1.4,
    Monk: 1.4,
    Ninja: 1.5
  },
  Dwarf: {
    Fighter: 0.9,
    Mage: 1.3,
    Priest: 1.0,
    Thief: 1.2,
    Alchemist: 1.1,
    Bishop: 1.3,
    Bard: 1.2,
    Ranger: 1.2,
    Psionic: 1.3,
    Valkyrie: 1.3,
    Samurai: 1.4,
    Lord: 1.2,
    Monk: 1.4,
    Ninja: 1.5
  },
  Gnome: {
    Fighter: 1.0,
    Mage: 1.1,
    Priest: 0.8,
    Thief: 1.0,
    Alchemist: 0.9,
    Bishop: 1.0,
    Bard: 1.1,
    Ranger: 1.1,
    Psionic: 1.0,
    Valkyrie: 1.4,
    Samurai: 1.5,
    Lord: 1.4,
    Monk: 1.3,
    Ninja: 1.4
  },
  Hobbit: {
    Fighter: 1.1,
    Mage: 1.1,
    Priest: 1.2,
    Thief: 0.8,
    Alchemist: 1.1,
    Bishop: 1.3,
    Bard: 1.0,
    Ranger: 1.0,
    Psionic: 1.2,
    Valkyrie: 1.5,
    Samurai: 1.5,
    Lord: 1.5,
    Monk: 1.4,
    Ninja: 1.3
  },
  Faerie: {
    Fighter: 1.4,
    Mage: 0.8,
    Priest: 1.2,
    Thief: 0.9,
    Alchemist: 1.0,
    Bishop: 1.1,
    Bard: 0.9,
    Ranger: 1.0,
    Psionic: 0.9,
    Valkyrie: 1.4,
    Samurai: 1.6,
    Lord: 1.6,
    Monk: 1.5,
    Ninja: 1.3
  },
  Lizman: {
    Fighter: 0.8,
    Mage: 1.4,
    Priest: 1.4,
    Thief: 1.3,
    Alchemist: 1.3,
    Bishop: 1.5,
    Bard: 1.4,
    Ranger: 1.2,
    Psionic: 1.4,
    Valkyrie: 1.2,
    Samurai: 1.3,
    Lord: 1.3,
    Monk: 1.3,
    Ninja: 1.5
  },
  Dracon: {
    Fighter: 0.9,
    Mage: 1.2,
    Priest: 1.3,
    Thief: 1.1,
    Alchemist: 1.2,
    Bishop: 1.4,
    Bard: 1.2,
    Ranger: 1.1,
    Psionic: 1.3,
    Valkyrie: 1.3,
    Samurai: 1.3,
    Lord: 1.3,
    Monk: 1.4,
    Ninja: 1.5
  },
  Rawulf: {
    Fighter: 1.1,
    Mage: 1.3,
    Priest: 0.9,
    Thief: 1.1,
    Alchemist: 1.0,
    Bishop: 1.2,
    Bard: 1.1,
    Ranger: 1.0,
    Psionic: 1.0,
    Valkyrie: 1.4,
    Samurai: 1.4,
    Lord: 1.3,
    Monk: 1.3,
    Ninja: 1.4
  },
  Mook: {
    Fighter: 1.0,
    Mage: 1.0,
    Priest: 1.3,
    Thief: 1.1,
    Alchemist: 1.1,
    Bishop: 1.2,
    Bard: 1.1,
    Ranger: 1.1,
    Psionic: 1.1,
    Valkyrie: 1.3,
    Samurai: 1.3,
    Lord: 1.4,
    Monk: 1.4,
    Ninja: 1.4
  },
  Felpurr: {
    Fighter: 1.2,
    Mage: 1.0,
    Priest: 1.2,
    Thief: 0.9,
    Alchemist: 1.1,
    Bishop: 1.3,
    Bard: 1.0,
    Ranger: 1.0,
    Psionic: 1.1,
    Valkyrie: 1.3,
    Samurai: 1.4,
    Lord: 1.5,
    Monk: 1.3,
    Ninja: 1.3
  }
};

/**
 * Calculate the actual experience points required for a character to reach a specific level
 * based on their race and class combination.
 *
 * @param level - Target level (1-20)
 * @param race - Character's race
 * @param characterClass - Character's class
 * @returns Experience points required to reach the specified level
 */
export function calculateExperienceRequired(
  level: number,
  race: CharacterRace,
  characterClass: CharacterClass
): number {
  if (level < 1 || level > 20) {
    throw new Error(`Invalid level: ${level}. Level must be between 1 and 20.`);
  }

  const baseExperience = BASE_EXPERIENCE_TABLE[level];
  const modifier = EXPERIENCE_MODIFIERS[race][characterClass];

  return Math.floor(baseExperience * modifier);
}

/**
 * Get the experience modifier for a specific race and class combination.
 *
 * @param race - Character's race
 * @param characterClass - Character's class
 * @returns Experience modifier (multiplier for base experience requirements)
 */
export function getExperienceModifier(
  race: CharacterRace,
  characterClass: CharacterClass
): number {
  return EXPERIENCE_MODIFIERS[race][characterClass];
}

/**
 * Calculate how much additional experience is needed to level up.
 *
 * @param currentExperience - Character's current experience points
 * @param currentLevel - Character's current level
 * @param race - Character's race
 * @param characterClass - Character's class
 * @returns Experience points needed to reach the next level, or 0 if already at max level
 */
export function calculateExperienceToNextLevel(
  currentExperience: number,
  currentLevel: number,
  race: CharacterRace,
  characterClass: CharacterClass
): number {
  if (currentLevel >= 20) {
    return 0; // Already at max level
  }

  const nextLevelRequirement = calculateExperienceRequired(currentLevel + 1, race, characterClass);
  const remaining = nextLevelRequirement - currentExperience;

  return Math.max(0, remaining);
}

/**
 * Determine what level a character should be based on their current experience.
 *
 * @param currentExperience - Character's current experience points
 * @param race - Character's race
 * @param characterClass - Character's class
 * @returns The level the character should be at with their current experience
 */
export function calculateLevelFromExperience(
  currentExperience: number,
  race: CharacterRace,
  characterClass: CharacterClass
): number {
  for (let level = 20; level >= 1; level--) {
    const requiredExp = calculateExperienceRequired(level, race, characterClass);
    if (currentExperience >= requiredExp) {
      return level;
    }
  }
  return 1;
}