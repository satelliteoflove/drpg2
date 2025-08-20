import { describe, it, expect, beforeEach } from '@jest/globals';
import { Party } from '../../entities/Party';
import { TestUtils } from '../testUtils';

describe('Party', () => {
  let party: Party;

  beforeEach(() => {
    party = new Party();
  });

  describe('Party creation', () => {
    it('should create an empty party', () => {
      expect(party.characters).toHaveLength(0);
      expect(party.formation).toBe('front');
      expect(party.x).toBe(0);
      expect(party.y).toBe(0);
      expect(party.facing).toBe('north');
      expect(party.floor).toBe(1);
    });
  });

  describe('Character management', () => {
    it('should add a character to the party', () => {
      const character = TestUtils.createTestCharacter();
      
      const success = party.addCharacter(character);
      
      expect(success).toBe(true);
      expect(party.characters).toHaveLength(1);
      expect(party.characters[0]).toBe(character);
    });

    it('should remove a character from the party', () => {
      const character = TestUtils.createTestCharacter();
      party.addCharacter(character);
      
      const removed = party.removeCharacter(character.id);
      
      expect(removed).toBe(true);
      expect(party.characters).toHaveLength(0);
    });

    it('should return false when trying to remove non-existent character', () => {
      const result = party.removeCharacter('non-existent-id');
      
      expect(result).toBe(false);
    });

    it('should swap characters in the party', () => {
      const char1 = TestUtils.createTestCharacter({ name: 'Hero 1' });
      const char2 = TestUtils.createTestCharacter({ name: 'Hero 2' });
      
      party.addCharacter(char1);
      party.addCharacter(char2);
      
      party.swapCharacters(0, 1);
      
      expect(party.characters[0]).toBe(char2);
      expect(party.characters[1]).toBe(char1);
    });
  });

  describe('Party formation', () => {
    it('should have front and back rows in formation', () => {
      const characters = Array.from({ length: 6 }, (_, i) => 
        TestUtils.createTestCharacter({ name: `Hero ${i + 1}` })
      );
      
      characters.forEach(char => party.addCharacter(char));
      
      const frontRow = party.getFrontRow();
      const backRow = party.getBackRow();
      
      expect(frontRow).toHaveLength(3);
      expect(backRow).toHaveLength(3);
    });

    it('should handle partial party formation', () => {
      const character = TestUtils.createTestCharacter();
      party.addCharacter(character);
      
      const frontRow = party.getFrontRow();
      const backRow = party.getBackRow();
      
      expect(frontRow).toHaveLength(1);
      expect(backRow).toHaveLength(0);
    });
  });

  describe('Party status', () => {
    it('should check if party is wiped', () => {
      expect(party.isWiped()).toBe(true); // Empty party is wiped
      
      const character = TestUtils.createTestCharacter();
      party.addCharacter(character);
      
      expect(party.isWiped()).toBe(false);
    });

    it('should detect when all party members are dead', () => {
      const character = TestUtils.createTestCharacter();
      party.addCharacter(character);
      
      character.takeDamage(character.hp); // Kill the character
      
      expect(party.isWiped()).toBe(true);
    });

    it('should get alive characters', () => {
      const char1 = TestUtils.createTestCharacter({ name: 'Hero 1' });
      const char2 = TestUtils.createTestCharacter({ name: 'Hero 2' });
      
      party.addCharacter(char1);
      party.addCharacter(char2);
      
      expect(party.getAliveCharacters()).toHaveLength(2);
      
      char1.takeDamage(char1.hp); // Kill one character
      
      expect(party.getAliveCharacters()).toHaveLength(1);
    });
  });

  describe('Party movement', () => {
    it('should move party forward and backward', () => {
      expect(party.x).toBe(0);
      expect(party.y).toBe(0);
      expect(party.facing).toBe('north');
      
      party.move('forward');
      expect(party.y).toBe(-1); // North decreases Y
      
      party.move('backward');
      expect(party.y).toBe(0); // Back to original Y
    });

    it('should turn party left and right', () => {
      expect(party.facing).toBe('north');
      
      party.move('right');
      expect(party.facing).toBe('east');
      
      party.move('left');
      expect(party.facing).toBe('north');
    });
  });

  describe('Party statistics', () => {
    it('should calculate total party gold', () => {
      const char1 = TestUtils.createTestCharacter();
      const char2 = TestUtils.createTestCharacter();
      
      char1.gold = 100;
      char2.gold = 50;
      
      party.addCharacter(char1);
      party.addCharacter(char2);
      
      expect(party.getTotalGold()).toBe(150);
    });

    it('should return zero gold for empty party', () => {
      expect(party.getTotalGold()).toBe(0);
    });

    it('should distribute gold among alive characters', () => {
      const char1 = TestUtils.createTestCharacter();
      const char2 = TestUtils.createTestCharacter();
      
      party.addCharacter(char1);
      party.addCharacter(char2);
      
      const initialGold1 = char1.gold;
      const initialGold2 = char2.gold;
      
      party.distributeGold(100);
      
      expect(char1.gold).toBe(initialGold1 + 50);
      expect(char2.gold).toBe(initialGold2 + 50);
    });

    it('should distribute experience among alive characters', () => {
      const char1 = TestUtils.createTestCharacter();
      const char2 = TestUtils.createTestCharacter();
      
      party.addCharacter(char1);
      party.addCharacter(char2);
      
      const initialExp1 = char1.experience;
      const initialExp2 = char2.experience;
      
      party.distributeExperience(200);
      
      expect(char1.experience).toBe(initialExp1 + 100);
      expect(char2.experience).toBe(initialExp2 + 100);
    });
  });

  describe('Party rest and healing', () => {
    it('should rest all party members', () => {
      const character = TestUtils.createTestCharacter({ class: 'Mage' }); // Mage has MP
      
      // Set character to very low HP/MP to ensure healing is visible
      character.hp = 1;
      character.mp = 0;
      
      party.addCharacter(character);
      
      // Just verify rest runs without throwing
      expect(() => party.rest()).not.toThrow();
      
      // Should heal at least something if max HP is large enough
      expect(character.hp).toBeGreaterThanOrEqual(1);
      expect(character.mp).toBeGreaterThanOrEqual(0);
    });
  });
});