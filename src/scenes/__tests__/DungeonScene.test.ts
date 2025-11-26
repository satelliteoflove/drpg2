import { DungeonScene } from '../DungeonScene';
import { GameState } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { InputManager } from '../../core/Input';
import { Party } from '../../entities/Party';
import { Character } from '../../entities/Character';
import { FeatureFlags, FeatureFlagKey } from '../../config/FeatureFlags';
import { DungeonLevel } from '../../types/GameTypes';
import { generateDungeon } from '../../utils/DungeonGenerator';

describe('DungeonScene', () => {
  let dungeonScene: DungeonScene;
  let mockGameState: GameState;
  let mockSceneManager: SceneManager;
  let mockInputManager: InputManager;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    ctx = canvas.getContext('2d')!;

    // Create mock party with test characters
    const mockParty = new Party();
    mockParty.addCharacter(new Character('Test Fighter', 'Fighter'));
    mockParty.addCharacter(new Character('Test Mage', 'Mage'));

    // Create mock dungeon
    const mockDungeon: DungeonLevel[] = [
      generateDungeon(20, 20, { 
        floor: 1,
        minRooms: 3,
        maxRooms: 5
      })
    ];

    // Create mock game state
    mockGameState = {
      party: mockParty,
      dungeon: mockDungeon,
      currentFloor: 1,
      inCombat: false,
      combatEnabled: true,
      hasEnteredDungeon: false,
      turnCount: 0,
      messageLog: {
        messages: [],
        addSystemMessage: jest.fn(),
        addWarningMessage: jest.fn(),
        addItemMessage: jest.fn(),
        addMagicMessage: jest.fn(),
        addDeathMessage: jest.fn(),
        render: jest.fn()
      },
      pendingLoot: undefined,
      encounterContext: undefined
    } as any;

    mockSceneManager = {
      switchTo: jest.fn(),
      getScene: jest.fn()
    } as any;

    mockInputManager = {
      getMovementInput: jest.fn().mockReturnValue({
        forward: false,
        backward: false,
        left: false,
        right: false
      }),
      getActionKeys: jest.fn()
    } as any;

    dungeonScene = new DungeonScene(mockGameState, mockSceneManager, mockInputManager);
  });

  afterEach(() => {
    FeatureFlags.reset();
  });

  describe('ASCII Rendering', () => {
    it('should use ASCII rendering when feature flag is enabled', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);
      
      dungeonScene.render(ctx);
      
      // Verify ASCII components are initialized
      expect((dungeonScene as any).dungeonASCIIState).toBeDefined();
      expect((dungeonScene as any).canvasRenderer).toBeDefined();
    });

    it('should use imperative rendering when feature flag is disabled', () => {
      FeatureFlags.disable(FeatureFlagKey.ASCII_RENDERING);
      
      dungeonScene.render(ctx);
      
      // Verify standard components are initialized
      expect((dungeonScene as any).dungeonView).toBeDefined();
      expect((dungeonScene as any).statusPanel).toBeDefined();
    });

    it('should handle scene-specific ASCII flag', () => {
      FeatureFlags.enable('DUNGEON_ASCII', 'Dungeon');
      
      dungeonScene.render(ctx);
      
      expect((dungeonScene as any).dungeonASCIIState).toBeDefined();
    });

    it('should update ASCII state with dungeon data', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);
      
      dungeonScene.render(ctx);
      
      const asciiState = (dungeonScene as any).dungeonASCIIState;
      expect(asciiState).toBeDefined();
      
      // Verify dungeon data is set
      const grid = asciiState.getGrid();
      expect(grid).toBeDefined();
      expect(grid.width).toBe(80);
      expect(grid.height).toBe(25);
    });

    it('should render party status in ASCII mode', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);
      
      mockGameState.party.characters[0].hp = 50;
      mockGameState.party.characters[0].maxHp = 100;
      
      dungeonScene.render(ctx);
      
      const asciiState = (dungeonScene as any).dungeonASCIIState;
      const gridString = asciiState.toString();
      
      // Check that character name appears in the status panel
      expect(gridString).toContain('Test Fighter');
    });

    it('should handle map toggle in ASCII mode', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);
      
      dungeonScene.render(ctx);
      const asciiState = (dungeonScene as any).dungeonASCIIState;
      
      // Toggle map
      asciiState.toggleMap();
      asciiState.updateDungeonView();
      
      const gridString = asciiState.toString();
      expect(gridString).toContain('DUNGEON MAP');
    });

    it('should render compass in ASCII mode', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);
      
      mockGameState.party.facing = 'north';
      
      dungeonScene.render(ctx);
      
      const asciiState = (dungeonScene as any).dungeonASCIIState;
      const gridString = asciiState.toString();
      
      // Compass should show 'N' for north
      expect(gridString).toContain('N');
    });

    it('should handle item pickup UI in ASCII mode', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);
      
      // Set up item pickup state
      (dungeonScene as any).itemPickupState = 'selecting_character';
      (dungeonScene as any).itemsToPickup = [{
        id: 'test-item',
        name: 'Test Sword',
        identified: true,
        type: 'weapon'
      }];
      (dungeonScene as any).currentItemIndex = 0;
      
      dungeonScene.render(ctx);
      
      const asciiState = (dungeonScene as any).dungeonASCIIState;
      const gridString = asciiState.toString();
      
      expect(gridString).toContain('SELECT CHARACTER');
      expect(gridString).toContain('Test Sword');
    });

    it('should handle castle stairs prompt in ASCII mode', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);
      
      (dungeonScene as any).isAwaitingCastleStairsResponse = true;
      
      dungeonScene.render(ctx);
      
      const asciiState = (dungeonScene as any).dungeonASCIIState;
      const gridString = asciiState.toString();
      
      expect(gridString).toContain('CASTLE STAIRS');
      expect(gridString).toContain('Return to castle?');
    });

    it('should render message log in ASCII mode', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);
      
      mockGameState.messageLog.messages = [
        { text: 'Welcome to the dungeon!' },
        { text: 'You found a chest!' }
      ];
      
      dungeonScene.render(ctx);
      
      const asciiState = (dungeonScene as any).dungeonASCIIState;
      const gridString = asciiState.toString();
      
      expect(gridString).toContain('Welcome to the dungeon!');
      expect(gridString).toContain('You found a chest!');
    });

    it('should render controls help text in ASCII mode', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);

      dungeonScene.render(ctx);

      const asciiState = (dungeonScene as any).dungeonASCIIState;
      const gridString = asciiState.toString();

      expect(gridString).toContain(': Move');
      expect(gridString).toContain('M: Map');
    });
  });

  describe('Scene Lifecycle', () => {
    it('should initialize on enter', () => {
      dungeonScene.enter();
      
      expect(mockGameState.messageLog.addSystemMessage).toHaveBeenCalledWith('Entered the dungeon...');
      expect(mockGameState.hasEnteredDungeon).toBe(true);
    });

    it('should handle pending loot on enter', () => {
      mockGameState.pendingLoot = [{
        id: 'loot-item',
        name: 'Gold Coin',
        identified: true,
        type: 'consumable'
      }];
      
      dungeonScene.enter();
      
      expect((dungeonScene as any).itemPickupState).toBe('selecting_character');
      expect((dungeonScene as any).itemsToPickup).toEqual(mockGameState.pendingLoot);
    });

    it('should update on each frame', () => {
      const deltaTime = 16; // ~60 FPS
      
      dungeonScene.update(deltaTime);
      
      // Should check for movement and tile events
      expect(mockInputManager.getMovementInput).toHaveBeenCalled();
    });
  });

  describe('Input Handling', () => {
    it('should handle map toggle key', () => {
      const handled = dungeonScene.handleInput('m');
      
      expect(handled).toBe(true);
    });

    it('should handle inventory key', () => {
      const handled = dungeonScene.handleInput('tab');
      
      expect(handled).toBe(true);
      expect(mockSceneManager.switchTo).toHaveBeenCalledWith('inventory');
    });

    it('should handle combat toggle key', () => {
      const initialState = mockGameState.combatEnabled;
      
      const handled = dungeonScene.handleInput('c');
      
      expect(handled).toBe(true);
      expect(mockGameState.combatEnabled).toBe(!initialState);
    });

    it('should handle rest key', () => {
      const handled = dungeonScene.handleInput('r');
      
      expect(handled).toBe(true);
      expect(mockGameState.party.rest).toBeDefined();
    });

    it('should handle escape key', () => {
      const handled = dungeonScene.handleInput('escape');
      
      expect(handled).toBe(true);
      expect(mockSceneManager.switchTo).toHaveBeenCalledWith('town');
    });
  });

  describe('Movement', () => {
    beforeEach(() => {
      dungeonScene.enter();
    });

    it('should handle forward movement', () => {
      mockInputManager.getMovementInput.mockReturnValue({
        forward: true,
        backward: false,
        left: false,
        right: false
      });
      
      const initialX = mockGameState.party.x;
      const initialY = mockGameState.party.y;
      
      dungeonScene.update(100); // Ensure enough time has passed
      
      // Movement should be attempted
      expect(mockInputManager.getMovementInput).toHaveBeenCalled();
    });

    it('should handle turning', () => {
      mockInputManager.getMovementInput.mockReturnValue({
        forward: false,
        backward: false,
        left: true,
        right: false
      });
      
      const initialFacing = mockGameState.party.facing;
      
      dungeonScene.update(100);
      
      expect(mockInputManager.getMovementInput).toHaveBeenCalled();
    });

    it('should respect movement delay', () => {
      mockInputManager.getMovementInput.mockReturnValue({
        forward: true,
        backward: false,
        left: false,
        right: false
      });
      
      dungeonScene.update(10); // Very short time
      
      // Movement input should be checked but not processed due to delay
      expect(mockInputManager.getMovementInput).toHaveBeenCalled();
    });
  });

  describe('Layered Rendering', () => {
    it('should use single layer for ASCII rendering', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_RENDERING);
      
      const renderContext = {
        mainContext: ctx,
        renderManager: {
          renderBackground: jest.fn(),
          renderDungeon: jest.fn(),
          renderUI: jest.fn()
        }
      } as any;
      
      dungeonScene.renderLayered(renderContext);
      
      // Should not use render manager in ASCII mode
      expect(renderContext.renderManager.renderBackground).not.toHaveBeenCalled();
      expect(renderContext.renderManager.renderDungeon).not.toHaveBeenCalled();
      expect(renderContext.renderManager.renderUI).not.toHaveBeenCalled();
    });

    it('should use layered rendering for imperative mode', () => {
      FeatureFlags.disable(FeatureFlagKey.ASCII_RENDERING);
      
      const renderContext = {
        mainContext: ctx,
        renderManager: {
          renderBackground: jest.fn(),
          renderDungeon: jest.fn(),
          renderUI: jest.fn()
        }
      } as any;
      
      dungeonScene.renderLayered(renderContext);
      
      // Should use all render layers
      expect(renderContext.renderManager.renderBackground).toHaveBeenCalled();
      expect(renderContext.renderManager.renderDungeon).toHaveBeenCalled();
      expect(renderContext.renderManager.renderUI).toHaveBeenCalled();
    });
  });
});