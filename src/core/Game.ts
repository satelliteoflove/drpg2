import { SceneManager } from './Scene';
import { InputManager } from './Input';
import { RenderManager } from './RenderManager';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { NewGameScene } from '../scenes/NewGameScene';
import { DungeonScene } from '../scenes/DungeonScene';
import { CombatScene } from '../scenes/CombatScene';
import { CombatResultsScene } from '../scenes/CombatResultsScene';
import { DebugScene } from '../scenes/DebugScene';
import { TownScene } from '../scenes/TownScene';
import { ShopScene } from '../scenes/ShopScene';
import { InnScene } from '../scenes/InnScene';
import { TempleScene } from '../scenes/TempleScene';
import { TavernScene } from '../scenes/TavernScene';
import { TrainingGroundsScene } from '../scenes/TrainingGroundsScene';
import { CampMenuScene } from '../scenes/CampMenuScene';
import { CharacterSheetScene } from '../scenes/CharacterSheetScene';
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
import { StarterCharacterFactory } from '../utils/StarterCharacterFactory';
import { STARTER_CHARACTER_TEMPLATES } from '../config/StarterCharacters';
import { DungeonGenerator } from '../utils/DungeonGenerator';

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
        this.gameState.messageLog = new MessageLog(this.canvas, 10, 570, 1004, 180);
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
      if (this.gameState.characterRoster === undefined) {
        this.gameState.characterRoster = [];
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
      messageLog: new MessageLog(this.canvas, 10, 570, 1004, 180),
      characterRoster: [],
    };

    STARTER_CHARACTER_TEMPLATES.forEach((template) => {
      const character = StarterCharacterFactory.createFromTemplate(template);
      this.gameState.characterRoster.push(character);
    });

    this.gameState.messageLog.addSystemMessage('Welcome to the dungeon!');
    this.gameState.messageLog.addSystemMessage('Use WASD or arrow keys to move');
    this.gameState.messageLog.addSystemMessage('Press ENTER to interact, M for map');
    this.gameState.messageLog.addSystemMessage('Press C to toggle combat encounters');
    this.gameState.messageLog.addSystemMessage('Press T to trigger combat (testing)');
    this.gameState.messageLog.addSystemMessage('Press R to rest, ESC to return to main menu');

    this.generateNewDungeon();
  }

  private generateNewDungeon(): void {
    try {
      const generator = new DungeonGenerator(
        GAME_CONFIG.DUNGEON.DEFAULT_WIDTH,
        GAME_CONFIG.DUNGEON.DEFAULT_HEIGHT,
        this.gameState.dungeonSeed
      );
      this.gameState.dungeon = [];
      this.gameState.dungeonSeed = generator.getSeed();

      for (let i = 1; i <= 10; i++) {
        this.gameState.dungeon.push(generator.generateLevel(i));
      }

      const firstLevel = this.gameState.dungeon[0];
      this.gameState.party.x = firstLevel.startX;
      this.gameState.party.y = firstLevel.startY;
    } catch (error) {
      ErrorHandler.logError(
        `Failed to generate dungeon: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorSeverity.CRITICAL,
        'Game.generateNewDungeon',
        error instanceof Error ? error : undefined
      );
      this.gameState.dungeon = [];
    }
  }

  private reconstructParty(partyData: unknown): Party {
    DebugLogger.debug('Game', 'Reconstructing party', {
      partyData: partyData
    });

    const validatedParty = TypeValidation.safeValidateParty(partyData, 'Game.reconstructParty');

    if (!validatedParty) {
      DebugLogger.warn('Game', 'Party validation failed, creating new party', {
        receivedData: partyData
      });
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

    // Convert characters to array if it's an object (happens with some JSON serialization)
    const charactersArray = Array.isArray(validatedParty.characters)
      ? validatedParty.characters
      : Object.values(validatedParty.characters);

    // Reconstruct characters - note: we can't fully validate Character class instances
    // from serialized data, so we'll do basic validation and reconstruct
    charactersArray.forEach((charData: any) => {
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

          // eslint-disable-next-line no-unused-expressions
          (void _name, void _race, void _charClass, void _alignment); // Mark as intentionally unused

          // Save the initial spells from the constructor
          const initialSpells = newChar.knownSpells ? [...newChar.knownSpells] : [];
          // Save the statusEffects Map (it doesn't serialize to JSON properly)
          const statusEffectsMap = newChar.statusEffects;

          Object.assign(newChar, restData);

          // If saved data has no knownSpells or empty array, use the initial spells from constructor
          if (!restData.knownSpells || (Array.isArray(restData.knownSpells) && restData.knownSpells.length === 0)) {
            newChar.knownSpells = initialSpells;
          }

          // Restore statusEffects as a Map (it gets overwritten as a plain object from JSON)
          // If there's saved statusEffects data and it's not a Map, convert it
          if (restData.statusEffects && !(restData.statusEffects instanceof Map)) {
            // If it's an object with entries, convert to Map
            if (typeof restData.statusEffects === 'object' && restData.statusEffects !== null) {
              newChar.statusEffects = new Map(Object.entries(restData.statusEffects));
              DebugLogger.debug('Game', 'Converted statusEffects from object to Map', {
                character: newChar.name,
                entries: Object.entries(restData.statusEffects)
              });
            } else {
              // Otherwise use the original Map
              newChar.statusEffects = statusEffectsMap;
            }
          } else if (!restData.statusEffects) {
            // No statusEffects in save data, use the original Map
            newChar.statusEffects = statusEffectsMap;
          }
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
      'dungeon',
      new DungeonScene(this.gameState, this.sceneManager, this.inputManager)
    );
    this.sceneManager.addScene('combat', new CombatScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('combatResults', new CombatResultsScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('debug', new DebugScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('town', new TownScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('shop', new ShopScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('inn', new InnScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('temple', new TempleScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('tavern', new TavernScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('training_grounds', new TrainingGroundsScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('camp', new CampMenuScene(this.gameState, this.sceneManager));
    this.sceneManager.addScene('characterSheet', new CharacterSheetScene(this.gameState, this.sceneManager));

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
    this.gameState.playtimeSeconds = Math.floor((Date.now() - this.playtimeStart) / 1000);
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
          if (GAME_CONFIG.DEBUG_MODE && this.frameCount % 60 === 0) {
            // Every second at 60fps
            this.renderManager.debugLayers();
            // Run comprehensive layer tests
            const testResults = LayerTestUtils.runLayerTests(this.renderManager, this.canvas);
            DebugLogger.debug('Game', 'Layer Test Results', testResults.summary);
            if (testResults.failed > 0) {
              DebugLogger.warn(
                'Game',
                'Layer test failures',
                testResults.results.filter((r) => !r.passed)
              );
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

          if (GAME_CONFIG.DEBUG_MODE && this.frameCount % 600 === 0) {
            // Every 10 seconds
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

  public saveGame(): void {
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

  public getCurrentSceneName(): string {
    const currentScene = this.sceneManager.getCurrentScene();
    return currentScene ? currentScene.getName() : 'unknown';
  }

  public getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  public getServices(): GameServices {
    return this.services;
  }

  public isGameRunning(): boolean {
    return this.isRunning;
  }

  public resetGame(): void {
    DebugLogger.info('Game', 'Resetting game to new state');

    this.gameState.party = new Party();
    this.gameState.dungeon = [];
    this.gameState.currentFloor = 1;
    this.gameState.inCombat = false;
    this.gameState.gameTime = 0;
    this.gameState.playtimeSeconds = 0;
    this.gameState.turnCount = 0;
    this.gameState.combatEnabled = true;
    this.gameState.currentEncounter = undefined;
    this.gameState.hasEnteredDungeon = false;
    this.gameState.characterRoster = [];

    STARTER_CHARACTER_TEMPLATES.forEach((template) => {
      const character = StarterCharacterFactory.createFromTemplate(template);
      this.gameState.characterRoster.push(character);
    });

    this.gameState.messageLog.clear();
    this.gameState.messageLog.addSystemMessage('Welcome to the dungeon!');
    this.gameState.messageLog.addSystemMessage('Use WASD or arrow keys to move');
    this.gameState.messageLog.addSystemMessage('Press ENTER to interact, M for map');
    this.gameState.messageLog.addSystemMessage('Press C to toggle combat encounters');
    this.gameState.messageLog.addSystemMessage('Press T to trigger combat (testing)');
    this.gameState.messageLog.addSystemMessage('Press R to rest, ESC to return to main menu');

    this.generateNewDungeon();

    this.playtimeStart = Date.now();
    this.frameCount = 0;
    this.autoSaveFrameCounter = 0;
    this.sceneManager.switchTo('town');
  }
}
