import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TypeValidation } from '../../utils/TypeValidation';

describe('TypeValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isCharacterClass', () => {
    it('should return true for valid character classes', () => {
      expect(TypeValidation.isCharacterClass('Fighter')).toBe(true);
      expect(TypeValidation.isCharacterClass('Mage')).toBe(true);
      expect(TypeValidation.isCharacterClass('Priest')).toBe(true);
      expect(TypeValidation.isCharacterClass('Thief')).toBe(true);
    });

    it('should return false for invalid character classes', () => {
      expect(TypeValidation.isCharacterClass('InvalidClass')).toBe(false);
      expect(TypeValidation.isCharacterClass(123)).toBe(false);
      expect(TypeValidation.isCharacterClass(null)).toBe(false);
      expect(TypeValidation.isCharacterClass(undefined)).toBe(false);
    });
  });

  describe('isCharacterRace', () => {
    it('should return true for valid character races', () => {
      expect(TypeValidation.isCharacterRace('Human')).toBe(true);
      expect(TypeValidation.isCharacterRace('Elf')).toBe(true);
      expect(TypeValidation.isCharacterRace('Dwarf')).toBe(true);
      expect(TypeValidation.isCharacterRace('Gnome')).toBe(true);
      expect(TypeValidation.isCharacterRace('Hobbit')).toBe(true);
    });

    it('should return false for invalid character races', () => {
      expect(TypeValidation.isCharacterRace('Orc')).toBe(false);
      expect(TypeValidation.isCharacterRace(123)).toBe(false);
      expect(TypeValidation.isCharacterRace(null)).toBe(false);
      expect(TypeValidation.isCharacterRace(undefined)).toBe(false);
    });
  });

  describe('isCharacterAlignment', () => {
    it('should return true for valid alignments', () => {
      expect(TypeValidation.isCharacterAlignment('Good')).toBe(true);
      expect(TypeValidation.isCharacterAlignment('Neutral')).toBe(true);
      expect(TypeValidation.isCharacterAlignment('Evil')).toBe(true);
    });

    it('should return false for invalid alignments', () => {
      expect(TypeValidation.isCharacterAlignment('Chaotic')).toBe(false);
      expect(TypeValidation.isCharacterAlignment(123)).toBe(false);
      expect(TypeValidation.isCharacterAlignment(null)).toBe(false);
      expect(TypeValidation.isCharacterAlignment(undefined)).toBe(false);
    });
  });

  describe('isDirection', () => {
    it('should return true for valid directions', () => {
      expect(TypeValidation.isDirection('north')).toBe(true);
      expect(TypeValidation.isDirection('south')).toBe(true);
      expect(TypeValidation.isDirection('east')).toBe(true);
      expect(TypeValidation.isDirection('west')).toBe(true);
    });

    it('should return false for invalid directions', () => {
      expect(TypeValidation.isDirection('northeast')).toBe(false);
      expect(TypeValidation.isDirection(123)).toBe(false);
      expect(TypeValidation.isDirection(null)).toBe(false);
      expect(TypeValidation.isDirection(undefined)).toBe(false);
    });
  });

  describe('isCharacterStats', () => {
    it('should return true for valid character stats', () => {
      const validStats = {
        strength: 15,
        intelligence: 12,
        piety: 10,
        vitality: 14,
        agility: 13,
        luck: 11
      };
      expect(TypeValidation.isCharacterStats(validStats)).toBe(true);
    });

    it('should return false for invalid character stats', () => {
      expect(TypeValidation.isCharacterStats(null)).toBe(false);
      expect(TypeValidation.isCharacterStats({})).toBe(false);
      expect(TypeValidation.isCharacterStats({
        strength: 15,
        intelligence: 12
        // missing required stats
      })).toBe(false);
      expect(TypeValidation.isCharacterStats({
        strength: 30, // too high
        intelligence: 12,
        piety: 10,
        vitality: 14,
        agility: 13,
        luck: 11
      })).toBe(false);
    });
  });

  describe('generateSecureId', () => {
    it('should generate different IDs on each call', () => {
      // Mock crypto.randomUUID to return different values
      let callCount = 0;
      const mockRandomUUID = jest.fn(() => `test-uuid-${++callCount}`);
      Object.defineProperty(window, 'crypto', {
        value: { randomUUID: mockRandomUUID },
        configurable: true
      });
      
      const id1 = TypeValidation.generateSecureId();
      const id2 = TypeValidation.generateSecureId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs with reasonable length', () => {
      const id = TypeValidation.generateSecureId();
      expect(id.length).toBeGreaterThan(10);
    });

    it('should use crypto.randomUUID when available', () => {
      const mockRandomUUID = jest.fn(() => 'mock-uuid-12345');
      Object.defineProperty(window, 'crypto', {
        value: { randomUUID: mockRandomUUID },
        configurable: true
      });
      
      const id = TypeValidation.generateSecureId();
      
      expect(mockRandomUUID).toHaveBeenCalled();
      expect(id).toBe('mock-uuid-12345');
    });
  });

  describe('sanitizeString', () => {
    it('should sanitize strings properly', () => {
      expect(TypeValidation.sanitizeString('  hello  ')).toBe('  hello  ');
      expect(TypeValidation.sanitizeString('test<script>alert()</script>')).toBe('testscriptalert()/script');
      expect(TypeValidation.sanitizeString('very long string that exceeds default limit', 10)).toBe('very long ');
    });

    it('should handle non-strings', () => {
      expect(TypeValidation.sanitizeString(123)).toBe('123');
      expect(TypeValidation.sanitizeString(null)).toBe('null');
      expect(TypeValidation.sanitizeString(undefined)).toBe('undefined');
    });

    it('should handle empty strings', () => {
      expect(TypeValidation.sanitizeString('')).toBe('');
      expect(TypeValidation.sanitizeString('   ')).toBe('   ');
    });
  });

  describe('clampNumber', () => {
    it('should clamp numbers within range', () => {
      expect(TypeValidation.clampNumber(5, 1, 10)).toBe(5);
      expect(TypeValidation.clampNumber(15, 1, 10)).toBe(10);
      expect(TypeValidation.clampNumber(-5, 1, 10)).toBe(1);
    });

    it('should handle edge cases', () => {
      expect(TypeValidation.clampNumber(1, 1, 10)).toBe(1);
      expect(TypeValidation.clampNumber(10, 1, 10)).toBe(10);
    });
  });

  describe('safeValidateGameState', () => {
    it('should return null for invalid input', () => {
      expect(TypeValidation.safeValidateGameState(null)).toBeNull();
      expect(TypeValidation.safeValidateGameState(undefined)).toBeNull();
      expect(TypeValidation.safeValidateGameState('not an object')).toBeNull();
      expect(TypeValidation.safeValidateGameState(123)).toBeNull();
    });

    it('should return null for objects missing required properties', () => {
      expect(TypeValidation.safeValidateGameState({})).toBeNull();
      expect(TypeValidation.safeValidateGameState({ party: {} })).toBeNull();
      expect(TypeValidation.safeValidateGameState({ 
        party: {}, 
        dungeon: [] 
      })).toBeNull();
    });

    it('should validate valid game state object', () => {
      const validGameState = {
        party: {
          x: 0,
          y: 0,
          facing: 'north',
          floor: 1,
          formation: [],
          characters: []
        },
        dungeon: [],
        currentFloor: 1,
        inCombat: false,
        gameTime: 0,
        turnCount: 0,
        combatEnabled: true
      };
      
      const result = TypeValidation.safeValidateGameState(validGameState);
      expect(result).not.toBeNull();
      expect(result?.currentFloor).toBe(1);
      expect(result?.inCombat).toBe(false);
    });
  });

  describe('safeValidateParty', () => {
    it('should return null for invalid party data', () => {
      expect(TypeValidation.safeValidateParty(null, 'test')).toBeNull();
      expect(TypeValidation.safeValidateParty('not object', 'test')).toBeNull();
      expect(TypeValidation.safeValidateParty({}, 'test')).toBeNull();
    });

    it('should validate valid party object', () => {
      const validParty = {
        x: 5,
        y: 10,
        facing: 'north',
        floor: 1,
        formation: [],
        characters: []
      };
      
      const result = TypeValidation.safeValidateParty(validParty, 'test');
      expect(result).not.toBeNull();
      expect(result?.x).toBe(5);
      expect(result?.y).toBe(10);
      expect(result?.facing).toBe('north');
    });

    it('should handle party with invalid numeric values', () => {
      const invalidParty = {
        x: 'not a number',
        y: 10,
        facing: 'north',
        floor: 1,
        formation: [],
        characters: []
      };
      
      const result = TypeValidation.safeValidateParty(invalidParty, 'test');
      expect(result).toBeNull();
    });
  });

  describe('isValidCharacter', () => {
    it('should return false for invalid character data', () => {
      expect(TypeValidation.isValidCharacter(null)).toBe(false);
      expect(TypeValidation.isValidCharacter({})).toBe(false);
      expect(TypeValidation.isValidCharacter({ name: 'Test' })).toBe(false);
    });

    it('should validate complete character objects', () => {
      const validCharacter = {
        id: 'test-id',
        name: 'Hero',
        race: 'Human',
        class: 'Fighter',
        alignment: 'Good',
        level: 1,
        experience: 0,
        stats: { strength: 15, intelligence: 12, piety: 10, vitality: 14, agility: 13, luck: 11 },
        baseStats: { strength: 15, intelligence: 12, piety: 10, vitality: 14, agility: 13, luck: 11 },
        hp: 10,
        maxHp: 10,
        mp: 5,
        maxMp: 5,
        ac: 10,
        status: 'normal',
        age: 20,
        gold: 100,
        equipment: {},
        inventory: [],
        spells: [],
        isDead: false,
        deathCount: 0
      };
      
      expect(TypeValidation.isValidCharacter(validCharacter)).toBe(true);
    });

    it('should reject character with invalid types', () => {
      const invalidCharacter = {
        id: 'test-id',
        name: 123, // should be string
        race: 'Human',
        class: 'Fighter',
        alignment: 'Good',
        level: 1,
        experience: 0,
        stats: { strength: 15, intelligence: 12, piety: 10, vitality: 14, agility: 13, luck: 11 },
        baseStats: { strength: 15, intelligence: 12, piety: 10, vitality: 14, agility: 13, luck: 11 },
        hp: 10,
        maxHp: 10,
        mp: 5,
        maxMp: 5,
        ac: 10,
        status: 'normal',
        age: 20,
        gold: 100,
        equipment: {},
        inventory: [],
        spells: [],
        isDead: false,
        deathCount: 0
      };
      
      expect(TypeValidation.isValidCharacter(invalidCharacter)).toBe(false);
    });
  });
});