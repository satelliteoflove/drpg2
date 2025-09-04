import { SceneManager } from './Scene';
import { InputManager } from './Input';
import { RenderManager } from './RenderManager';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { NewGameScene } from '../scenes/NewGameScene';
import { DungeonScene } from '../scenes/DungeonScene';
import { CharacterCreationScene } from '../scenes/CharacterCreationScene';
import { CombatScene } from '../scenes/CombatScene';
import { InventoryScene } from '../scenes/InventoryScene';
import { DebugScene } from '../scenes/DebugScene';
import { TownScene } from '../scenes/TownScene';
import { ShopScene } from '../scenes/ShopScene';
import { Party } from '../entities/Party';
import { Character } from '../entities/Character';
import { GameState } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';
import { TypeValidation } from '../utils/TypeValidation';
import { ErrorHandler, ErrorSeverity, createSafeCanvas } from '../utils/ErrorHandler';
import { GameServices } from '../services/GameServices';
import { LayerTestUtils } from '../utils/LayerTestUtils';
import { MessageLog } from '../ui/MessageLog';
import { DebugLogger } from '../utils/DebugLogger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private services: GameServices;
  private renderManager: RenderManager;
  private sceneManager: SceneManager;
  private inputManager: InputManager;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private gameState!: GameState;
  private playtimeStart: number = Date.now();
  private frameCount: number = 0;
  private autoSaveFrameCounter: number = 0;
  private performanceMonitor: PerformanceMonitor;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = createSafeCanvas(canvas);
    if (!ctx) {
      throw new Error('Failed to initialize canvas context');
    }
    this.ctx = ctx;
    
    // CRITICAL: Set canvas dimensions BEFORE creating services/layers
    this.setupCanvas();
    
    this.services = new GameServices({ canvas });
    this.renderManager = this.services.getRenderManager();
    this.sceneManager = this.services.getSceneManager();
    this.inputManager = this.services.getInputManager();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    
    this.initializeManagers();
    this.initializeGameState();
    this.setupScenes();
  }

  private setupCanvas(): void {
    this.canvas.width = GAME_CONFIG.CANVAS.WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS.HEIGHT;
  }

  private initializeManagers(): void {
    this.sceneManager.setRenderManager(this.renderManager);
    
    this.inputManager.setKeyPressCallback((key: string) => {
      return this.sceneManager.handleInput(key);
    });
  }

  private initializeGameState(): void {
    const saveManager = this.services.getSaveManager();
    const savedGame = saveManager.loadGame();

    if (savedGame) {
      const validatedGameState = TypeValidation.safeValidateGameState(savedGame.gameState);
      if (validatedGameState) {
        this.gameState = validatedGameState;
        this.gameState.party = this.reconstructParty(savedGame.gameState.party);
        this.playtimeStart = Date.now() - savedGame.playtimeSeconds * 1000;
        
        // Create a new MessageLog for loaded game (messages aren't saved)
        this.gameState.messageLog = new MessageLog(this.canvas, 624, 500, 400, 268);
        this.gameState.messageLog.addSystemMessage('Game loaded successfully');
      } else {
        ErrorHandler.logError(
          'Invalid saved game data, starting new game',
          ErrorSeverity.MEDIUM,
          'Game.initializeGameState'
        );
        this.createNewGameState();
        return;
      }

      if (this.gameState.combatEnabled === undefined) {
        this.gameState.combatEnabled = true;
      }
    } else {
      this.createNewGameState();
    }
  }

  private createNewGameState(): void {
    this.gameState = {
      party: new Party(),
      dungeon: [],
      currentFloor: 1,
      inCombat: false,
      gameTime: 0,
      turnCount: 0,
      combatEnabled: true,
      messageLog: new MessageLog(this.canvas, 624, 500, 400, 268),
    };

    // Add initial game messages
    this.gameState.messageLog.addSystemMessage('Welcome to the dungeon!');
    this.gameState.messageLog.addSystemMessage('Use WASD or arrow keys to move');
    this.gameState.messageLog.addSystemMessage('Press ENTER to interact, M for map');
    this.gameState.messageLog.addSystemMessage('Press C to toggle combat encounters');
    this.gameState.messageLog.addSystemMessage('Press T to trigger combat (testing)');
    this.gameState.messageLog.addSystemMessage('Press R to rest, ESC to return to main menu');

    this.generateNewDungeon();
  }

  private generateNewDungeon(): void {
    const generator = this.services.getDungeonGenerator();
    this.gameState.dungeon = [];

    for (let i = 1; i <= 10; i++) {
      this.gameState.dungeon.push(generator.generateLevel(i));
    }

    const firstLevel = this.gameState.dungeon[0];
    this.gameState.party.x = firstLevel.startX;
    this.gameState.party.y = firstLevel.startY;
  }

  private reconstructParty(partyData: unknown): Party {
    const validatedParty = TypeValidation.safeValidateParty(partyData, 'Game.reconstructParty');

    if (!validatedParty) {
      ErrorHandler.logError(
        'Invalid party data, creating new party',
        ErrorSeverity.MEDIUM,
        'Game.reconstructParty'
      );
      return new Party();
    }

    const party = new Party();

    // Safely assign validated properties
    party.x = validatedParty.x;
    party.y = validatedParty.y;
    party.facing = validatedParty.facing;
    party.floor = validatedParty.floor;
    party.formation = validatedParty.formation;

    // Reconstruct characters - note: we can't fully validate Character class instances
    // from serialized data, so we'll do basic validation and reconstruct
    validatedParty.characters.forEach((charData: any) => {
      if (
        charData &&
        typeof charData === 'object' &&
        charData.name &&
        charData.race &&
        charData.class
      ) {
        try {
          // Create a new Character instance
          const newChar = new Character(
            charData.name,
            charData.race,
            charData.class,
            charData.alignment
          );

          // Restore saved properties (except the ones set by constructor)
          const {
            name: _name,
            race: _race,
            class: _charClass,
            alignment: _alignment,
            ...restData
          } = charData;
          Object.assign(newChar, restData);
          party.characters.push(newChar);
        } catch (error) {
          ErrorHandler.logError(
            `Failed to reconstruct character: ${charData.name}`,
            ErrorSeverity.MEDIUM,
            'Game.reconstructCharacter',
            error instanceof Error ? error : undefined
          );
        }
      }
    });

    return party;
  }

  private setupScenes(): void {
    this.sceneManager.addScene('main_menu', new MainMenuScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('new_game', new NewGameScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene(
      'character_creation',
      new CharacterCreationScene(this.gameState, this.sceneManager)
    );
    this.sceneManager.addScene(
      'dungeon',
      new DungeonScene(this.gameState, this.sceneManager, this.inputManager)
    );
    this.sceneManager.addScene('combat', new CombatScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('inventory', new InventoryScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('debug', new DebugScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('town', new TownScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('shop', new ShopScene(this.gameState, this.sceneManager));

    // Set up scene change listener for performance monitoring
    this.sceneManager.onSceneChange = (sceneName: string) => {
      this.performanceMonitor.startMonitoring(sceneName);
    };

    this.sceneManager.switchTo('main_menu');
  }

  public start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();

    this.setupAutoSave();
  }

  public stop(): void {
    this.isRunning = false;
    this.saveGame();

    // Cleanup to prevent memory leaks
    if (this.inputManager) {
      this.inputManager.cleanup();
    }
    if (this.renderManager) {
      this.renderManager.dispose();
    }
    if (this.services) {
      this.services.dispose();
    }
  }

  private setupAutoSave(): void {
    // Auto-save is now handled in the game loop using frame-based counting
    this.autoSaveFrameCounter = 0;
  }

  private gameLoop = (currentTime: number = 0): void => {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    this.performanceMonitor.markUpdateStart();
    
    this.gameState.gameTime += deltaTime;
    this.frameCount++;
    this.sceneManager.update(deltaTime);
    
    // Handle auto-save using frame-based counting
    this.autoSaveFrameCounter++;
    // Auto-save every 1800 frames (approximately 30 seconds at 60fps)
    if (this.autoSaveFrameCounter >= 1800) {
      if (this.isRunning && !this.gameState.inCombat) {
        this.saveGame();
      }
      this.autoSaveFrameCounter = 0;
    }
    
    this.performanceMonitor.markUpdateEnd();
  }

  private render(): void {
    this.performanceMonitor.markRenderStart();
    
    ErrorHandler.safeCanvasOperation(
      () => {
        // Start frame timing and skip if needed for performance
        if (!this.renderManager.startFrame(performance.now())) {
          return undefined;
        }

        // Use layered rendering if available, otherwise fall back to direct rendering
        const currentScene = this.sceneManager.getCurrentScene();
        if (currentScene?.hasLayeredRendering()) {
          // Debug layer state if needed
          if (GAME_CONFIG.DEBUG_MODE && this.frameCount % 60 === 0) { // Every second at 60fps
            this.renderManager.debugLayers();
            // Run comprehensive layer tests
            const testResults = LayerTestUtils.runLayerTests(this.renderManager, this.canvas);
            DebugLogger.debug('Game', 'Layer Test Results', testResults.summary);
            if (testResults.failed > 0) {
              DebugLogger.warn('Game', 'Layer test failures', testResults.results.filter(r => !r.passed));
            }
            // Debug layer content analysis
            const layerAnalysis = LayerTestUtils.analyzeLayers(this.renderManager);
            DebugLogger.debug('Game', 'Layer Analysis', layerAnalysis);
          }
          this.sceneManager.renderLayered(this.ctx);
          
          // Complete the frame - this composites all layers to main canvas
          this.renderManager.endFrame();
          
          // NOW render debug info directly on top of the composited result
          this.renderDebugInfo();
        } else {
          // For direct rendering, clear canvas first
          this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
          
          if (GAME_CONFIG.DEBUG_MODE && this.frameCount % 600 === 0) { // Every 10 seconds
            DebugLogger.debug('Game', 'Using direct rendering (layered rendering not available)');
          }
          this.sceneManager.render(this.ctx);
          
          // Complete the frame (no-op for direct rendering but keeps consistency)
          this.renderManager.endFrame();
          
          // Render debug info on top
          this.renderDebugInfo();
        }

        return undefined;
      },
      undefined,
      'Game.render'
    );
    
    this.performanceMonitor.markRenderEnd();
    this.performanceMonitor.recordFrame();
  }

  private renderDebugInfo(): void {
    const playtimeSeconds = Math.floor((Date.now() - this.playtimeStart) / 1000);
    const hours = Math.floor(playtimeSeconds / 3600);
    const minutes = Math.floor((playtimeSeconds % 3600) / 60);
    const seconds = playtimeSeconds % 60;

    this.ctx.fillStyle = GAME_CONFIG.COLORS.DEBUG_TEXT;
    this.ctx.font = '12px monospace';
    this.ctx.fillText(
      `Playtime: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      GAME_CONFIG.UI.DEBUG_INFO_OFFSET,
      this.canvas.height - GAME_CONFIG.UI.DEBUG_INFO_OFFSET
    );

    const currentScene = this.sceneManager.getCurrentScene();
    if (currentScene) {
      this.ctx.fillText(
        `Scene: ${currentScene.getName()}`,
        200,
        this.canvas.height - GAME_CONFIG.UI.DEBUG_INFO_OFFSET
      );
    }
  }

  private saveGame(): void {
    const playtimeSeconds = Math.floor((Date.now() - this.playtimeStart) / 1000);
    const saveManager = this.services.getSaveManager();
    saveManager.saveGame(this.gameState, playtimeSeconds);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getGameState(): GameState {
    return this.gameState;
  }
}
