import { TownScene } from '../TownScene';
import { SceneManager } from '../../core/Scene';
import { GameState } from '../../types/GameTypes';
import { FeatureFlags, FeatureFlagKey } from '../../config/FeatureFlags';
import { TownASCIIState } from '../../rendering/scenes/TownASCIIState';
import { CanvasRenderer } from '../../rendering/CanvasRenderer';

describe('TownScene', () => {
  let townScene: TownScene;
  let mockGameState: GameState;
  let mockSceneManager: SceneManager;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    mockGameState = {
      party: [],
      gold: 100
    } as GameState;

    mockSceneManager = {
      switchTo: jest.fn(),
      currentScene: null
    } as unknown as SceneManager;

    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    
    mockContext = mockCanvas.getContext('2d') as CanvasRenderingContext2D;

    FeatureFlags.disable(FeatureFlagKey.ASCII_TOWN_SCENE);
    
    townScene = new TownScene(mockGameState, mockSceneManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
    FeatureFlags.disable(FeatureFlagKey.ASCII_TOWN_SCENE);
  });

  describe('Constructor', () => {
    it('should initialize with ASCII disabled by default', () => {
      expect((townScene as any).useASCII).toBe(false);
      expect((townScene as any).asciiState).toBeUndefined();
    });

    it('should initialize ASCII state when feature flag is enabled', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
      const scene = new TownScene(mockGameState, mockSceneManager);
      expect((scene as any).useASCII).toBe(true);
      expect((scene as any).asciiState).toBeDefined();
    });
  });

  describe('Enter/Exit', () => {
    it('should reset selected option on enter', () => {
      (townScene as any).selectedOption = 2;
      townScene.enter();
      expect((townScene as any).selectedOption).toBe(0);
    });

    it('should call ASCII state enter when ASCII is enabled', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
      const scene = new TownScene(mockGameState, mockSceneManager);
      const enterSpy = jest.spyOn((scene as any).asciiState, 'enter');
      scene.enter();
      expect(enterSpy).toHaveBeenCalled();
    });

    it('should call ASCII state exit when ASCII is enabled', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
      const scene = new TownScene(mockGameState, mockSceneManager);
      const exitSpy = jest.spyOn((scene as any).asciiState, 'exit');
      scene.exit();
      expect(exitSpy).toHaveBeenCalled();
    });
  });

  describe('Update', () => {
    it('should update ASCII state when enabled', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
      const scene = new TownScene(mockGameState, mockSceneManager);
      const updateSpy = jest.spyOn((scene as any).asciiState, 'update');
      scene.update(16);
      expect(updateSpy).toHaveBeenCalledWith(16);
    });

    it('should not crash when ASCII is disabled', () => {
      expect(() => townScene.update(16)).not.toThrow();
    });
  });

  describe('Render', () => {
    it('should render traditional canvas when ASCII is disabled', () => {
      const fillTextSpy = jest.spyOn(mockContext, 'fillText');
      townScene.render(mockContext);
      expect(fillTextSpy).toHaveBeenCalledWith('TOWN OF LLYLGAMYN', expect.any(Number), expect.any(Number));
    });

    it('should dynamically enable ASCII rendering when flag changes', () => {
      townScene.render(mockContext);
      expect((townScene as any).asciiState).toBeUndefined();
      
      FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
      townScene.render(mockContext);
      expect((townScene as any).asciiState).toBeDefined();
    });

    it('should dynamically disable ASCII rendering when flag changes', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
      const scene = new TownScene(mockGameState, mockSceneManager);
      scene.render(mockContext);
      expect((scene as any).asciiState).toBeDefined();
      
      FeatureFlags.disable(FeatureFlagKey.ASCII_TOWN_SCENE);
      scene.render(mockContext);
      expect((scene as any).asciiState).toBeUndefined();
    });

    it('should render menu options correctly', () => {
      const fillTextSpy = jest.spyOn(mockContext, 'fillText');
      townScene.render(mockContext);
      
      expect(fillTextSpy).toHaveBeenCalledWith(expect.stringContaining('Boltac'), expect.any(Number), expect.any(Number));
      expect(fillTextSpy).toHaveBeenCalledWith('Temple', expect.any(Number), expect.any(Number));
      expect(fillTextSpy).toHaveBeenCalledWith('Inn', expect.any(Number), expect.any(Number));
      expect(fillTextSpy).toHaveBeenCalledWith('Return to Dungeon', expect.any(Number), expect.any(Number));
    });

    it('should highlight selected option', () => {
      (townScene as any).selectedOption = 1;
      const fillTextSpy = jest.spyOn(mockContext, 'fillText');
      townScene.render(mockContext);
      
      expect(fillTextSpy).toHaveBeenCalledWith('> Temple <', expect.any(Number), expect.any(Number));
    });
  });

  describe('Input Handling', () => {
    it('should move selection up with arrow up', () => {
      (townScene as any).selectedOption = 2;
      const handled = townScene.handleInput('arrowup');
      expect(handled).toBe(true);
      expect((townScene as any).selectedOption).toBe(1);
    });

    it('should move selection up with w key', () => {
      (townScene as any).selectedOption = 2;
      const handled = townScene.handleInput('w');
      expect(handled).toBe(true);
      expect((townScene as any).selectedOption).toBe(1);
    });

    it('should move selection down with arrow down', () => {
      (townScene as any).selectedOption = 1;
      const handled = townScene.handleInput('arrowdown');
      expect(handled).toBe(true);
      expect((townScene as any).selectedOption).toBe(2);
    });

    it('should move selection down with s key', () => {
      (townScene as any).selectedOption = 1;
      const handled = townScene.handleInput('s');
      expect(handled).toBe(true);
      expect((townScene as any).selectedOption).toBe(2);
    });

    it('should not move selection above first option', () => {
      (townScene as any).selectedOption = 0;
      townScene.handleInput('arrowup');
      expect((townScene as any).selectedOption).toBe(0);
    });

    it('should not move selection below last option', () => {
      const maxIndex = (townScene as any).menuOptions.length - 1;
      (townScene as any).selectedOption = maxIndex;
      townScene.handleInput('arrowdown');
      expect((townScene as any).selectedOption).toBe(maxIndex);
    });

    it('should switch to shop when first option selected', () => {
      (townScene as any).selectedOption = 0;
      townScene.handleInput('enter');
      expect(mockSceneManager.switchTo).toHaveBeenCalledWith('shop');
    });

    it('should switch to dungeon when last option selected', () => {
      (townScene as any).selectedOption = 3;
      townScene.handleInput('enter');
      expect(mockSceneManager.switchTo).toHaveBeenCalledWith('dungeon');
    });

    it('should switch to dungeon on escape key', () => {
      townScene.handleInput('escape');
      expect(mockSceneManager.switchTo).toHaveBeenCalledWith('dungeon');
    });

    it('should delegate input to ASCII state when enabled', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
      const scene = new TownScene(mockGameState, mockSceneManager);
      const handleInputSpy = jest.spyOn((scene as any).asciiState, 'handleInput');
      scene.handleInput('arrowup');
      expect(handleInputSpy).toHaveBeenCalledWith('arrowup');
    });

    it('should return false for unhandled keys', () => {
      const handled = townScene.handleInput('x');
      expect(handled).toBe(false);
    });
  });

  describe('ASCII Integration', () => {
    it('should create CanvasRenderer when ASCII is enabled', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
      const scene = new TownScene(mockGameState, mockSceneManager);
      scene.render(mockContext);
      expect((scene as any).asciiRenderer).toBeDefined();
    });

    it('should clean up ASCII resources when disabled', () => {
      FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
      const scene = new TownScene(mockGameState, mockSceneManager);
      scene.render(mockContext);
      
      const asciiState = (scene as any).asciiState;
      const exitSpy = jest.spyOn(asciiState, 'exit');
      
      FeatureFlags.disable(FeatureFlagKey.ASCII_TOWN_SCENE);
      scene.render(mockContext);
      
      expect(exitSpy).toHaveBeenCalled();
      expect((scene as any).asciiState).toBeUndefined();
      expect((scene as any).asciiRenderer).toBeUndefined();
    });
  });

  describe('Menu Navigation', () => {
    const menuOptions = [
      { index: 0, name: 'Boltac\'s Trading Post', destination: 'shop' },
      { index: 1, name: 'Temple', destination: null },
      { index: 2, name: 'Inn', destination: null },
      { index: 3, name: 'Return to Dungeon', destination: 'dungeon' }
    ];

    menuOptions.forEach(({ index, name, destination }) => {
      it(`should handle selection of ${name}`, () => {
        (townScene as any).selectedOption = index;
        townScene.handleInput('enter');
        
        if (destination) {
          expect(mockSceneManager.switchTo).toHaveBeenCalledWith(destination);
        } else {
          expect(mockSceneManager.switchTo).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid renders without errors', () => {
      for (let i = 0; i < 100; i++) {
        expect(() => townScene.render(mockContext)).not.toThrow();
      }
    });

    it('should handle rapid feature flag toggling', () => {
      for (let i = 0; i < 10; i++) {
        FeatureFlags.enable(FeatureFlagKey.ASCII_TOWN_SCENE);
        townScene.render(mockContext);
        FeatureFlags.disable(FeatureFlagKey.ASCII_TOWN_SCENE);
        townScene.render(mockContext);
      }
      expect((townScene as any).asciiState).toBeUndefined();
    });
  });
});