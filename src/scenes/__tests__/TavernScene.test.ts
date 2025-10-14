import { TavernScene } from '../TavernScene';
import { SceneManager } from '../../core/Scene';
import { GameState } from '../../types/GameTypes';
import { TestUtils } from '../../__tests__/testUtils';

describe('TavernScene', () => {
  let tavernScene: TavernScene;
  let mockGameState: GameState;
  let mockSceneManager: SceneManager;

  beforeEach(() => {
    mockGameState = TestUtils.createTestGameState();
    mockGameState.characterRoster = [];
    mockGameState.party.characters = [];
    mockGameState.messageLog = {
      add: jest.fn(),
      clear: jest.fn(),
      render: jest.fn(),
    };

    mockSceneManager = {
      switchTo: jest.fn(),
      getCurrentScene: jest.fn(),
    } as unknown as SceneManager;

    tavernScene = new TavernScene(mockGameState, mockSceneManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor & Lifecycle', () => {
    it('should initialize all components', () => {
      expect((tavernScene as any).stateManager).toBeDefined();
      expect((tavernScene as any).serviceHandler).toBeDefined();
      expect((tavernScene as any).uiRenderer).toBeDefined();
      expect((tavernScene as any).inputHandler).toBeDefined();
    });

    it('should reset state on enter', () => {
      const resetSpy = jest.spyOn((tavernScene as any).stateManager, 'reset');
      tavernScene.enter();
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should add welcome message on enter', () => {
      tavernScene.enter();
      expect(mockGameState.messageLog.add).toHaveBeenCalledWith(
        expect.stringContaining("Gilgamesh")
      );
    });

    it('should return correct scene name', () => {
      expect(tavernScene.getName()).toBe('Tavern');
    });

    it('should have getCurrentState method', () => {
      expect(tavernScene.getCurrentState()).toBe('main');
    });
  });

  describe('Add Character to Party', () => {
    beforeEach(() => {
      const testChar1 = TestUtils.createTestCharacter({ name: 'TestChar1', class: 'Fighter', alignment: 'Good' });
      const testChar2 = TestUtils.createTestCharacter({ name: 'TestChar2', class: 'Mage', alignment: 'Neutral' });
      mockGameState.characterRoster = [testChar1, testChar2];
    });

    it('should add character to empty party', () => {
      const testChar = mockGameState.characterRoster[0];

      tavernScene.enter();

      tavernScene.handleInput('enter');

      tavernScene.handleInput('enter');

      expect(mockGameState.party.characters.length).toBe(1);
      expect(mockGameState.party.characters[0]).toBe(testChar);
      expect(mockGameState.party.characters[0].name).toBe('TestChar1');
    });

    it('should increase party size after adding character', () => {
      const initialSize = mockGameState.party.characters.length;

      tavernScene.enter();
      tavernScene.handleInput('enter');
      tavernScene.handleInput('enter');

      expect(mockGameState.party.characters.length).toBe(initialSize + 1);
    });

    it('should enforce max 6 party members', () => {
      for (let i = 0; i < 6; i++) {
        const char = TestUtils.createTestCharacter({ name: `Char${i}`, class: 'Fighter', alignment: 'Neutral' });
        mockGameState.party.characters.push(char);
      }
      mockGameState.characterRoster.push(TestUtils.createTestCharacter({ name: 'Extra', class: 'Fighter', alignment: 'Neutral' }));

      tavernScene.enter();
      tavernScene.handleInput('enter');

      expect(mockGameState.party.characters.length).toBe(6);
    });

    it('should not add dead characters to party', () => {
      const deadChar = TestUtils.createTestCharacter({ name: 'DeadChar', class: 'Fighter', alignment: 'Neutral' });
      deadChar.isDead = true;
      mockGameState.characterRoster = [deadChar];

      tavernScene.enter();
      tavernScene.handleInput('enter');

      const partySize = mockGameState.party.characters.length;
      tavernScene.handleInput('enter');

      expect(mockGameState.party.characters.length).toBe(partySize);
    });

    it('should not add character when party is full and state unchanged', () => {
      const char1 = TestUtils.createTestCharacter({ name: 'Full1', class: 'Fighter', alignment: 'Neutral' });
      const char2 = TestUtils.createTestCharacter({ name: 'Full2', class: 'Fighter', alignment: 'Neutral' });
      const char3 = TestUtils.createTestCharacter({ name: 'Full3', class: 'Fighter', alignment: 'Neutral' });
      const char4 = TestUtils.createTestCharacter({ name: 'Full4', class: 'Fighter', alignment: 'Neutral' });
      const char5 = TestUtils.createTestCharacter({ name: 'Full5', class: 'Fighter', alignment: 'Neutral' });
      const char6 = TestUtils.createTestCharacter({ name: 'Full6', class: 'Fighter', alignment: 'Neutral' });
      const extraChar = TestUtils.createTestCharacter({ name: 'Extra', class: 'Fighter', alignment: 'Neutral' });

      mockGameState.party.characters = [char1, char2, char3, char4, char5, char6];
      mockGameState.characterRoster = [char1, char2, char3, char4, char5, char6, extraChar];

      const partySnapshot = [...mockGameState.party.characters];

      tavernScene.enter();
      tavernScene.handleInput('enter');

      expect(mockGameState.party.characters.length).toBe(6);
      expect(mockGameState.party.characters).toEqual(partySnapshot);
      expect(mockGameState.party.characters).not.toContain(extraChar);
    });

    it('should not add incompatible alignment and state unchanged', () => {
      const goodChar = TestUtils.createTestCharacter({ name: 'Good', class: 'Fighter', alignment: 'Good' });
      const evilChar = TestUtils.createTestCharacter({ name: 'Evil', class: 'Fighter', alignment: 'Evil' });

      mockGameState.party.characters = [goodChar];
      mockGameState.characterRoster = [goodChar, evilChar];

      const partySnapshot = [...mockGameState.party.characters];

      tavernScene.enter();
      tavernScene.handleInput('enter');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      expect(mockGameState.party.characters.length).toBe(1);
      expect(mockGameState.party.characters).toEqual(partySnapshot);
      expect(mockGameState.party.characters).not.toContain(evilChar);
    });

    it('should return to main state after adding character', () => {
      tavernScene.enter();

      tavernScene.handleInput('enter');
      tavernScene.handleInput('enter');

      expect(tavernScene.getCurrentState()).toBe('main');
    });
  });

  describe('Alignment Compatibility', () => {
    it('should reject Good + Evil party combination', () => {
      const goodChar = TestUtils.createTestCharacter({ name: 'Good', class: 'Fighter', alignment: 'Good' });
      const evilChar = TestUtils.createTestCharacter({ name: 'Evil', class: 'Fighter', alignment: 'Evil' });
      mockGameState.party.characters = [goodChar];
      mockGameState.characterRoster = [evilChar];

      const serviceHandler = (tavernScene as any).serviceHandler;
      const canAdd = serviceHandler.isAlignmentCompatible(evilChar, mockGameState.party.characters);

      expect(canAdd).toBe(false);
    });

    it('should allow Good + Neutral party combination', () => {
      const goodChar = TestUtils.createTestCharacter({ name: 'Good', class: 'Fighter', alignment: 'Good' });
      const neutralChar = TestUtils.createTestCharacter({ name: 'Neutral', class: 'Fighter', alignment: 'Neutral' });
      mockGameState.party.characters = [goodChar];
      mockGameState.characterRoster = [neutralChar];

      const serviceHandler = (tavernScene as any).serviceHandler;
      const canAdd = serviceHandler.isAlignmentCompatible(neutralChar, mockGameState.party.characters);

      expect(canAdd).toBe(true);
    });

    it('should allow Neutral + Evil party combination', () => {
      const neutralChar = TestUtils.createTestCharacter({ name: 'Neutral', class: 'Fighter', alignment: 'Neutral' });
      const evilChar = TestUtils.createTestCharacter({ name: 'Evil', class: 'Fighter', alignment: 'Evil' });
      mockGameState.party.characters = [neutralChar];
      mockGameState.characterRoster = [evilChar];

      const serviceHandler = (tavernScene as any).serviceHandler;
      const canAdd = serviceHandler.isAlignmentCompatible(evilChar, mockGameState.party.characters);

      expect(canAdd).toBe(true);
    });

    it('should reject Evil + Good party combination', () => {
      const evilChar = TestUtils.createTestCharacter({ name: 'Evil', class: 'Fighter', alignment: 'Evil' });
      const goodChar = TestUtils.createTestCharacter({ name: 'Good', class: 'Fighter', alignment: 'Good' });
      mockGameState.party.characters = [evilChar];
      mockGameState.characterRoster = [goodChar];

      const serviceHandler = (tavernScene as any).serviceHandler;
      const canAdd = serviceHandler.isAlignmentCompatible(goodChar, mockGameState.party.characters);

      expect(canAdd).toBe(false);
    });

    it('should allow empty party with any alignment', () => {
      const char = TestUtils.createTestCharacter({ name: 'Test', class: 'Fighter', alignment: 'Evil' });
      mockGameState.party.characters = [];
      mockGameState.characterRoster = [char];

      const serviceHandler = (tavernScene as any).serviceHandler;
      const canAdd = serviceHandler.isAlignmentCompatible(char, mockGameState.party.characters);

      expect(canAdd).toBe(true);
    });
  });

  describe('Remove Character', () => {
    beforeEach(() => {
      const char1 = TestUtils.createTestCharacter({ name: 'Char1', class: 'Fighter', alignment: 'Good' });
      const char2 = TestUtils.createTestCharacter({ name: 'Char2', class: 'Mage', alignment: 'Neutral' });
      char1.gold = 100;
      char2.gold = 200;
      mockGameState.party.characters = [char1, char2];
    });

    it('should remove character from party', () => {
      const initialSize = mockGameState.party.characters.length;
      const char1 = mockGameState.party.characters[0];
      const char2 = mockGameState.party.characters[1];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');
      tavernScene.handleInput('enter');

      expect(mockGameState.party.characters.length).toBe(initialSize - 1);
      expect(mockGameState.party.characters[0]).toBe(char2);
      expect(mockGameState.party.characters).not.toContain(char1);
    });

    it('should keep character in roster after removal from party', () => {
      const char1 = TestUtils.createTestCharacter({ name: 'Char1', class: 'Fighter', alignment: 'Good' });
      const char2 = TestUtils.createTestCharacter({ name: 'Char2', class: 'Mage', alignment: 'Neutral' });
      mockGameState.characterRoster = [char1, char2];
      mockGameState.party.characters = [char1, char2];

      const initialRosterSize = mockGameState.characterRoster.length;
      const removedChar = mockGameState.party.characters[0];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');
      tavernScene.handleInput('enter');

      expect(mockGameState.characterRoster.length).toBe(initialRosterSize);
      expect(mockGameState.characterRoster).toContain(removedChar);
      expect(mockGameState.party.characters).not.toContain(removedChar);
    });

    it('should retain character gold when removed', () => {
      const char = mockGameState.party.characters[0];
      const originalGold = char.gold;

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');
      tavernScene.handleInput('enter');

      expect(char.gold).toBe(originalGold);
    });

    it('should return to main state after removing', () => {
      tavernScene.enter();

      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');
      tavernScene.handleInput('enter');

      expect(tavernScene.getCurrentState()).toBe('main');
    });
  });

  describe('Reorder Party', () => {
    beforeEach(() => {
      const char1 = TestUtils.createTestCharacter({ name: 'First', class: 'Fighter', alignment: 'Good' });
      const char2 = TestUtils.createTestCharacter({ name: 'Second', class: 'Mage', alignment: 'Neutral' });
      const char3 = TestUtils.createTestCharacter({ name: 'Third', class: 'Thief', alignment: 'Neutral' });
      mockGameState.party.characters = [char1, char2, char3];
    });

    it('should enter reorder state', () => {
      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      expect(tavernScene.getCurrentState()).toBe('reorderParty');
    });

    it('should move character right with arrowright key', () => {
      const firstChar = mockGameState.party.characters[0];
      const secondChar = mockGameState.party.characters[1];
      const thirdChar = mockGameState.party.characters[2];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('arrowright');

      expect(mockGameState.party.characters[0]).toBe(secondChar);
      expect(mockGameState.party.characters[1]).toBe(firstChar);
      expect(mockGameState.party.characters[2]).toBe(thirdChar);
      expect(mockGameState.party.characters.length).toBe(3);
    });

    it('should move character left with arrowleft key', () => {
      const firstChar = mockGameState.party.characters[0];
      const secondChar = mockGameState.party.characters[1];
      const thirdChar = mockGameState.party.characters[2];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowleft');

      expect(mockGameState.party.characters[0]).toBe(secondChar);
      expect(mockGameState.party.characters[1]).toBe(firstChar);
      expect(mockGameState.party.characters[2]).toBe(thirdChar);
      expect(mockGameState.party.characters.length).toBe(3);
    });

    it('should not move beyond left boundary', () => {
      const firstChar = mockGameState.party.characters[0];
      const secondChar = mockGameState.party.characters[1];
      const thirdChar = mockGameState.party.characters[2];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('arrowleft');

      expect(mockGameState.party.characters[0]).toBe(firstChar);
      expect(mockGameState.party.characters[1]).toBe(secondChar);
      expect(mockGameState.party.characters[2]).toBe(thirdChar);
    });

    it('should not move beyond right boundary', () => {
      const firstChar = mockGameState.party.characters[0];
      const secondChar = mockGameState.party.characters[1];
      const lastChar = mockGameState.party.characters[2];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowright');

      expect(mockGameState.party.characters[0]).toBe(firstChar);
      expect(mockGameState.party.characters[1]).toBe(secondChar);
      expect(mockGameState.party.characters[2]).toBe(lastChar);
    });
  });

  describe('Divvy Gold', () => {
    beforeEach(() => {
      const char1 = TestUtils.createTestCharacter({ name: 'Char1', class: 'Fighter', alignment: 'Good' });
      const char2 = TestUtils.createTestCharacter({ name: 'Char2', class: 'Mage', alignment: 'Neutral' });
      const char3 = TestUtils.createTestCharacter({ name: 'Char3', class: 'Thief', alignment: 'Neutral' });
      char1.gold = 100;
      char2.gold = 50;
      char3.gold = 25;
      mockGameState.party.characters = [char1, char2, char3];
    });

    it('should divide gold evenly using floor division', () => {
      const totalGold = 175;
      const expectedShare = Math.floor(totalGold / 3);

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('y');

      expect(mockGameState.party.characters[1].gold).toBe(expectedShare);
      expect(mockGameState.party.characters[2].gold).toBe(expectedShare);
    });

    it('should give remainder to first character', () => {
      const totalGold = 175;
      const sharePerMember = Math.floor(totalGold / 3);
      const remainder = totalGold % 3;

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('y');

      expect(mockGameState.party.characters[0].gold).toBe(sharePerMember + remainder);
    });

    it('should handle empty party gracefully', () => {
      mockGameState.party.characters = [];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('y');

      expect(tavernScene.getCurrentState()).toBe('main');
    });

    it('should cancel divvy gold with n key', () => {
      const originalGold1 = mockGameState.party.characters[0].gold;

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('n');

      expect(mockGameState.party.characters[0].gold).toBe(originalGold1);
      expect(tavernScene.getCurrentState()).toBe('main');
    });

    it('should handle divvy gold with zero total', () => {
      const char1 = TestUtils.createTestCharacter({ name: 'Broke1', class: 'Fighter', alignment: 'Good' });
      const char2 = TestUtils.createTestCharacter({ name: 'Broke2', class: 'Mage', alignment: 'Neutral' });
      char1.gold = 0;
      char2.gold = 0;
      mockGameState.party.characters = [char1, char2];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');
      tavernScene.handleInput('y');

      expect(mockGameState.party.characters[0].gold).toBe(0);
      expect(mockGameState.party.characters[1].gold).toBe(0);
    });

    it('should handle divvy gold with single character party', () => {
      const char1 = TestUtils.createTestCharacter({ name: 'Solo', class: 'Fighter', alignment: 'Good' });
      char1.gold = 100;
      mockGameState.party.characters = [char1];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');
      tavernScene.handleInput('y');

      expect(mockGameState.party.characters[0].gold).toBe(100);
    });
  });

  describe('Input Handling', () => {
    it('should navigate menu with up arrow', () => {
      tavernScene.enter();
      const stateManager = (tavernScene as any).stateManager;

      stateManager.selectedMenuOption = 2;
      tavernScene.handleInput('arrowup');

      expect(stateManager.selectedMenuOption).toBe(1);
    });

    it('should navigate menu with down arrow', () => {
      tavernScene.enter();
      const stateManager = (tavernScene as any).stateManager;

      stateManager.selectedMenuOption = 1;
      tavernScene.handleInput('arrowdown');

      expect(stateManager.selectedMenuOption).toBe(2);
    });

    it('should select option with enter key', () => {
      tavernScene.enter();
      const handled = tavernScene.handleInput('enter');

      expect(handled).toBe(true);
    });

    it('should return to town with escape from main', () => {
      tavernScene.enter();
      tavernScene.handleInput('escape');

      expect(mockSceneManager.switchTo).toHaveBeenCalledWith('town');
    });

    it('should cancel add character with escape', () => {
      tavernScene.enter();
      tavernScene.handleInput('enter');

      tavernScene.handleInput('escape');

      expect(tavernScene.getCurrentState()).toBe('main');
    });

    it('should cancel remove character with escape', () => {
      const char = TestUtils.createTestCharacter({ name: 'Test', class: 'Fighter', alignment: 'Good' });
      mockGameState.party.characters = [char];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('escape');

      expect(tavernScene.getCurrentState()).toBe('main');
    });

    it('should finish reorder with enter key', () => {
      const char1 = TestUtils.createTestCharacter({ name: 'Test1', class: 'Fighter', alignment: 'Good' });
      const char2 = TestUtils.createTestCharacter({ name: 'Test2', class: 'Mage', alignment: 'Neutral' });
      mockGameState.party.characters = [char1, char2];

      tavernScene.enter();
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('arrowdown');
      tavernScene.handleInput('enter');

      tavernScene.handleInput('enter');

      expect(tavernScene.getCurrentState()).toBe('main');
    });

    it('should ignore invalid keys', () => {
      tavernScene.enter();
      const handled = tavernScene.handleInput('x');

      expect(handled).toBe(false);
    });
  });

});
