import { Scene, SceneManager } from '../core/Scene';
import { InputManager } from '../core/Input';
import { GameState, DungeonTile } from '../types/GameTypes';
import { DungeonView } from '../ui/DungeonView';
import { StatusPanel } from '../ui/StatusPanel';
import { MessageLog } from '../ui/MessageLog';

export class DungeonScene extends Scene {
    private gameState: GameState;
    private sceneManager: SceneManager;
    private inputManager: InputManager;
    private dungeonView!: DungeonView;
    private statusPanel!: StatusPanel;
    private messageLog!: MessageLog;
    private lastMoveTime: number = 0;
    private moveDelay: number = 350;
    private lastTileEventPosition: { x: number, y: number, floor: number } | null = null;

    constructor(gameState: GameState, sceneManager: SceneManager, inputManager: InputManager) {
        super('Dungeon');
        this.gameState = gameState;
        this.sceneManager = sceneManager;
        this.inputManager = inputManager;
    }

    public enter(): void {
        this.messageLog?.addSystemMessage('Entered the dungeon...');
        this.lastTileEventPosition = null;
    }

    public exit(): void {
    }

    public update(_deltaTime: number): void {
        this.handleMovement();
        this.checkRandomEncounter();
        this.checkTileEvents();
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.dungeonView) {
            this.initializeUI(ctx.canvas);
        }

        const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
        if (currentDungeon) {
            this.dungeonView.setDungeon(currentDungeon);
            this.dungeonView.setPlayerPosition(
                this.gameState.party.x,
                this.gameState.party.y,
                this.gameState.party.facing
            );
            this.dungeonView.render();
        }

        this.statusPanel.render(this.gameState.party);
        this.messageLog.render();
    }

    private initializeUI(canvas: HTMLCanvasElement): void {
        this.dungeonView = new DungeonView(canvas);
        this.statusPanel = new StatusPanel(canvas, 624, 0, 400, 500);
        this.messageLog = new MessageLog(canvas, 624, 500, 400, 268);
        
        this.messageLog.addSystemMessage('Welcome to the dungeon!');
        this.messageLog.addSystemMessage('Use WASD or arrow keys to move');
        this.messageLog.addSystemMessage('Press ENTER to interact with objects');
        this.messageLog.addSystemMessage('Press C to toggle combat encounters');
        this.messageLog.addSystemMessage('Press R to rest, ESC to return to main menu');
    }

    private handleMovement(): void {
        const now = Date.now();
        if (now - this.lastMoveTime < this.moveDelay) return;

        const movement = this.inputManager.getMovementInput();
        let moved = false;
        let attempted = false;

        if (movement.forward) {
            attempted = true;
            if (this.canMoveForward()) {
                this.gameState.party.move('forward');
                moved = true;
                this.messageLog.addMessage('Moved forward');
            } else {
                this.messageLog.addWarningMessage('Cannot move forward - blocked by wall');
            }
        } else if (movement.backward) {
            attempted = true;
            if (this.canMoveBackward()) {
                this.gameState.party.move('backward');
                moved = true;
                this.messageLog.addMessage('Moved backward');
            } else {
                this.messageLog.addWarningMessage('Cannot move backward - blocked by wall');
            }
        } else if (movement.left) {
            attempted = true;
            this.gameState.party.move('left');
            moved = true;
            this.messageLog.addMessage('Turned left');
        } else if (movement.right) {
            attempted = true;
            this.gameState.party.move('right');
            moved = true;
            this.messageLog.addMessage('Turned right');
        }

        if (attempted) {
            this.lastMoveTime = now;
            if (moved) {
                this.gameState.turnCount++;
                this.markCurrentTileDiscovered();
                this.lastTileEventPosition = null;
            }
        }
    }

    private canMoveForward(): boolean {
        const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
        if (!currentDungeon) return false;

        const [dx, dy] = this.getDirectionVector();
        const newX = this.gameState.party.x + dx;
        const newY = this.gameState.party.y + dy;

        if (newX < 0 || newX >= currentDungeon.width || newY < 0 || newY >= currentDungeon.height) {
            return false;
        }

        const targetTile = currentDungeon.tiles[newY][newX];
        return targetTile && targetTile.type !== 'wall';
    }

    private canMoveBackward(): boolean {
        const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
        if (!currentDungeon) return false;

        const [dx, dy] = this.getDirectionVector();
        const newX = this.gameState.party.x - dx;
        const newY = this.gameState.party.y - dy;

        if (newX < 0 || newX >= currentDungeon.width || newY < 0 || newY >= currentDungeon.height) {
            return false;
        }

        const targetTile = currentDungeon.tiles[newY][newX];
        return targetTile && targetTile.type !== 'wall';
    }

    private getDirectionVector(): [number, number] {
        switch (this.gameState.party.facing) {
            case 'north': return [0, -1];
            case 'south': return [0, 1];
            case 'east': return [1, 0];
            case 'west': return [-1, 0];
            default: return [0, 0];
        }
    }

    private markCurrentTileDiscovered(): void {
        const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
        if (!currentDungeon) return;

        const tile = currentDungeon.tiles[this.gameState.party.y][this.gameState.party.x];
        if (tile && !tile.discovered) {
            tile.discovered = true;
        }
    }

    private checkRandomEncounter(): void {
        if (!this.gameState.combatEnabled) return;
        
        if (Math.random() < 0.02) {
            const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
            if (!currentDungeon) return;

            const encounter = currentDungeon.encounters.find(zone => 
                this.gameState.party.x >= zone.x1 && this.gameState.party.x <= zone.x2 &&
                this.gameState.party.y >= zone.y1 && this.gameState.party.y <= zone.y2
            );

            if (encounter && Math.random() < encounter.encounterRate) {
                this.messageLog.addCombatMessage('Monsters approach!');
                this.gameState.inCombat = true;
                this.sceneManager.switchTo('combat');
            }
        }
    }

    private checkTileEvents(): void {
        const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
        if (!currentDungeon) return;

        const currentTile = currentDungeon.tiles[this.gameState.party.y][this.gameState.party.x];
        if (!currentTile) return;

        const currentPosition = {
            x: this.gameState.party.x,
            y: this.gameState.party.y,
            floor: this.gameState.currentFloor
        };

        const hasMovedToNewTile = !this.lastTileEventPosition ||
            this.lastTileEventPosition.x !== currentPosition.x ||
            this.lastTileEventPosition.y !== currentPosition.y ||
            this.lastTileEventPosition.floor !== currentPosition.floor;

        if (!hasMovedToNewTile) return;

        this.lastTileEventPosition = currentPosition;

        switch (currentTile.type) {
            case 'stairs_up':
                this.messageLog.addSystemMessage('Stairs leading up (Press ENTER to ascend)');
                break;
            case 'stairs_down':
                this.messageLog.addSystemMessage('Stairs leading down (Press ENTER to descend)');
                break;
            case 'chest':
                this.messageLog.addItemMessage('A treasure chest! (Press ENTER to open)');
                break;
            case 'door':
                this.messageLog.addSystemMessage('A door blocks your path (Press ENTER to open)');
                break;
            case 'trap':
                this.handleTrap(currentTile);
                break;
            case 'event':
                this.handleEvent(currentTile);
                break;
        }
    }

    private handleTrap(_tile: DungeonTile): void {
        if (Math.random() < 0.5) {
            const damage = 5 + Math.floor(Math.random() * 10);
            const frontRow = this.gameState.party.getFrontRow();
            
            if (frontRow.length > 0) {
                const victim = frontRow[Math.floor(Math.random() * frontRow.length)];
                victim.takeDamage(damage);
                this.messageLog.addWarningMessage(`${victim.name} triggers a trap and takes ${damage} damage!`);
                
                if (victim.isDead) {
                    this.messageLog.addDeathMessage(`${victim.name} has died!`);
                }
            }
            
            _tile.type = 'floor';
        }
    }

    private handleEvent(_tile: DungeonTile): void {
        const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
        if (!currentDungeon) return;

        const event = currentDungeon.events.find(e => 
            e.x === this.gameState.party.x && e.y === this.gameState.party.y && !e.triggered
        );

        if (event) {
            event.triggered = true;
            
            switch (event.type) {
                case 'message':
                    this.messageLog.addMagicMessage(event.data.text);
                    break;
                case 'treasure':
                    this.gameState.party.distributeGold(event.data.gold);
                    this.messageLog.addItemMessage(`Found ${event.data.gold} gold!`);
                    break;
                case 'teleport':
                    this.gameState.party.x = event.data.x;
                    this.gameState.party.y = event.data.y;
                    this.messageLog.addMagicMessage('You are teleported elsewhere!');
                    break;
                case 'spinner':
                    for (let i = 0; i < event.data.rotations; i++) {
                        this.gameState.party.move('right');
                    }
                    this.messageLog.addWarningMessage('You feel disoriented!');
                    break;
            }
        }
    }

    public handleInput(key: string): boolean {
        // const actions = this.inputManager.getActionKeys();
        
        if (key === 'enter' || key === ' ') {
            this.handleInteraction();
            return true;
        }
        
        if (key === 'r') {
            this.gameState.party.rest();
            this.messageLog.addSystemMessage('Party rests and recovers some health and mana');
            return true;
        }

        if (key === 'c') {
            this.toggleCombat();
            return true;
        }

        if (key === 'm' || key === 'tab') {
            this.messageLog.addSystemMessage('Menu functionality not yet implemented');
            return true;
        }

        if (key === 'escape') {
            if (confirm('Return to main menu? (Progress will be saved)')) {
                this.sceneManager.switchTo('main_menu');
            }
            return true;
        }

        return false;
    }

    private toggleCombat(): void {
        this.gameState.combatEnabled = !this.gameState.combatEnabled;
        
        if (this.gameState.combatEnabled) {
            this.messageLog.addSystemMessage('Combat encounters ENABLED');
        } else {
            this.messageLog.addWarningMessage('Combat encounters DISABLED (testing mode)');
        }
    }

    private handleInteraction(): void {
        const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
        if (!currentDungeon) return;

        const currentTile = currentDungeon.tiles[this.gameState.party.y][this.gameState.party.x];
        if (!currentTile) return;

        switch (currentTile.type) {
            case 'stairs_up':
                if (this.gameState.currentFloor > 1) {
                    this.gameState.currentFloor--;
                    this.gameState.party.floor = this.gameState.currentFloor;
                    this.messageLog.addSystemMessage(`Ascended to floor ${this.gameState.currentFloor}`);
                    this.lastTileEventPosition = null;
                } else {
                    this.messageLog.addSystemMessage('You have escaped the dungeon!');
                }
                break;
                
            case 'stairs_down':
                if (this.gameState.currentFloor < this.gameState.dungeon.length) {
                    this.gameState.currentFloor++;
                    this.gameState.party.floor = this.gameState.currentFloor;
                    this.messageLog.addSystemMessage(`Descended to floor ${this.gameState.currentFloor}`);
                    this.lastTileEventPosition = null;
                } else {
                    this.messageLog.addSystemMessage('The stairs lead into impenetrable darkness...');
                }
                break;
                
            case 'chest':
                this.messageLog.addItemMessage('You open the chest and find treasure!');
                this.gameState.party.distributeGold(50 + Math.floor(Math.random() * 100));
                currentTile.type = 'floor';
                break;
                
            case 'door':
                this.messageLog.addSystemMessage('The door creaks open');
                currentTile.type = 'floor';
                break;
        }
    }
}