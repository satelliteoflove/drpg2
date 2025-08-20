import { SceneManager } from './Scene';
import { InputManager } from './Input';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { NewGameScene } from '../scenes/NewGameScene';
import { DungeonScene } from '../scenes/DungeonScene';
import { CharacterCreationScene } from '../scenes/CharacterCreationScene';
import { CombatScene } from '../scenes/CombatScene';
import { Party } from '../entities/Party';
import { Character } from '../entities/Character';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { GameState } from '../types/GameTypes';
import { SaveManager } from '../utils/SaveManager';
import { GAME_CONFIG } from '../config/GameConstants';
import { TypeValidation } from '../utils/TypeValidation';
import { ErrorHandler, ErrorSeverity, createSafeCanvas } from '../utils/ErrorHandler';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private sceneManager!: SceneManager;
  private inputManager!: InputManager;
  private gameState!: GameState;
  private playtimeStart: number = Date.now();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = createSafeCanvas(canvas);
    if (!ctx) {
      throw new Error('Failed to initialize canvas context');
    }
    this.ctx = ctx;
    this.setupCanvas();
    this.initializeManagers();
    this.initializeGameState();
    this.setupScenes();
  }

  private setupCanvas(): void {
    this.canvas.width = GAME_CONFIG.CANVAS.WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS.HEIGHT;
  }

  private initializeManagers(): void {
    this.sceneManager = new SceneManager();
    this.inputManager = new InputManager();

    this.inputManager.setKeyPressCallback((key: string) => {
      return this.sceneManager.handleInput(key);
    });
  }

  private initializeGameState(): void {
    const savedGame = SaveManager.loadGame();

    if (savedGame) {
      const validatedGameState = TypeValidation.safeValidateGameState(savedGame.gameState);
      if (validatedGameState) {
        this.gameState = validatedGameState;
        this.gameState.party = this.reconstructParty(savedGame.gameState.party);
        this.playtimeStart = Date.now() - savedGame.playtimeSeconds * 1000;
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
    };

    this.generateNewDungeon();
  }

  private generateNewDungeon(): void {
    const generator = new DungeonGenerator(20, 20);
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
  }

  private setupAutoSave(): void {
    setInterval(() => {
      if (this.isRunning && !this.gameState.inCombat) {
        this.saveGame();
      }
    }, GAME_CONFIG.AUTO_SAVE.INTERVAL_MS);
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
    this.gameState.gameTime += deltaTime;
    this.sceneManager.update(deltaTime);
  }

  private render(): void {
    ErrorHandler.safeCanvasOperation(
      () => {
        this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.sceneManager.render(this.ctx);

        this.renderDebugInfo();
        return undefined;
      },
      undefined,
      'Game.render'
    );
  }

  private renderDebugInfo(): void {
    const playtimeSeconds = Math.floor((Date.now() - this.playtimeStart) / 1000);
    const hours = Math.floor(playtimeSeconds / 3600);
    const minutes = Math.floor((playtimeSeconds % 3600) / 60);
    const seconds = playtimeSeconds % 60;

    ErrorHandler.safeCanvasOperation(
      () => {
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
        return undefined;
      },
      undefined,
      'Game.renderDebugInfo'
    );
  }

  private saveGame(): void {
    const playtimeSeconds = Math.floor((Date.now() - this.playtimeStart) / 1000);
    SaveManager.saveGame(this.gameState, playtimeSeconds);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getGameState(): GameState {
    return this.gameState;
  }
}
