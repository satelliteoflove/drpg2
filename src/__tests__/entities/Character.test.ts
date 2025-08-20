import { describe, it, expect, beforeEach } from '@jest/globals';
import { Character } from '../../entities/Character';
import { TestUtils } from '../testUtils';

describe('Character', () => {
  describe('Character creation', () => {
    it('should create a character with valid parameters', () => {
      const character = TestUtils.createTestCharacter({
        name: 'Aragorn',
        race: 'Human',
        class: 'Fighter',
        alignment: 'Good'
      });

      expect(character.name).toBe('Aragorn');
      expect(character.race).toBe('Human');
      expect(character.class).toBe('Fighter');
      expect(character.alignment).toBe('Good');
      expect(character.level).toBe(1);
      expect(character.isDead).toBe(false);
      expect(typeof character.id).toBe('string');
    });

    it('should have valid starting stats', () => {
      const character = TestUtils.createTestCharacter();

      expect(character.stats.strength).toBeGreaterThanOrEqual(3);
      expect(character.stats.strength).toBeLessThanOrEqual(18);
      expect(character.stats.intelligence).toBeGreaterThanOrEqual(3);
      expect(character.stats.intelligence).toBeLessThanOrEqual(18);
      expect(character.stats.piety).toBeGreaterThanOrEqual(3);
      expect(character.stats.piety).toBeLessThanOrEqual(18);
      expect(character.stats.vitality).toBeGreaterThanOrEqual(3);
      expect(character.stats.vitality).toBeLessThanOrEqual(18);
      expect(character.stats.agility).toBeGreaterThanOrEqual(3);
      expect(character.stats.agility).toBeLessThanOrEqual(18);
      expect(character.stats.luck).toBeGreaterThanOrEqual(3);
      expect(character.stats.luck).toBeLessThanOrEqual(18);
    });

    it('should have reasonable starting HP and MP', () => {
      const character = TestUtils.createTestCharacter();

      expect(character.hp).toBeGreaterThan(0);
      expect(character.maxHp).toBeGreaterThan(0);
      expect(character.hp).toBeLessThanOrEqual(character.maxHp);
      expect(character.mp).toBeGreaterThanOrEqual(0);
      expect(character.maxMp).toBeGreaterThanOrEqual(0);
      expect(character.mp).toBeLessThanOrEqual(character.maxMp);
    });
  });

  describe('Character progression', () => {
    let character: Character;

    beforeEach(() => {
      character = TestUtils.createTestCharacter();
    });

    it('should gain experience points', () => {
      const initialExp = character.experience;
      const expGained = 100;

      character.addExperience(expGained);

      expect(character.experience).toBe(initialExp + expGained);
    });

    it('should level up when gaining enough experience', () => {
      const initialLevel = character.level;
      const largeExpGain = 10000;

      character.addExperience(largeExpGain);

      expect(character.level).toBeGreaterThan(initialLevel);
    });

    it('should increase max HP when leveling up', () => {
      const initialMaxHp = character.maxHp;
      const largeExpGain = 10000;

      character.addExperience(largeExpGain);

      expect(character.maxHp).toBeGreaterThan(initialMaxHp);
    });
  });

  describe('Character status management', () => {
    let character: Character;

    beforeEach(() => {
      character = TestUtils.createTestCharacter();
    });

    it('should take damage and reduce HP', () => {
      const initialHp = character.hp;
      const damage = 5;

      character.takeDamage(damage);

      expect(character.hp).toBe(initialHp - damage);
    });

    it('should not reduce HP below 0', () => {
      const damage = character.hp + 10;

      character.takeDamage(damage);

      expect(character.hp).toBe(0);
    });

    it('should heal HP but not exceed max HP', () => {
      character.hp = 1;
      const healing = character.maxHp + 10;

      character.heal(healing);

      expect(character.hp).toBe(character.maxHp);
    });

    it('should attempt resurrection from death', () => {
      character.hp = 0;
      character.takeDamage(1); // This should mark as dead

      expect(character.isDead).toBe(true);
      character.resurrect();

      // Resurrection might fail randomly, so we just check it was attempted
      expect(character.status === 'Ashed' || !character.isDead).toBe(true);
    });
  });

  describe('Character equipment', () => {
    let character: Character;

    beforeEach(() => {
      character = TestUtils.createTestCharacter();
    });

    it('should start with empty equipment slots', () => {
      expect(Object.keys(character.equipment)).toHaveLength(0);
    });

    it('should have an empty inventory initially', () => {
      expect(character.inventory).toHaveLength(0);
    });

    it('should have initial gold amount', () => {
      expect(character.gold).toBeGreaterThanOrEqual(0);
      expect(typeof character.gold).toBe('number');
    });
  });

  describe('Character death and resurrection', () => {
    let character: Character;

    beforeEach(() => {
      character = TestUtils.createTestCharacter();
    });

    it('should mark character as dead when HP reaches 0', () => {
      character.takeDamage(character.hp);

      expect(character.isDead).toBe(true);
      expect(character.hp).toBe(0);
    });

    it('should increment death count when dying', () => {
      const initialDeathCount = character.deathCount;

      character.takeDamage(character.hp);

      expect(character.deathCount).toBe(initialDeathCount + 1);
    });

    it('should attempt to resurrect dead character', () => {
      character.takeDamage(character.hp);
      expect(character.isDead).toBe(true);

      character.resurrect();

      // Resurrection might fail and turn to ash, or succeed
      expect(character.status === 'Ashed' || !character.isDead).toBe(true);
    });
  });

  describe('Character aging', () => {
    let character: Character;

    beforeEach(() => {
      character = TestUtils.createTestCharacter();
    });

    it('should start with a reasonable age', () => {
      expect(character.age).toBeGreaterThanOrEqual(16);
      expect(character.age).toBeLessThanOrEqual(30);
    });
  });

  describe('Character experience and leveling', () => {
    let character: Character;

    beforeEach(() => {
      character = TestUtils.createTestCharacter();
    });

    it('should calculate experience needed for next level', () => {
      const expNeeded = character.getExperienceForNextLevel();
      
      expect(expNeeded).toBeGreaterThan(0);
      expect(typeof expNeeded).toBe('number');
    });

    it('should return whether character leveled up when adding experience', () => {
      const leveledUp = character.addExperience(100);
      
      expect(typeof leveledUp).toBe('boolean');
    });
  });
});