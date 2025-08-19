import { SceneManager } from './Scene';
import { InputManager } from './Input';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { NewGameScene } from '../scenes/NewGameScene';
import { DungeonScene } from '../scenes/DungeonScene';
import { CharacterCreationScene } from '../scenes/CharacterCreationScene';
import { CombatScene } from '../scenes/CombatScene';
import { Party } from '../entities/Party';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { GameState } from '../types/GameTypes';
import { SaveManager } from '../utils/SaveManager';

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
        this.ctx = canvas.getContext('2d')!;
        this.setupCanvas();
        this.initializeManagers();
        this.initializeGameState();
        this.setupScenes();
    }

    private setupCanvas(): void {
        this.canvas.width = 1024;
        this.canvas.height = 768;
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
            this.gameState = savedGame.gameState;
            this.gameState.party = this.reconstructParty(savedGame.gameState.party);
            this.playtimeStart = Date.now() - (savedGame.playtimeSeconds * 1000);
            
            if (this.gameState.combatEnabled === undefined) {
                this.gameState.combatEnabled = true;
            }
        } else {
            this.gameState = {
                party: new Party(),
                dungeon: [],
                currentFloor: 1,
                inCombat: false,
                gameTime: 0,
                turnCount: 0,
                combatEnabled: true
            };
            
            this.generateNewDungeon();
        }
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

    private reconstructParty(partyData: any): Party {
        const party = new Party();
        
        Object.assign(party, partyData);
        
        return party;
    }

    private setupScenes(): void {
        this.sceneManager.addScene('main_menu', new MainMenuScene(this.gameState, this.sceneManager));
        this.sceneManager.addScene('new_game', new NewGameScene(this.gameState, this.sceneManager));
        this.sceneManager.addScene('character_creation', new CharacterCreationScene(this.gameState, this.sceneManager));
        this.sceneManager.addScene('dungeon', new DungeonScene(this.gameState, this.sceneManager, this.inputManager));
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
    }

    private setupAutoSave(): void {
        setInterval(() => {
            if (this.isRunning && !this.gameState.inCombat) {
                this.saveGame();
            }
        }, 30000);
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
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.sceneManager.render(this.ctx);
        
        this.renderDebugInfo();
    }

    private renderDebugInfo(): void {
        const playtimeSeconds = Math.floor((Date.now() - this.playtimeStart) / 1000);
        const hours = Math.floor(playtimeSeconds / 3600);
        const minutes = Math.floor((playtimeSeconds % 3600) / 60);
        const seconds = playtimeSeconds % 60;
        
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Playtime: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, 10, this.canvas.height - 10);
        
        const currentScene = this.sceneManager.getCurrentScene();
        if (currentScene) {
            this.ctx.fillText(`Scene: ${currentScene.getName()}`, 200, this.canvas.height - 10);
        }
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