import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { TownASCIIState } from '../rendering/scenes/TownASCIIState';
import { FeatureFlags, FeatureFlagKey } from '../config/FeatureFlags';
import { CanvasRenderer } from '../rendering/CanvasRenderer';
import { DebugLogger } from '../utils/DebugLogger';
import './test-ascii'; // Load test helper

export class TownScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private selectedOption: number = 0;
  private menuOptions: string[] = [
    'Boltac\'s Trading Post',
    'Temple',
    'Inn',
    'Return to Dungeon'
  ];
  private asciiState?: TownASCIIState;
  private asciiRenderer?: CanvasRenderer;
  private useASCII: boolean = false;
  private renderCount: number = 0;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Town');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    
    // Check if ASCII rendering should be used initially
    this.useASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_TOWN_SCENE);
    
    if (this.useASCII) {
      this.asciiState = new TownASCIIState(gameState, sceneManager);
      DebugLogger.info('TownScene', 'ASCII rendering enabled for Town scene');
    }
    
    // Expose to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).townScene = this;
      console.log('[TownScene] Instance exposed as window.townScene for debugging');
    }
  }

  public enter(): void {
    this.selectedOption = 0;
    
    // Check if ASCII should be enabled
    const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_TOWN_SCENE);
    
    if (shouldUseASCII && !this.asciiState) {
      this.asciiState = new TownASCIIState(this.gameState, this.sceneManager);
      this.useASCII = true;
      DebugLogger.info('TownScene', 'ASCII rendering enabled on enter');
    }
    
    if (this.asciiState) {
      this.asciiState.enter();
    }
  }

  public exit(): void {
    if (this.asciiState) {
      this.asciiState.exit();
    }
    
    // Clean up ASCII state on exit if feature is disabled
    if (!FeatureFlags.isEnabled(FeatureFlagKey.ASCII_TOWN_SCENE)) {
      this.asciiState = undefined;
      this.asciiRenderer = undefined;
      this.useASCII = false;
    }
  }

  public update(deltaTime: number): void {
    if (this.asciiState) {
      this.asciiState.update(deltaTime);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderCount++;
    
    // Debug on every 60th frame
    if (this.renderCount % 60 === 0) {
      console.log(`[TownScene] Render #${this.renderCount}, checking feature flag...`);
    }
    
    // Check feature flag dynamically on each render
    const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_TOWN_SCENE);
    
    // Always log first 5 renders and changes
    if (this.renderCount <= 5 || this.useASCII !== shouldUseASCII) {
      console.log(`[TownScene] Render #${this.renderCount}: shouldUseASCII=${shouldUseASCII}, useASCII=${this.useASCII}, asciiState=${!!this.asciiState}`);
      DebugLogger.info('TownScene', `Feature flag check: current=${this.useASCII} -> new=${shouldUseASCII}`);
    }
    
    // Initialize ASCII state if feature was just enabled
    if (shouldUseASCII && !this.asciiState) {
      DebugLogger.info('TownScene', 'Initializing ASCII state - feature flag enabled');
      this.asciiState = new TownASCIIState(this.gameState, this.sceneManager);
      this.asciiState.enter();
      this.useASCII = true;
    } 
    // Clean up ASCII state if feature was disabled
    else if (!shouldUseASCII && this.asciiState) {
      DebugLogger.info('TownScene', 'Cleaning up ASCII state - feature flag disabled');
      this.asciiState.exit();
      this.asciiState = undefined;
      this.asciiRenderer = undefined;
      this.useASCII = false;
    }
    
    // Use ASCII rendering if enabled
    if (shouldUseASCII && this.asciiState) {
      if (!this.asciiRenderer) {
        DebugLogger.info('TownScene', 'Creating CanvasRenderer for ASCII rendering');
        this.asciiRenderer = new CanvasRenderer(ctx.canvas);
      }
      
      const sceneDeclaration = this.asciiState.getSceneDeclaration();
      this.asciiRenderer.renderScene(sceneDeclaration);
      return;
    }
    
    // Only log when not using ASCII (reduce spam)
    if (!shouldUseASCII) {
      DebugLogger.debug('TownScene', `Using original rendering - flag disabled`);
    }
    
    // Original canvas rendering
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TOWN OF LLYLGAMYN', ctx.canvas.width / 2, 80);

    ctx.font = '16px monospace';
    ctx.fillText('Welcome to the castle town!', ctx.canvas.width / 2, 120);

    const startY = 200;
    const lineHeight = 50;

    this.menuOptions.forEach((option, index) => {
      const y = startY + index * lineHeight;

      if (index === this.selectedOption) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('> ' + option + ' <', ctx.canvas.width / 2, y);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillText(option, ctx.canvas.width / 2, y);
      }
    });

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    if (this.selectedOption === 0) {
      ctx.fillText('Buy, sell, and identify items. Pool your gold for better purchases.', 50, 420);
    } else if (this.selectedOption === 1) {
      ctx.fillText('Heal your party and remove curses (not yet available)', 50, 420);
    } else if (this.selectedOption === 2) {
      ctx.fillText('Rest and recover your party (not yet available)', 50, 420);
    } else {
      ctx.fillText('Return to the dungeon depths', 50, 420);
    }

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to choose, ESC to return to dungeon',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    this.renderCount++;
    
    // Check for ASCII rendering
    const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_TOWN_SCENE);
    
    // Initialize ASCII state if needed
    if (shouldUseASCII && !this.asciiState) {
      DebugLogger.info('TownScene', 'Initializing ASCII state in renderLayered');
      this.asciiState = new TownASCIIState(this.gameState, this.sceneManager);
      this.asciiState.enter();
      this.useASCII = true;
    } else if (!shouldUseASCII && this.asciiState) {
      DebugLogger.info('TownScene', 'Cleaning up ASCII state in renderLayered');
      this.asciiState?.exit();
      this.asciiState = undefined;
      this.asciiRenderer = undefined;
      this.useASCII = false;
    }
    
    // If using ASCII, delegate to regular render method
    if (shouldUseASCII && this.asciiState) {
      // Get the context
      const ctx = renderContext.mainContext;
      
      if (!ctx) {
        DebugLogger.error('TownScene', 'No context available in renderContext');
        return;
      }
      
      if (!this.asciiRenderer) {
        DebugLogger.info('TownScene', 'Creating ASCII renderer in renderLayered');
        this.asciiRenderer = new CanvasRenderer(ctx.canvas);
      }
      
      // Update ASCII state and render
      this.asciiState.updateSelectedIndex(this.selectedOption);
      this.asciiState.render();
      
      // Get the grid - getGrid() returns the ASCIIState itself, not the grid
      const state = this.asciiState.getGrid();
      const grid = state.getGrid();  // Now get the actual grid array
      
      // Render the grid
      this.asciiRenderer.renderASCIIGrid(grid);
      return;
    }
    
    // Original layered rendering
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      ctx.fillStyle = '#fff';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TOWN OF LLYLGAMYN', ctx.canvas.width / 2, 80);

      ctx.font = '16px monospace';
      ctx.fillText('Welcome to the castle town!', ctx.canvas.width / 2, 120);

      const startY = 200;
      const lineHeight = 50;

      this.menuOptions.forEach((option, index) => {
        const y = startY + index * lineHeight;

        if (index === this.selectedOption) {
          ctx.fillStyle = '#ffaa00';
          ctx.fillText('> ' + option + ' <', ctx.canvas.width / 2, y);
        } else {
          ctx.fillStyle = '#fff';
          ctx.fillText(option, ctx.canvas.width / 2, y);
        }
      });

      ctx.fillStyle = '#aaa';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';

      if (this.selectedOption === 0) {
        ctx.fillText('Buy, sell, and identify items. Pool your gold for better purchases.', 50, 420);
      } else if (this.selectedOption === 1) {
        ctx.fillText('Heal your party and remove curses (not yet available)', 50, 420);
      } else if (this.selectedOption === 2) {
        ctx.fillText('Rest and recover your party (not yet available)', 50, 420);
      } else {
        ctx.fillText('Return to the dungeon depths', 50, 420);
      }

      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        'UP/DOWN to select, ENTER to choose, ESC to return to dungeon',
        ctx.canvas.width / 2,
        ctx.canvas.height - 20
      );
    });
  }

  public handleInput(key: string): boolean {
    // Check if ASCII rendering is currently active
    const shouldUseASCII = FeatureFlags.isEnabled(FeatureFlagKey.ASCII_TOWN_SCENE);
    
    // If using ASCII rendering, delegate to ASCII state
    if (shouldUseASCII && this.asciiState) {
      return this.asciiState.handleInput(key);
    }
    
    // Original key handling
    switch (key) {
      case 'arrowup':
      case 'w':
        this.selectedOption = Math.max(0, this.selectedOption - 1);
        return true;

      case 'arrowdown':
      case 's':
        this.selectedOption = Math.min(this.menuOptions.length - 1, this.selectedOption + 1);
        return true;

      case 'enter':
      case ' ':
        this.selectCurrentOption();
        return true;

      case 'escape':
        this.sceneManager.switchTo('dungeon');
        return true;
    }
    return false;
  }

  private selectCurrentOption(): void {
    switch (this.selectedOption) {
      case 0: // Boltac's Trading Post
        this.sceneManager.switchTo('shop');
        break;
        
      case 1: // Temple
        console.log('Temple not yet implemented');
        break;
        
      case 2: // Inn
        console.log('Inn not yet implemented');
        break;
        
      case 3: // Return to Dungeon
        this.sceneManager.switchTo('dungeon');
        break;
    }
  }
}