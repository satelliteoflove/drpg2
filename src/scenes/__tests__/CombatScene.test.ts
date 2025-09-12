import { CombatScene } from '../CombatScene';
import { CombatASCIIState } from '../../rendering/scenes/CombatASCIIState';
import { GameState, Monster } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { CombatSystem } from '../../systems/CombatSystem';
import { FeatureFlags, FeatureFlagKey } from '../../config/FeatureFlags';
import { ASCIIState } from '../../rendering/ASCIIState';
import { Character } from '../../entities/Character';
import { Party } from '../../entities/Party';

describe('CombatScene ASCII Integration', () => {
  let gameState: GameState;
  let sceneManager: SceneManager;
  let combatScene: CombatScene;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Create mock canvas and context
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    mockContext = mockCanvas.getContext('2d')!;

    // Create mock party with characters
    const mockCharacters = [
      {
        name: 'Fighter',
        class: 'Fighter',
        level: 1,
        stats: {
          hp: 10,
          maxHp: 10,
          mp: 5,
          maxMp: 5,
          ac: 10,
          strength: 10,
          intelligence: 10,
          agility: 10,
          vitality: 10,
          luck: 10
        },
        isAlive: () => true
      } as any as Character,
      {
        name: 'Mage',
        class: 'Mage',
        level: 1,
        stats: {
          hp: 8,
          maxHp: 8,
          mp: 10,
          maxMp: 10,
          ac: 12,
          strength: 8,
          intelligence: 15,
          agility: 9,
          vitality: 8,
          luck: 10
        },
        isAlive: () => true
      } as any as Character
    ];

    const mockParty = {
      characters: mockCharacters,
      getAliveCharacters: () => mockCharacters,
      isWiped: () => false,
      distributeExperience: jest.fn(),
      distributeGold: jest.fn()
    } as any as Party;

    // Create mock game state
    gameState = {
      party: mockParty,
      messageLog: {
        addCombatMessage: jest.fn(),
        addSystemMessage: jest.fn(),
        addDeathMessage: jest.fn(),
        addWarningMessage: jest.fn(),
        render: jest.fn()
      },
      currentFloor: 1,
      inCombat: false,
      encounterContext: undefined,
      pendingLoot: undefined
    } as any as GameState;

    // Create mock scene manager
    sceneManager = {
      switchTo: jest.fn(),
      getScene: jest.fn()
    } as any as SceneManager;

    // Create combat scene
    combatScene = new CombatScene(gameState, sceneManager);
  });

  afterEach(() => {
    // Reset feature flags
    FeatureFlags.reset();
    jest.clearAllMocks();
  });

  describe('ASCII Rendering Mode', () => {
    beforeEach(() => {
      // Enable ASCII rendering
      FeatureFlags.set(FeatureFlagKey.ASCII_RENDERING, true);
      // Recreate combat scene with ASCII enabled
      combatScene = new CombatScene(gameState, sceneManager);
    });

    test('should initialize ASCII state when feature flag is enabled', () => {
      expect((combatScene as any).useASCII).toBe(true);
      expect((combatScene as any).asciiState).toBeInstanceOf(CombatASCIIState);
    });

    test('should render ASCII state when enabled', () => {
      combatScene.enter();
      combatScene.render(mockContext);
      
      // Verify ASCII rendering was used
      expect((combatScene as any).asciiState).toBeDefined();
    });

    test('should delegate input to ASCII state when enabled', () => {
      combatScene.enter();
      const asciiState = (combatScene as any).asciiState as CombatASCIIState;
      const handleInputSpy = jest.spyOn(asciiState, 'handleInput');
      
      combatScene.handleInput('arrowup');
      
      expect(handleInputSpy).toHaveBeenCalledWith('arrowup');
    });

    test('should sync action state between main scene and ASCII state', () => {
      combatScene.enter();
      const asciiState = (combatScene as any).asciiState as CombatASCIIState;
      
      (combatScene as any).actionState = 'select_target';
      combatScene.update(0.016);
      
      expect(asciiState.getActionState()).toBe('select_target');
    });
  });

  describe('Regular Rendering Mode', () => {
    test('should not initialize ASCII state when feature flag is disabled', () => {
      expect((combatScene as any).useASCII).toBe(false);
      expect((combatScene as any).asciiState).toBeNull();
    });

    test('should use regular rendering when ASCII is disabled', () => {
      combatScene.enter();
      combatScene.render(mockContext);
      
      // Verify regular rendering path was used
      expect((combatScene as any).asciiState).toBeNull();
    });

    test('should handle input directly when ASCII is disabled', () => {
      combatScene.enter();
      
      const result = combatScene.handleInput('arrowup');
      
      // Input should be handled by the scene itself
      expect(result).toBe(true);
      expect((combatScene as any).selectedAction).toBe(0);
    });
  });
});

describe('CombatASCIIState', () => {
  let combatASCIIState: CombatASCIIState;
  let gameState: GameState;
  let sceneManager: SceneManager;
  let combatSystem: CombatSystem;

  beforeEach(() => {
    // Create mock party
    const mockParty = {
      characters: [],
      getAliveCharacters: () => [],
      isWiped: () => false
    } as any as Party;

    // Create mock game state
    gameState = {
      party: mockParty,
      currentFloor: 1
    } as any as GameState;

    // Create mock scene manager
    sceneManager = {
      switchTo: jest.fn()
    } as any as SceneManager;

    // Create mock combat system
    combatSystem = {
      getEncounter: () => ({
        monsters: [
          { name: 'Goblin', hp: 5, maxHp: 5, ac: 10 } as Monster,
          { name: 'Orc', hp: 10, maxHp: 10, ac: 12 } as Monster
        ],
        turnOrder: [],
        currentTurn: 0
      }),
      canPlayerAct: () => true,
      getPlayerOptions: () => ['Attack', 'Defend', 'Spell', 'Run'],
      getCurrentUnit: () => null,
      executePlayerAction: jest.fn(),
      forceCheckCombatEnd: jest.fn()
    } as any as CombatSystem;

    combatASCIIState = new CombatASCIIState(gameState, sceneManager, combatSystem);
  });

  describe('Grid Rendering', () => {
    test('should initialize ASCII grid with proper dimensions', () => {
      const grid = combatASCIIState.getGrid();
      expect(grid).toBeInstanceOf(ASCIIState);
    });

    test('should render combat title in ASCII mode', () => {
      combatASCIIState.render();
      const grid = combatASCIIState.getGrid();
      const gridData = grid.getGrid();
      
      // Check if title contains 'COMBAT' and 'ASCII MODE'
      const titleRow = gridData[1];
      const titleText = titleRow.map(cell => cell.char).join('');
      expect(titleText).toContain('COMBAT');
      expect(titleText).toContain('ASCII MODE');
    });

    test('should render monsters with appropriate symbols', () => {
      combatASCIIState.render();
      const grid = combatASCIIState.getGrid();
      const gridData = grid.getGrid();
      
      // Check for monster symbols in the battlefield area
      let foundMonsterSymbol = false;
      for (let y = 5; y < 18; y++) {
        const rowText = gridData[y].map(cell => cell.char).join('');
        if (rowText.includes('[g]') || rowText.includes('[o]')) {
          foundMonsterSymbol = true;
          break;
        }
      }
      expect(foundMonsterSymbol).toBe(true);
    });

    test('should render party status area', () => {
      combatASCIIState.render();
      const grid = combatASCIIState.getGrid();
      const gridData = grid.getGrid();
      
      // Check for party status header
      let foundPartyStatus = false;
      for (let y = 19; y < 27; y++) {
        const rowText = gridData[y].map(cell => cell.char).join('');
        if (rowText.includes('PARTY STATUS')) {
          foundPartyStatus = true;
          break;
        }
      }
      expect(foundPartyStatus).toBe(true);
    });

    test('should render action menu', () => {
      combatASCIIState.render();
      const grid = combatASCIIState.getGrid();
      const gridData = grid.getGrid();
      
      // Check for action menu
      let foundActionMenu = false;
      for (let y = 28; y < 38; y++) {
        const rowText = gridData[y].map(cell => cell.char).join('');
        if (rowText.includes('SELECT ACTION') || rowText.includes('Attack')) {
          foundActionMenu = true;
          break;
        }
      }
      expect(foundActionMenu).toBe(true);
    });
  });

  describe('Input Handling', () => {
    test('should navigate action menu with arrow keys', () => {
      combatASCIIState.enter();
      
      expect(combatASCIIState.getSelectedAction()).toBe(0);
      
      combatASCIIState.handleInput('arrowdown');
      expect(combatASCIIState.getSelectedAction()).toBe(1);
      
      combatASCIIState.handleInput('arrowup');
      expect(combatASCIIState.getSelectedAction()).toBe(0);
    });

    test('should switch to target selection when Attack is selected', () => {
      combatASCIIState.enter();
      
      combatASCIIState.handleInput('enter');
      
      expect(combatASCIIState.getActionState()).toBe('select_target');
    });

    test('should navigate targets with left/right keys', () => {
      combatASCIIState.enter();
      combatASCIIState.setActionState('select_target');
      
      expect(combatASCIIState.getSelectedTarget()).toBe(0);
      
      combatASCIIState.handleInput('arrowright');
      expect(combatASCIIState.getSelectedTarget()).toBe(1);
      
      combatASCIIState.handleInput('arrowleft');
      expect(combatASCIIState.getSelectedTarget()).toBe(0);
    });

    test('should cancel target selection with escape', () => {
      combatASCIIState.enter();
      combatASCIIState.setActionState('select_target');
      
      combatASCIIState.handleInput('escape');
      
      expect(combatASCIIState.getActionState()).toBe('select_action');
    });

    test('should handle quick action selection with number keys', () => {
      combatASCIIState.enter();
      
      combatASCIIState.handleInput('2');
      
      // Should select second action (Defend) and execute it
      expect(combatASCIIState.getActionState()).toBe('waiting');
    });
  });

  describe('State Management', () => {
    test('should properly transition between action states', () => {
      combatASCIIState.enter();
      
      expect(combatASCIIState.getActionState()).toBe('select_action');
      
      combatASCIIState.setActionState('select_target');
      expect(combatASCIIState.getActionState()).toBe('select_target');
      
      combatASCIIState.setActionState('waiting');
      expect(combatASCIIState.getActionState()).toBe('waiting');
    });

    test('should reset state on enter', () => {
      combatASCIIState.setActionState('select_target');
      (combatASCIIState as any).selectedAction = 2;
      (combatASCIIState as any).selectedTarget = 1;
      
      combatASCIIState.enter();
      
      expect(combatASCIIState.getActionState()).toBe('select_action');
      expect(combatASCIIState.getSelectedAction()).toBe(0);
      expect(combatASCIIState.getSelectedTarget()).toBe(0);
    });

    test('should update display when combat state changes', () => {
      combatASCIIState.enter();
      const initialGrid = combatASCIIState.getGrid().serialize();
      
      combatASCIIState.update(0.016);
      combatASCIIState.setActionState('waiting');
      combatASCIIState.render();
      
      const updatedGrid = combatASCIIState.getGrid().serialize();
      
      // Grid should change when state changes
      expect(updatedGrid).not.toEqual(initialGrid);
    });
  });

  describe('Scene Declaration', () => {
    test('should generate valid scene declaration', () => {
      const declaration = combatASCIIState.getSceneDeclaration();
      
      expect(declaration).toHaveProperty('id', 'combat');
      expect(declaration).toHaveProperty('name', 'Combat');
      expect(declaration.layers).toHaveLength(1);
      expect(declaration.layers[0].id).toBe('main');
    });

    test('should include input zones for action menu', () => {
      combatASCIIState.enter();
      const declaration = combatASCIIState.getSceneDeclaration();
      
      // Should have input zones for action menu items
      const actionZones = declaration.inputZones.filter(zone => zone.id.startsWith('action-'));
      expect(actionZones.length).toBeGreaterThan(0);
    });

    test('should include input zones for monsters when targeting', () => {
      combatASCIIState.enter();
      combatASCIIState.setActionState('select_target');
      const declaration = combatASCIIState.getSceneDeclaration();
      
      // Should have input zones for monster targets
      const monsterZones = declaration.inputZones.filter(zone => zone.id.startsWith('monster-'));
      expect(monsterZones.length).toBeGreaterThan(0);
    });
  });
});