import {
  ICharacter,
  CharacterAlignment,
  CharacterClass,
  CharacterRace,
  CharacterStats,
  Direction,
  GameState,
  IParty,
} from '../types/GameTypes';
import { ErrorHandler, ErrorSeverity } from './ErrorHandler';

export class TypeValidation {
  static isCharacterClass(value: any): value is CharacterClass {
    const validClasses: CharacterClass[] = [
      'Fighter',
      'Mage',
      'Priest',
      'Thief',
      'Bishop',
      'Samurai',
      'Lord',
      'Ninja',
    ];
    return typeof value === 'string' && validClasses.includes(value as CharacterClass);
  }

  static isCharacterRace(value: any): value is CharacterRace {
    const validRaces: CharacterRace[] = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Hobbit'];
    return typeof value === 'string' && validRaces.includes(value as CharacterRace);
  }

  static isCharacterAlignment(value: any): value is CharacterAlignment {
    const validAlignments: CharacterAlignment[] = ['Good', 'Neutral', 'Evil'];
    return typeof value === 'string' && validAlignments.includes(value as CharacterAlignment);
  }

  static isDirection(value: any): value is Direction {
    const validDirections: Direction[] = ['north', 'south', 'east', 'west'];
    return typeof value === 'string' && validDirections.includes(value as Direction);
  }

  static isCharacterStats(value: any): value is CharacterStats {
    if (typeof value !== 'object' || value === null) return false;

    const requiredStats = ['strength', 'intelligence', 'piety', 'vitality', 'agility', 'luck'];
    return requiredStats.every(
      (stat) => typeof value[stat] === 'number' && value[stat] >= 3 && value[stat] <= 25
    );
  }

  static isValidCharacter(value: any): value is ICharacter {
    if (typeof value !== 'object' || value === null) return false;

    const requiredFields = [
      'id',
      'name',
      'race',
      'class',
      'alignment',
      'level',
      'experience',
      'stats',
      'baseStats',
      'hp',
      'maxHp',
      'mp',
      'maxMp',
      'ac',
      'status',
      'age',
      'gold',
      'equipment',
      'inventory',
      'spells',
      'isDead',
      'deathCount',
    ];

    return (
      requiredFields.every((field) => field in value) &&
      typeof value.id === 'string' &&
      typeof value.name === 'string' &&
      this.isCharacterRace(value.race) &&
      this.isCharacterClass(value.class) &&
      this.isCharacterAlignment(value.alignment) &&
      typeof value.level === 'number' &&
      typeof value.experience === 'number' &&
      this.isCharacterStats(value.stats) &&
      this.isCharacterStats(value.baseStats) &&
      typeof value.hp === 'number' &&
      typeof value.maxHp === 'number' &&
      typeof value.mp === 'number' &&
      typeof value.maxMp === 'number' &&
      typeof value.ac === 'number' &&
      typeof value.age === 'number' &&
      typeof value.gold === 'number' &&
      typeof value.isDead === 'boolean' &&
      typeof value.deathCount === 'number' &&
      Array.isArray(value.inventory) &&
      Array.isArray(value.spells)
    );
  }

  static isValidPartyData(value: any): value is IParty {
    if (typeof value !== 'object' || value === null) return false;

    const hasCharacters = 'characters' in value &&
      (Array.isArray(value.characters) ||
       (typeof value.characters === 'object' && value.characters !== null));

    return (
      hasCharacters &&
      'formation' in value &&
      'x' in value &&
      'y' in value &&
      'facing' in value &&
      'floor' in value &&
      typeof value.x === 'number' &&
      typeof value.y === 'number' &&
      this.isDirection(value.facing) &&
      typeof value.floor === 'number'
    );
  }

  static isValidGameState(value: any): value is GameState {
    if (typeof value !== 'object' || value === null) return false;

    return (
      'party' in value &&
      'dungeon' in value &&
      'currentFloor' in value &&
      'inCombat' in value &&
      'gameTime' in value &&
      'turnCount' in value &&
      Array.isArray(value.dungeon) &&
      typeof value.currentFloor === 'number' &&
      typeof value.inCombat === 'boolean' &&
      typeof value.gameTime === 'number' &&
      typeof value.turnCount === 'number'
    );
  }

  static safeValidateCharacter(
    value: any,
    context: string = 'Character Validation'
  ): ICharacter | null {
    try {
      if (this.isValidCharacter(value)) {
        return value;
      }
    } catch (error) {
      ErrorHandler.logError(
        'Character validation failed',
        ErrorSeverity.HIGH,
        context,
        error instanceof Error ? error : undefined
      );
    }

    ErrorHandler.logError('Invalid character data structure', ErrorSeverity.HIGH, context);
    return null;
  }

  static safeValidateParty(value: any, context: string = 'Party Validation'): IParty | null {
    try {
      if (this.isValidPartyData(value)) {
        // Additional validation for characters array
        if (value.characters.every((char: any) => this.isValidCharacter(char))) {
          return value;
        }
      }
    } catch (error) {
      ErrorHandler.logError(
        'Party validation failed',
        ErrorSeverity.HIGH,
        context,
        error instanceof Error ? error : undefined
      );
    }

    ErrorHandler.logError('Invalid party data structure', ErrorSeverity.HIGH, context);
    return null;
  }

  static safeValidateGameState(
    value: any,
    context: string = 'GameState Validation'
  ): GameState | null {
    try {
      if (this.isValidGameState(value)) {
        return value;
      }
    } catch (error) {
      ErrorHandler.logError(
        'GameState validation failed',
        ErrorSeverity.HIGH,
        context,
        error instanceof Error ? error : undefined
      );
    }

    ErrorHandler.logError('Invalid game state data structure', ErrorSeverity.HIGH, context);
    return null;
  }

  static generateSecureId(): string {
    // Try crypto.randomUUID() first (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch (error) {
        ErrorHandler.logError(
          'crypto.randomUUID() failed',
          ErrorSeverity.MEDIUM,
          'ID Generation',
          error instanceof Error ? error : undefined
        );
      }
    }

    // Fallback to crypto.getRandomValues() (wider browser support)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      try {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);

        // Convert to UUID format (version 4)
        array[6] = (array[6] & 0x0f) | 0x40; // Version 4
        array[8] = (array[8] & 0x3f) | 0x80; // Variant bits

        const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
      } catch (error) {
        ErrorHandler.logError(
          'crypto.getRandomValues() failed',
          ErrorSeverity.MEDIUM,
          'ID Generation',
          error instanceof Error ? error : undefined
        );
      }
    }

    // Final fallback with timestamp + random for better uniqueness
    ErrorHandler.logError(
      'Using fallback ID generation - crypto API not available',
      ErrorSeverity.LOW,
      'ID Generation'
    );

    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);

    return `${timestamp}-${randomPart}-${randomPart2}`;
  }

  static sanitizeString(value: any, maxLength: number = 100): string {
    if (typeof value !== 'string') {
      return String(value).slice(0, maxLength);
    }

    return value.slice(0, maxLength).replace(/[<>]/g, '');
  }

  static clampNumber(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
