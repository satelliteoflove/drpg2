import { Game } from '../../core/Game';
import { GAME_CONFIG } from '../../config/GameConstants';
import { SaveManager, SaveData } from '../../utils/SaveManager';
import { DungeonGenerator } from '../../utils/DungeonGenerator';
import { ErrorHandler, createSafeCanvas } from '../../utils/ErrorHandler';
import { TypeValidation } from '../../utils/TypeValidation';

jest.mock('../../utils/SaveManager');
jest.mock('../../utils/DungeonGenerator');
jest.mock('../../utils/ErrorHandler');
jest.mock('../../utils/TypeValidation');
jest.mock('../../scenes/MainMenuScene');
jest.mock('../../scenes/NewGameScene');
jest.mock('../../scenes/DungeonScene');
jest.mock('../../scenes/CharacterCreationScene');
jest.mock('../../scenes/CombatScene');

describe('Game', () => {
  let canvas: HTMLCanvasElement;
  let game: Game;
  let mockContext: CanvasRenderingContext2D;
  const mockSaveManager = SaveManager as jest.Mocked<typeof SaveManager>;
  const mockCreateSafeCanvas = createSafeCanvas as jest.MockedFunction<typeof createSafeCanvas>;
  const mockTypeValidation = TypeValidation as jest.Mocked<typeof TypeValidation>;

  beforeEach(() => {
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    mockContext = {
      fillRect: jest.fn(),
      fillText: jest.fn(),
      fillStyle: '#000000',
      font: '12px monospace',
    } as any;
    
    jest.clearAllMocks();
    
    // Mock createSafeCanvas to return our mock context
    mockCreateSafeCanvas.mockReturnValue(mockContext);
    
    // Mock ErrorHandler.safeCanvasOperation to actually execute the operation
    jest.mocked(ErrorHandler.safeCanvasOperation).mockImplementation((operation, fallback) => {
      try {
        return operation();
      } catch {
        return fallback;
      }
    });
    
    // Mock TypeValidation methods
    mockTypeValidation.safeValidateParty.mockReturnValue({
      characters: [],
      formation: 'front',
      x: 5,
      y: 5,
      facing: 'north',
      floor: 1,
    });
    
    // Reset SaveManager mock
    mockSaveManager.loadGame.mockReturnValue(null);
    mockSaveManager.saveGame.mockImplementation(() => true);
    
    // Mock DungeonGenerator
    const mockDungeonGenerator = DungeonGenerator as jest.MockedClass<typeof DungeonGenerator>;
    mockDungeonGenerator.mockImplementation(() => ({
      generateLevel: jest.fn().mockReturnValue({
        level: 1,
        startX: 1,
        startY: 1,
        width: 20,
        height: 20,
        tiles: [],
        overrideZones: [],
        events: [],
      }),
    }) as any);
    
    // Mock performance.now
    jest.spyOn(performance, 'now').mockReturnValue(1000);
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((callback) => {
      setTimeout(callback, 16);
      return 1;
    });
    
    // Mock setInterval
    jest.spyOn(global, 'setInterval').mockImplementation((_callback, _ms) => {
      return 123 as any;
    });
  });

  afterEach(() => {
    if (game) {
      game.stop();
    }
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with valid canvas', () => {
      expect(() => {
        game = new Game(canvas);
      }).not.toThrow();
      
      expect(game.getCanvas()).toBe(canvas);
      expect(canvas.width).toBe(GAME_CONFIG.CANVAS.WIDTH);
      expect(canvas.height).toBe(GAME_CONFIG.CANVAS.HEIGHT);
    });

    it('should throw error with invalid canvas context', () => {
      const invalidCanvas = document.createElement('canvas') as HTMLCanvasElement;
      mockCreateSafeCanvas.mockReturnValueOnce(null);
      
      expect(() => {
        new Game(invalidCanvas);
      }).toThrow('Failed to initialize canvas context');
    });

    it('should initialize game state for new game', () => {
      mockSaveManager.loadGame.mockReturnValue(null);
      
      game = new Game(canvas);
      const gameState = game.getGameState();
      
      expect(gameState).toBeDefined();
      expect(gameState.party).toBeDefined();
      expect(gameState.currentFloor).toBe(1);
      expect(gameState.inCombat).toBe(false);
      expect(gameState.combatEnabled).toBe(true);
      expect(gameState.dungeon.length).toBeGreaterThan(0);
    });

    it('should load saved game state when available', () => {
      const mockSavedGame: SaveData = {
        version: '1.0.0',
        saveDate: Date.now(),
        gameState: {
          party: {
            characters: [],
            formation: 'standard',
            x: 5,
            y: 5,
            facing: 'north',
            floor: 2,
          },
          dungeon: [{
            level: 1,
            width: 20,
            height: 20,
            tiles: [],
            overrideZones: [],
            events: [],
            startX: 1,
            startY: 1,
          }],
          currentFloor: 2,
          inCombat: false,
          gameTime: 5000,
          turnCount: 10,
          combatEnabled: true,
        },
        playtimeSeconds: 300,
      };
      
      mockSaveManager.loadGame.mockReturnValue(mockSavedGame);
      
      game = new Game(canvas);
      const gameState = game.getGameState();
      
      expect(gameState.currentFloor).toBe(2);
      expect(gameState.gameTime).toBe(5000);
      expect(gameState.turnCount).toBe(10);
    });

    it('should handle corrupted save data gracefully', () => {
      const corruptedSave: SaveData = {
        version: '1.0.0',
        saveDate: Date.now(),
        gameState: { invalid: 'data' } as any,
        playtimeSeconds: 300,
      };
      
      mockSaveManager.loadGame.mockReturnValue(corruptedSave);
      const errorSpy = jest.spyOn(ErrorHandler, 'logError');
      
      game = new Game(canvas);
      const gameState = game.getGameState();
      
      expect(errorSpy).toHaveBeenCalledWith(
        'Invalid saved game data, starting new game',
        expect.any(String),
        'Game.initializeGameState'
      );
      expect(gameState.currentFloor).toBe(1);
    });
  });

  describe('game lifecycle', () => {
    beforeEach(() => {
      game = new Game(canvas);
    });

    it('should start game loop', () => {
      const performanceSpy = jest.spyOn(performance, 'now');
      
      game.start();
      
      expect(performanceSpy).toHaveBeenCalled();
      expect(global.requestAnimationFrame).toHaveBeenCalled();
      expect(global.setInterval).toHaveBeenCalled();
    });

    it('should stop game loop and save', () => {
      const saveSpy = mockSaveManager.saveGame;
      
      game.start();
      game.stop();
      
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should update game time during update cycle', () => {
      const initialTime = game.getGameState().gameTime;
      
      // Access private method through casting
      (game as any).update(16.67); // ~60fps delta
      
      expect(game.getGameState().gameTime).toBeGreaterThan(initialTime);
    });
  });

  describe('canvas rendering', () => {
    beforeEach(() => {
      game = new Game(canvas);
    });

    it('should render without errors', () => {
      const fillRectSpy = jest.spyOn(mockContext, 'fillRect');
      const fillTextSpy = jest.spyOn(mockContext, 'fillText');
      
      // Access private method through casting
      (game as any).render();
      
      expect(fillRectSpy).toHaveBeenCalled();
      expect(fillTextSpy).toHaveBeenCalled();
    });

    it('should render debug information', () => {
      const fillTextSpy = jest.spyOn(mockContext, 'fillText');
      
      // Access private method through casting
      (game as any).renderDebugInfo();
      
      expect(fillTextSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Playtime: \d{2}:\d{2}:\d{2}/),
        expect.any(Number),
        expect.any(Number)
      );
      expect(fillTextSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Scene: \w+/),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('party reconstruction', () => {
    beforeEach(() => {
      game = new Game(canvas);
    });

    it('should reconstruct party from valid data', () => {
      const validPartyData = {
        characters: [
          {
            name: 'Test Hero',
            race: 'Human',
            class: 'Fighter',
            alignment: 'Good',
            level: 2,
            experience: 100,
            hp: 15,
            maxHp: 15,
          },
        ],
        formation: 'standard',
        x: 5,
        y: 5,
        facing: 'north',
        floor: 1,
      };
      
      // Mock TypeValidation to return valid party data
      mockTypeValidation.safeValidateParty.mockReturnValueOnce({
        characters: [
          {
            name: 'Test Hero',
            race: 'Human',
            class: 'Fighter',
            alignment: 'Good',
          } as any,
        ],
        formation: 'front',
        x: 5,
        y: 5,
        facing: 'north',
        floor: 1,
      });
      
      // Access private method through casting
      const reconstructedParty = (game as any).reconstructParty(validPartyData);
      
      expect(reconstructedParty).toBeDefined();
      expect(reconstructedParty.x).toBe(5);
      expect(reconstructedParty.y).toBe(5);
      expect(reconstructedParty.facing).toBe('north');
      expect(reconstructedParty.characters.length).toBe(1);
      expect(reconstructedParty.characters[0].name).toBe('Test Hero');
    });

    it('should handle invalid party data', () => {
      const invalidPartyData = { invalid: 'data' };
      const errorSpy = jest.spyOn(ErrorHandler, 'logError');
      
      // Access private method through casting
      const reconstructedParty = (game as any).reconstructParty(invalidPartyData);
      
      expect(errorSpy).toHaveBeenCalledWith(
        'Invalid party data, creating new party',
        expect.any(String),
        'Game.reconstructParty'
      );
      expect(reconstructedParty.characters.length).toBe(0);
    });

    it('should handle corrupted character data in party', () => {
      const partyWithCorruptedChar = {
        characters: [
          { name: 'Valid Hero', race: 'Human', class: 'Fighter', alignment: 'Good' },
          { corrupted: 'data' },
          null,
        ],
        formation: 'standard',
        x: 5,
        y: 5,
        facing: 'north',
        floor: 1,
      };
      
      // Mock TypeValidation to return only the valid character
      mockTypeValidation.safeValidateParty.mockReturnValueOnce({
        characters: [
          { name: 'Valid Hero', race: 'Human', class: 'Fighter', alignment: 'Good' } as any,
          { corrupted: 'data' } as any,
          null as any,
        ],
        formation: 'front',
        x: 5,
        y: 5,
        facing: 'north',
        floor: 1,
      });
      
      const errorSpy = jest.spyOn(ErrorHandler, 'logError');
      
      // Access private method through casting
      const reconstructedParty = (game as any).reconstructParty(partyWithCorruptedChar);
      
      expect(reconstructedParty.characters.length).toBe(1);
      expect(reconstructedParty.characters[0].name).toBe('Valid Hero');
      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Failed to reconstruct character: Valid Hero'),
        expect.any(String),
        expect.any(String)
      );
    });
  });

  describe('dungeon generation', () => {
    beforeEach(() => {
      game = new Game(canvas);
    });

    it('should generate new dungeon with multiple levels', () => {
      // Access private method through casting
      (game as any).generateNewDungeon();
      
      const gameState = game.getGameState();
      expect(gameState.dungeon.length).toBe(10);
      expect(gameState.party.x).toBe(1);
      expect(gameState.party.y).toBe(1);
    });
  });

  describe('save functionality', () => {
    beforeEach(() => {
      game = new Game(canvas);
    });

    it('should save game state', () => {
      const saveSpy = mockSaveManager.saveGame;
      
      // Access private method through casting
      (game as any).saveGame();
      
      expect(saveSpy).toHaveBeenCalledWith(
        game.getGameState(),
        expect.any(Number)
      );
    });

    it('should calculate playtime correctly', () => {
      const mockStartTime = Date.now() - 5000; // 5 seconds ago
      jest.spyOn(Date, 'now').mockReturnValue(mockStartTime + 5000);
      
      // Set playtime start manually
      (game as any).playtimeStart = mockStartTime;
      
      const saveSpy = mockSaveManager.saveGame;
      
      // Access private method through casting
      (game as any).saveGame();
      
      expect(saveSpy).toHaveBeenCalledWith(
        game.getGameState(),
        5 // 5 seconds
      );
    });
  });

  describe('auto-save functionality', () => {
    beforeEach(() => {
      game = new Game(canvas);
    });

    it('should setup auto-save interval', () => {
      const intervalSpy = jest.spyOn(global, 'setInterval');
      
      game.start();
      
      expect(intervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        GAME_CONFIG.AUTO_SAVE.INTERVAL_MS
      );
    });

    it('should not auto-save during combat', () => {
      const saveSpy = mockSaveManager.saveGame;
      game.getGameState().inCombat = true;
      
      // Start game first to setup interval
      game.start();
      
      // Manually trigger auto-save callback
      const intervalCallback = (global.setInterval as jest.Mock).mock.calls[0][0];
      intervalCallback();
      
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should auto-save when not in combat', () => {
      const saveSpy = mockSaveManager.saveGame;
      game.getGameState().inCombat = false;
      
      // Manually trigger auto-save callback
      game.start();
      const intervalCallback = (global.setInterval as jest.Mock).mock.calls[0][0];
      intervalCallback();
      
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      game = new Game(canvas);
    });

    it('should handle canvas context creation failure gracefully', () => {
      const errorSpy = jest.spyOn(ErrorHandler, 'logError');
      
      // Mock fillRect to throw an error
      jest.spyOn(mockContext, 'fillRect').mockImplementation(() => {
        throw new Error('Canvas operation failed');
      });
      
      // Access private method through casting
      (game as any).render();
      
      expect(errorSpy).not.toHaveBeenCalled(); // Should be handled by safeCanvasOperation
    });

    it('should handle scene management errors gracefully', () => {
      const errorSpy = jest.spyOn(ErrorHandler, 'logError');
      
      // Mock scene manager to throw error
      const sceneManager = (game as any).sceneManager;
      jest.spyOn(sceneManager, 'render').mockImplementation(() => {
        throw new Error('Scene render failed');
      });
      
      // Access private method through casting
      (game as any).render();
      
      // Should not crash, error should be handled
      expect(errorSpy).not.toHaveBeenCalled(); // Handled by safeCanvasOperation
    });
  });

  describe('getters', () => {
    beforeEach(() => {
      game = new Game(canvas);
    });

    it('should return canvas', () => {
      expect(game.getCanvas()).toBe(canvas);
    });

    it('should return game state', () => {
      const gameState = game.getGameState();
      expect(gameState).toBeDefined();
      expect(gameState.party).toBeDefined();
      expect(typeof gameState.gameTime).toBe('number');
      expect(typeof gameState.turnCount).toBe('number');
      expect(typeof gameState.currentFloor).toBe('number');
      expect(typeof gameState.inCombat).toBe('boolean');
    });
  });
});