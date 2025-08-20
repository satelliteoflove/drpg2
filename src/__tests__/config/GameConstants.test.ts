import { describe, it, expect } from '@jest/globals';
import { GAME_CONFIG } from '../../config/GameConstants';

describe('GameConstants', () => {
  describe('CANVAS configuration', () => {
    it('should have valid canvas dimensions', () => {
      expect(GAME_CONFIG.CANVAS.WIDTH).toBe(1024);
      expect(GAME_CONFIG.CANVAS.HEIGHT).toBe(768);
      expect(typeof GAME_CONFIG.CANVAS.WIDTH).toBe('number');
      expect(typeof GAME_CONFIG.CANVAS.HEIGHT).toBe('number');
      expect(GAME_CONFIG.CANVAS.WIDTH).toBeGreaterThan(0);
      expect(GAME_CONFIG.CANVAS.HEIGHT).toBeGreaterThan(0);
    });
  });

  describe('ENCOUNTER configuration', () => {
    it('should have valid encounter rates', () => {
      expect(GAME_CONFIG.ENCOUNTER.RANDOM_RATE).toBe(0.02);
      expect(GAME_CONFIG.ENCOUNTER.BASE_ZONE_RATE).toBe(0.1);
      expect(GAME_CONFIG.ENCOUNTER.SURPRISE_CHANCE).toBe(0.1);
      expect(GAME_CONFIG.ENCOUNTER.LEVEL_RATE_MULTIPLIER).toBe(0.02);
      expect(typeof GAME_CONFIG.ENCOUNTER.RANDOM_RATE).toBe('number');
      expect(typeof GAME_CONFIG.ENCOUNTER.LEVEL_RATE_MULTIPLIER).toBe('number');
      expect(GAME_CONFIG.ENCOUNTER.RANDOM_RATE).toBeGreaterThan(0);
      expect(GAME_CONFIG.ENCOUNTER.RANDOM_RATE).toBeLessThan(1);
    });
  });

  describe('CHARACTER configuration', () => {
    it('should have valid stat ranges', () => {
      expect(GAME_CONFIG.CHARACTER.STAT_MIN).toBe(3);
      expect(GAME_CONFIG.CHARACTER.STAT_MAX).toBe(18);
      expect(GAME_CONFIG.CHARACTER.MAX_PARTY_SIZE).toBe(6);
      expect(GAME_CONFIG.CHARACTER.STAT_MIN).toBeGreaterThan(0);
      expect(GAME_CONFIG.CHARACTER.STAT_MAX).toBeGreaterThan(GAME_CONFIG.CHARACTER.STAT_MIN);
    });

    it('should have HP bonuses for all character classes', () => {
      const hpBonuses = GAME_CONFIG.HP_BONUSES;
      expect(hpBonuses).toHaveProperty('FIGHTER');
      expect(hpBonuses).toHaveProperty('MAGE');
      expect(hpBonuses).toHaveProperty('PRIEST');
      expect(hpBonuses).toHaveProperty('THIEF');
      expect(hpBonuses).toHaveProperty('SAMURAI');
      expect(hpBonuses).toHaveProperty('LORD');
      expect(hpBonuses).toHaveProperty('NINJA');
      expect(hpBonuses).toHaveProperty('BISHOP');
      
      // All HP bonuses should be numbers
      Object.values(hpBonuses).forEach(bonus => {
        expect(typeof bonus).toBe('number');
        expect(bonus).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('COLORS configuration', () => {
    it('should have valid color strings', () => {
      const colors = GAME_CONFIG.COLORS;
      expect(colors.BACKGROUND).toBe('#000');
      expect(colors.DEBUG_TEXT).toBe('#666');
      expect(colors.MAP_GRID).toBe('rgba(255, 255, 255, 0.1)');
      
      // Check that the basic colors are valid strings
      expect(typeof colors.BACKGROUND).toBe('string');
      expect(typeof colors.DEBUG_TEXT).toBe('string');
      expect(typeof colors.MAP_GRID).toBe('string');
    });
  });

  describe('UI configuration', () => {
    it('should have valid UI constants', () => {
      expect(GAME_CONFIG.UI.DEBUG_INFO_OFFSET).toBe(10);
      expect(typeof GAME_CONFIG.UI.DEBUG_INFO_OFFSET).toBe('number');
      expect(GAME_CONFIG.UI.DEBUG_INFO_OFFSET).toBeGreaterThan(0);
    });
  });

  describe('AUTO_SAVE configuration', () => {
    it('should have valid auto-save interval', () => {
      expect(GAME_CONFIG.AUTO_SAVE.INTERVAL_MS).toBe(30000);
      expect(typeof GAME_CONFIG.AUTO_SAVE.INTERVAL_MS).toBe('number');
      expect(GAME_CONFIG.AUTO_SAVE.INTERVAL_MS).toBeGreaterThan(0);
    });
  });

  describe('COMBAT configuration', () => {
    it('should have valid combat constants', () => {
      expect(GAME_CONFIG.COMBAT.MAX_RECURSION_DEPTH).toBe(100);
      expect(GAME_CONFIG.COMBAT.MONSTER_TURN_DELAY).toBe(1000);
      expect(typeof GAME_CONFIG.COMBAT.MAX_RECURSION_DEPTH).toBe('number');
      expect(typeof GAME_CONFIG.COMBAT.MONSTER_TURN_DELAY).toBe('number');
      expect(GAME_CONFIG.COMBAT.MAX_RECURSION_DEPTH).toBeGreaterThan(0);
      expect(GAME_CONFIG.COMBAT.MONSTER_TURN_DELAY).toBeGreaterThan(0);
    });
  });

  describe('PARTY configuration', () => {
    it('should have valid party constants', () => {
      expect(GAME_CONFIG.PARTY.FORMATION_FRONT_SIZE).toBe(3);
      expect(GAME_CONFIG.PARTY.FORMATION_BACK_SIZE).toBe(3);
      expect(GAME_CONFIG.PARTY.REST_HP_HEAL_PERCENT).toBe(0.1);
      expect(GAME_CONFIG.PARTY.REST_MP_HEAL_PERCENT).toBe(0.2);
      
      expect(typeof GAME_CONFIG.PARTY.FORMATION_FRONT_SIZE).toBe('number');
      expect(typeof GAME_CONFIG.PARTY.REST_HP_HEAL_PERCENT).toBe('number');
      
      expect(GAME_CONFIG.PARTY.FORMATION_FRONT_SIZE).toBeGreaterThan(0);
      expect(GAME_CONFIG.PARTY.REST_HP_HEAL_PERCENT).toBeGreaterThan(0);
    });
  });

  describe('DUNGEON configuration', () => {
    it('should have valid dungeon constants', () => {
      expect(GAME_CONFIG.DUNGEON.DEFAULT_WIDTH).toBe(20);
      expect(GAME_CONFIG.DUNGEON.DEFAULT_HEIGHT).toBe(20);
      expect(typeof GAME_CONFIG.DUNGEON.DEFAULT_WIDTH).toBe('number');
      expect(typeof GAME_CONFIG.DUNGEON.DEFAULT_HEIGHT).toBe('number');
      expect(GAME_CONFIG.DUNGEON.DEFAULT_WIDTH).toBeGreaterThan(0);
      expect(GAME_CONFIG.DUNGEON.DEFAULT_HEIGHT).toBeGreaterThan(0);
    });
  });

  describe('Configuration completeness', () => {
    it('should have all expected top-level configuration sections', () => {
      const expectedSections = [
        'CANVAS',
        'ENCOUNTER', 
        'CHARACTER',
        'COMBAT',
        'DEATH_SYSTEM',
        'PARTY',
        'HP_BONUSES',
        'MP_BASE',
        'SPELLCASTER_CLASSES',
        'DUNGEON',
        'INVENTORY',
        'AUTO_SAVE',
        'INPUT',
        'UI',
        'COLORS'
      ];
      
      expectedSections.forEach(section => {
        expect(GAME_CONFIG).toHaveProperty(section);
        expect(typeof GAME_CONFIG[section as keyof typeof GAME_CONFIG]).toBe('object');
      });
    });
    
    it('should not have any undefined values', () => {
      const checkForUndefined = (obj: any, path: string = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (value === undefined) {
            throw new Error(`Undefined value found at GAME_CONFIG.${currentPath}`);
          }
          
          if (typeof value === 'object' && value !== null) {
            checkForUndefined(value, currentPath);
          }
        });
      };
      
      expect(() => checkForUndefined(GAME_CONFIG)).not.toThrow();
    });
  });
});