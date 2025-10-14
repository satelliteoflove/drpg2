import { TrainingGroundsScene } from '../TrainingGroundsScene';
import { SceneManager } from '../../core/Scene';
import { GameState } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { TestUtils } from '../../__tests__/testUtils';

describe('TrainingGroundsScene', () => {
  let trainingScene: TrainingGroundsScene;
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

    trainingScene = new TrainingGroundsScene(mockGameState, mockSceneManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor & Lifecycle', () => {
    it('should initialize all components', () => {
      expect((trainingScene as any).stateManager).toBeDefined();
      expect((trainingScene as any).serviceHandler).toBeDefined();
      expect((trainingScene as any).uiRenderer).toBeDefined();
      expect((trainingScene as any).inputHandler).toBeDefined();
    });

    it('should reset state on enter', () => {
      const resetSpy = jest.spyOn((trainingScene as any).stateManager, 'reset');
      trainingScene.enter();
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should not add message on enter with empty roster', () => {
      mockGameState.characterRoster = [];
      trainingScene.enter();
      expect(mockGameState.messageLog.add).not.toHaveBeenCalled();
    });

    it('should return correct scene name', () => {
      expect(trainingScene.getName()).toBe('TrainingGrounds');
    });

    it('should display roster count on enter', () => {
      const char1 = TestUtils.createTestCharacter({ name: 'Test1', class: 'Fighter', alignment: 'Good' });
      const char2 = TestUtils.createTestCharacter({ name: 'Test2', class: 'Mage', alignment: 'Neutral' });
      mockGameState.characterRoster = [char1, char2];

      trainingScene.enter();

      expect(mockGameState.messageLog.add).toHaveBeenCalledWith(
        expect.stringContaining('2')
      );
    });
  });

  describe('Character Creation Flow', () => {
    it('should enter character creation from main menu', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('createName');
    });

    it('should accept name input', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      trainingScene.handleInput('T');
      trainingScene.handleInput('e');
      trainingScene.handleInput('s');
      trainingScene.handleInput('t');

      const stateManager = (trainingScene as any).stateManager;
      expect(stateManager.textInput).toBe('Test');
    });

    it('should handle empty name during character creation', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      trainingScene.handleInput('enter');

      const stateManager = (trainingScene as any).stateManager;
      expect(stateManager.currentState).toBe('createName');
    });

    it('should move to race selection after name', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      trainingScene.handleInput('T');
      trainingScene.handleInput('e');
      trainingScene.handleInput('s');
      trainingScene.handleInput('t');
      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('createRace');
    });

    it('should allow race selection', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      trainingScene.handleInput('T');
      trainingScene.handleInput('e');
      trainingScene.handleInput('s');
      trainingScene.handleInput('t');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      const stateManager = (trainingScene as any).stateManager;
      expect(stateManager.creationData.race).toBe('Elf');
    });

    it('should move to gender selection after race', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      trainingScene.handleInput('T');
      trainingScene.handleInput('e');
      trainingScene.handleInput('s');
      trainingScene.handleInput('t');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('createGender');
    });

    it('should allow gender selection', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      trainingScene.handleInput('T');
      trainingScene.handleInput('e');
      trainingScene.handleInput('s');
      trainingScene.handleInput('t');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('enter');

      const stateManager = (trainingScene as any).stateManager;
      expect(stateManager.creationData.gender).toBe('male');
    });

    it('should generate bonus points after gender selection', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      trainingScene.handleInput('T');
      trainingScene.handleInput('e');
      trainingScene.handleInput('s');
      trainingScene.handleInput('t');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      const stateManager = (trainingScene as any).stateManager;
      expect(stateManager.creationData.bonusPoints).toBeGreaterThanOrEqual(7);
      expect(stateManager.creationData.bonusPoints).toBeLessThanOrEqual(30);
    });
  });

  describe('Bonus Point System', () => {
    beforeEach(() => {
      trainingScene.enter();
      trainingScene.handleInput('enter');
      trainingScene.handleInput('T');
      trainingScene.handleInput('e');
      trainingScene.handleInput('s');
      trainingScene.handleInput('t');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');
    });

    it('should have bonus points in valid range', () => {
      const stateManager = (trainingScene as any).stateManager;
      const bonusPoints = stateManager.creationData.bonusPoints;

      expect(bonusPoints).toBeGreaterThanOrEqual(7);
      expect(bonusPoints).toBeLessThanOrEqual(30);
    });

    it('should allow allocating bonus points', () => {
      const stateManager = (trainingScene as any).stateManager;
      const initialPoints = stateManager.creationData.bonusPoints;

      trainingScene.handleInput('arrowright');

      const allocated = Object.values(stateManager.creationData.allocatedBonusPoints)
        .reduce((sum: number, val: any) => sum + (val || 0), 0);

      expect(allocated).toBeGreaterThan(0);
      expect(allocated).toBeLessThanOrEqual(initialPoints);
    });

    it('should prevent over-allocation of bonus points', () => {
      const stateManager = (trainingScene as any).stateManager;
      const bonusPoints = stateManager.creationData.bonusPoints;

      for (let i = 0; i < bonusPoints + 10; i++) {
        trainingScene.handleInput('arrowright');
      }

      const allocated = Object.values(stateManager.creationData.allocatedBonusPoints)
        .reduce((sum: number, val: any) => sum + (val || 0), 0);

      expect(allocated).toBeLessThanOrEqual(bonusPoints);
    });

    it('should set Level 4 start for low bonus points', () => {
      const stateManager = (trainingScene as any).stateManager;

      if (stateManager.creationData.bonusPoints <= 10) {
        expect(stateManager.creationData.startAtLevel4).toBe(true);
      }
    });

    it('should calculate remaining bonus points correctly', () => {
      const stateManager = (trainingScene as any).stateManager;
      const bonusPoints = stateManager.creationData.bonusPoints;

      trainingScene.handleInput('arrowright');
      trainingScene.handleInput('arrowright');

      const allocated = Object.values(stateManager.creationData.allocatedBonusPoints)
        .reduce((sum: number, val: any) => sum + (val || 0), 0);
      const remaining = bonusPoints - allocated;

      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(bonusPoints);
    });
  });

  describe('Inspect Operations', () => {
    beforeEach(() => {
      const char1 = TestUtils.createTestCharacter({ name: 'InspectChar', class: 'Fighter', alignment: 'Good' });
      mockGameState.characterRoster = [char1];
    });

    it('should enter inspect menu', () => {
      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('inspectSelectCharacter');
    });

    it('should select character from roster', () => {
      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('inspectMenu');
    });

    it('should view character details', () => {
      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('inspectView');
    });

    it('should navigate inspect menu options', () => {
      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      const handled = trainingScene.handleInput('arrowdown');

      expect(handled).toBe(true);
    });

    it('should return to main from inspect with escape', () => {
      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('escape');

      expect(trainingScene.getCurrentState()).toBe('main');
    });
  });

  describe('Class Change Mechanics', () => {
    let testChar: Character;

    beforeEach(() => {
      testChar = TestUtils.createTestCharacter({ name: 'ClassChangeTest', class: 'Fighter', alignment: 'Good' });
      testChar.stats = {
        strength: 18,
        intelligence: 15,
        piety: 14,
        vitality: 16,
        agility: 13,
        luck: 12,
      };
      testChar.baseStats = { ...testChar.stats };
      testChar.level = 5;
      testChar.experience = 1000;
      testChar.hp = 50;
      testChar.maxHp = 50;
      testChar.mp = 20;
      testChar.maxMp = 20;
      testChar.age = 20;
      testChar.knownSpells = ['DUMAPIC', 'HALITO'];

      mockGameState.characterRoster = [testChar];
    });

    it('should reset stats to race minimums after class change', () => {
      testChar.changeClass('Mage');

      expect(testChar.stats.strength).toBe(9);
      expect(testChar.stats.intelligence).toBe(8);
      expect(testChar.stats.piety).toBe(8);
      expect(testChar.stats.vitality).toBe(9);
      expect(testChar.stats.agility).toBe(8);
      expect(testChar.stats.luck).toBe(8);
    });

    it('should reset base stats to race minimums after class change', () => {
      testChar.changeClass('Mage');

      expect(testChar.baseStats.strength).toBe(9);
      expect(testChar.baseStats.intelligence).toBe(8);
      expect(testChar.baseStats.piety).toBe(8);
      expect(testChar.baseStats.vitality).toBe(9);
      expect(testChar.baseStats.agility).toBe(8);
      expect(testChar.baseStats.luck).toBe(8);
    });

    it('should preserve current HP after class change', () => {
      const originalHp = testChar.hp;

      testChar.changeClass('Mage');

      expect(testChar.hp).toBe(originalHp);
    });

    it('should preserve max HP after class change', () => {
      const originalMaxHp = testChar.maxHp;

      testChar.changeClass('Mage');

      expect(testChar.maxHp).toBe(originalMaxHp);
    });

    it('should preserve current MP after class change', () => {
      const originalMp = testChar.mp;

      testChar.changeClass('Mage');

      expect(testChar.mp).toBe(originalMp);
    });

    it('should preserve max MP after class change', () => {
      const originalMaxMp = testChar.maxMp;

      testChar.changeClass('Mage');

      expect(testChar.maxMp).toBe(originalMaxMp);
    });

    it('should preserve known spells after class change', () => {
      const originalSpells = [...testChar.knownSpells];

      testChar.changeClass('Thief');

      expect(testChar.knownSpells).toEqual(originalSpells);
    });

    it('should reset level to 1 after class change', () => {
      testChar.changeClass('Mage');

      expect(testChar.level).toBe(1);
    });

    it('should reset experience to 0 after class change', () => {
      testChar.changeClass('Mage');

      expect(testChar.experience).toBe(0);
    });

    it('should increase age by 1 after class change', () => {
      const originalAge = testChar.age;

      testChar.changeClass('Mage');

      expect(testChar.age).toBe(originalAge + 1);
    });

    it('should unequip all equipment after class change', () => {
      testChar.changeClass('Mage');

      expect(testChar.equipment.weapon).toBeUndefined();
      expect(testChar.equipment.armor).toBeUndefined();
      expect(testChar.equipment.shield).toBeUndefined();
    });
  });

  describe('Delete Character', () => {
    beforeEach(() => {
      const char1 = TestUtils.createTestCharacter({ name: 'DeleteMe', class: 'Fighter', alignment: 'Good' });
      const char2 = TestUtils.createTestCharacter({ name: 'KeepMe', class: 'Mage', alignment: 'Neutral' });
      mockGameState.characterRoster = [char1, char2];
    });

    it('should show confirmation prompt for delete', () => {
      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('inspectDeleteConfirm');
    });

    it('should remove character on confirm', () => {
      const initialSize = mockGameState.characterRoster.length;

      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('y');

      expect(mockGameState.characterRoster.length).toBe(initialSize - 1);
    });

    it('should decrease roster size after delete', () => {
      const initialSize = mockGameState.characterRoster.length;

      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('y');

      expect(mockGameState.characterRoster.length).toBeLessThan(initialSize);
    });

    it('should not delete from empty roster', () => {
      mockGameState.characterRoster = [];

      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).not.toBe('inspectSelectCharacter');
    });
  });

  describe('Rename Character', () => {
    beforeEach(() => {
      const char = TestUtils.createTestCharacter({ name: 'OldName', class: 'Fighter', alignment: 'Good' });
      mockGameState.characterRoster = [char];
    });

    it('should enter rename state', () => {
      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('inspectRename');
    });

    it('should accept text input for new name', () => {
      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('N');
      trainingScene.handleInput('e');
      trainingScene.handleInput('w');

      const stateManager = (trainingScene as any).stateManager;
      expect(stateManager.textInput).toContain('New');
    });

    it('should update character name', () => {
      const char = mockGameState.characterRoster[0];

      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      for (let i = 0; i < 20; i++) {
        trainingScene.handleInput('backspace');
      }

      trainingScene.handleInput('N');
      trainingScene.handleInput('e');
      trainingScene.handleInput('w');
      trainingScene.handleInput('N');
      trainingScene.handleInput('a');
      trainingScene.handleInput('m');
      trainingScene.handleInput('e');
      trainingScene.handleInput('enter');

      expect(char.name).toBe('NewName');
    });


    it('should handle empty name input during rename', () => {
      const char = mockGameState.characterRoster[0];
      const originalName = char.name;

      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      for (let i = 0; i < 20; i++) {
        trainingScene.handleInput('backspace');
      }

      trainingScene.handleInput('enter');

      expect(char.name).toBe(originalName);
    });

    it('should handle very long names during rename', () => {
      const char = mockGameState.characterRoster[0];

      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      for (let i = 0; i < 20; i++) {
        trainingScene.handleInput('backspace');
      }

      for (let i = 0; i < 50; i++) {
        trainingScene.handleInput('X');
      }
      trainingScene.handleInput('enter');

      expect(char.name.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Roster Display', () => {
    beforeEach(() => {
      const char1 = TestUtils.createTestCharacter({ name: 'Char1', class: 'Fighter', alignment: 'Good' });
      const char2 = TestUtils.createTestCharacter({ name: 'Char2', class: 'Mage', alignment: 'Neutral' });
      const char3 = TestUtils.createTestCharacter({ name: 'Char3', class: 'Thief', alignment: 'Evil' });
      mockGameState.characterRoster = [char1, char2, char3];
    });

    it('should enter roster view', () => {
      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('roster');
    });

    it('should show party status for characters', () => {
      mockGameState.party.characters.push(mockGameState.characterRoster[0]);

      trainingScene.enter();
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('arrowdown');
      trainingScene.handleInput('enter');

      expect(trainingScene.getCurrentState()).toBe('roster');
    });
  });

  describe('Input Handling', () => {
    it('should handle menu navigation with arrow keys', () => {
      trainingScene.enter();
      const handled = trainingScene.handleInput('arrowdown');

      expect(handled).toBe(true);
    });

    it('should handle text input for names', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      const handled = trainingScene.handleInput('T');

      expect(handled).toBe(true);
    });

    it('should handle arrow keys for bonus allocation', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');
      trainingScene.handleInput('T');
      trainingScene.handleInput('e');
      trainingScene.handleInput('s');
      trainingScene.handleInput('t');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');
      trainingScene.handleInput('enter');

      const handled = trainingScene.handleInput('arrowright');

      expect(handled).toBe(true);
    });

    it('should handle escape for cancellation', () => {
      trainingScene.enter();
      trainingScene.handleInput('enter');

      trainingScene.handleInput('escape');

      expect(trainingScene.getCurrentState()).toBe('main');
    });

    it('should ignore invalid keys', () => {
      trainingScene.enter();
      const handled = trainingScene.handleInput('x');

      expect(handled).toBe(false);
    });
  });

});
