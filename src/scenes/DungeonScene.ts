import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { InputManager } from '../core/Input';
import { DungeonTile, GameState, Item } from '../types/GameTypes';
import { DungeonView } from '../ui/DungeonView';
import { StatusPanel } from '../ui/StatusPanel';
import { DungeonMapView } from '../ui/DungeonMapView';
import { GAME_CONFIG } from '../config/GameConstants';
import { safeConfirm } from '../utils/ErrorHandler';
import { InventorySystem } from '../systems/InventorySystem';

export class DungeonScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private inputManager: InputManager;
  private dungeonView!: DungeonView;
  private statusPanel!: StatusPanel;
  private messageLog: any; // Shared from gameState
  private dungeonMapView!: DungeonMapView;
  private lastMoveTime: number = 0;
  private moveDelay: number = 350;
  private lastTileEventPosition: { x: number; y: number; floor: number } | null = null;
  private lastEncounterPosition: { x: number; y: number; floor: number } | null = null;

  constructor(gameState: GameState, sceneManager: SceneManager, inputManager: InputManager) {
    super('Dungeon');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.inputManager = inputManager;
    
    // Initialize messageLog immediately to avoid runtime errors
    this.messageLog = this.gameState.messageLog;
    
    // Safety check - if messageLog is still undefined, create a temporary one
    if (!this.messageLog) {
      console.warn('MessageLog not found in gameState, this should not happen');
    }
  }

  public enter(): void {
    // Only show "Entered the dungeon..." message when truly entering for the first time,
    // not when returning from combat, inventory, etc.
    if (!this.gameState.inCombat && !this.gameState.hasEnteredDungeon) {
      this.messageLog?.addSystemMessage('Entered the dungeon...');
      this.gameState.hasEnteredDungeon = true;
    }
    this.lastTileEventPosition = null;
  }

  public exit(): void {}

  public update(_deltaTime: number): void {
    this.handleMovement();
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

      this.dungeonMapView.setDungeon(currentDungeon);
      this.dungeonMapView.setPlayerPosition(
        this.gameState.party.x,
        this.gameState.party.y,
        this.gameState.party.facing
      );

      if (!this.dungeonMapView.getIsVisible()) {
        this.dungeonView.render();
        this.statusPanel.render(this.gameState.party);
        this.messageLog.render();
      }

      this.dungeonMapView.render();
    }
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;
    
    if (!this.dungeonView) {
      this.initializeUI(renderContext.mainContext.canvas);
    }

    // Render background layer - CRITICAL for preventing black screen
    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (currentDungeon) {
      this.dungeonView.setDungeon(currentDungeon);
      this.dungeonView.setPlayerPosition(
        this.gameState.party.x,
        this.gameState.party.y,
        this.gameState.party.facing
      );

      this.dungeonMapView.setDungeon(currentDungeon);
      this.dungeonMapView.setPlayerPosition(
        this.gameState.party.x,
        this.gameState.party.y,
        this.gameState.party.facing
      );

      renderManager.renderDungeon((ctx) => {
        if (!this.dungeonMapView.getIsVisible()) {
          // Pass the layer context to dungeonView
          this.dungeonView.render(ctx);
        }
      });

      renderManager.renderUI((ctx) => {
        if (!this.dungeonMapView.getIsVisible()) {
          this.statusPanel.render(this.gameState.party, ctx);
          this.messageLog.render(ctx);
          this.renderControls(ctx);
        }
        this.dungeonMapView.render(ctx);
      });
    } else {
      // Fallback if no dungeon data
      renderManager.renderUI((ctx) => {
        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('No dungeon data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
      });
    }
  }

  private initializeUI(canvas: HTMLCanvasElement): void {
    this.dungeonView = new DungeonView(canvas);
    this.statusPanel = new StatusPanel(canvas, 624, 0, 400, 500);
    this.dungeonMapView = new DungeonMapView(canvas);
  }

  private handleMovement(): void {
    if (this.dungeonMapView?.getIsVisible()) return;

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
        // Remove verbose movement message - let important events speak for themselves
      } else {
        this.messageLog.addWarningMessage('Cannot move forward - blocked by wall');
      }
    } else if (movement.backward) {
      attempted = true;
      if (this.canMoveBackward()) {
        this.gameState.party.move('backward');
        moved = true;
        // Remove verbose movement message - let important events speak for themselves
      } else {
        this.messageLog.addWarningMessage('Cannot move backward - blocked by wall');
      }
    } else if (movement.left) {
      attempted = true;
      this.gameState.party.move('left');
      moved = true;
      // Remove verbose turning message - let important events speak for themselves
    } else if (movement.right) {
      attempted = true;
      this.gameState.party.move('right');
      moved = true;
      // Remove verbose turning message - let important events speak for themselves
    }

    if (attempted) {
      this.lastMoveTime = now;
      if (moved) {
        this.gameState.turnCount++;
        this.markCurrentTileDiscovered();
        this.lastTileEventPosition = null;
        this.checkRandomEncounter(); // Only check encounters when player actually moves
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
      case 'north':
        return [0, -1];
      case 'south':
        return [0, 1];
      case 'east':
        return [1, 0];
      case 'west':
        return [-1, 0];
      default:
        return [0, 0];
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

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) return;

    // Check if we're at the same position as the last encounter
    const currentPosition = {
      x: this.gameState.party.x,
      y: this.gameState.party.y,
      floor: this.gameState.currentFloor
    };

    console.log(`[ENCOUNTER DEBUG] Current pos: (${currentPosition.x}, ${currentPosition.y}, ${currentPosition.floor})`);
    console.log(`[ENCOUNTER DEBUG] Last encounter pos:`, this.lastEncounterPosition);

    if (this.lastEncounterPosition &&
        this.lastEncounterPosition.x === currentPosition.x &&
        this.lastEncounterPosition.y === currentPosition.y &&
        this.lastEncounterPosition.floor === currentPosition.floor) {
      console.log(`[ENCOUNTER DEBUG] Blocking encounter - same position as last encounter`);
      return; // Don't trigger encounter at same position
    }

    // Check if player is in an override zone
    const currentZone = this.getOverrideZoneAtPosition(
      this.gameState.party.x, 
      this.gameState.party.y, 
      currentDungeon
    );

    // Determine encounter behavior based on zone
    let shouldTriggerEncounter = false;
    let encounterRate: number = GAME_CONFIG.ENCOUNTER.RANDOM_RATE;
    let monsterGroups: string[] | undefined = undefined;

    if (currentZone) {
      switch (currentZone.type) {
        case 'safe':
          return; // No encounters in safe zones
        case 'ambush':
          shouldTriggerEncounter = true; // Guaranteed encounter
          break;
        case 'boss':
          encounterRate = currentZone.data?.encounterRate ?? 0.5;
          monsterGroups = currentZone.data?.monsterGroups;
          break;
        case 'high_frequency':
          encounterRate = currentZone.data?.encounterRate ?? 0.08;
          break;
        case 'low_frequency':
          encounterRate = currentZone.data?.encounterRate ?? 0.01;
          break;
        case 'special_mobs':
          encounterRate = currentZone.data?.encounterRate ?? GAME_CONFIG.ENCOUNTER.RANDOM_RATE;
          monsterGroups = currentZone.data?.monsterGroups;
          break;
        case 'treasure':
          // Treasure zones might have guardian encounters
          encounterRate = GAME_CONFIG.ENCOUNTER.OVERRIDE_ZONE_RATES.treasure;
          break;
      }
    }

    // Debug the encounter rate being used
    console.log(`[ENCOUNTER DEBUG] Zone type: ${currentZone?.type || 'normal'}, Rate: ${encounterRate}, Should force: ${shouldTriggerEncounter}`);

    // Roll for encounter (always allow encounters unless in safe zone)
    if (shouldTriggerEncounter || Math.random() < encounterRate) {
      console.log(`[ENCOUNTER DEBUG] Triggering encounter at (${currentPosition.x}, ${currentPosition.y}, ${currentPosition.floor})`);
      
      // Store zone information for combat scene to use for proper messaging
      this.gameState.encounterContext = {
        zoneType: currentZone?.type || 'normal',
        bossType: currentZone?.data?.bossType,
        description: currentZone?.data?.description,
        monsterGroups
      };

      // Store encounter position to prevent re-encounters at same spot
      this.lastEncounterPosition = { ...currentPosition };
      console.log(`[ENCOUNTER DEBUG] Stored encounter position:`, this.lastEncounterPosition);
      
      this.gameState.inCombat = true;
      this.sceneManager.switchTo('combat');
    }
  }

  private getOverrideZoneAtPosition(x: number, y: number, dungeon: any): any {
    return dungeon.overrideZones?.find((zone: any) =>
      x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2
    ) || null;
  }

  private checkTileEvents(): void {
    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) return;

    const currentTile = currentDungeon.tiles[this.gameState.party.y][this.gameState.party.x];
    if (!currentTile) return;

    const currentPosition = {
      x: this.gameState.party.x,
      y: this.gameState.party.y,
      floor: this.gameState.currentFloor,
    };

    const hasMovedToNewTile =
      !this.lastTileEventPosition ||
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
        this.messageLog.addWarningMessage(
          `${victim.name} triggers a trap and takes ${damage} damage!`
        );

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

    const event = currentDungeon.events.find(
      e => e.x === this.gameState.party.x && e.y === this.gameState.party.y && !e.triggered
    );

    if (event) {
      event.triggered = true;

      switch (event.type) {
        case 'message':
          if (event.data.type === 'message') {
            this.messageLog.addMagicMessage(event.data.text);
          }
          break;
        case 'treasure':
          if (event.data.type === 'treasure') {
            this.gameState.party.distributeGold(event.data.gold);
            this.messageLog.addItemMessage(`Found ${event.data.gold} gold!`);
          }
          break;
        case 'teleport':
          if (event.data.type === 'teleport') {
            this.gameState.party.x = event.data.x;
            this.gameState.party.y = event.data.y;
            this.messageLog.addMagicMessage('You are teleported elsewhere!');
          }
          break;
        case 'spinner':
          if (event.data.type === 'spinner') {
            for (let i = 0; i < event.data.rotations; i++) {
              this.gameState.party.move('right');
            }
            this.messageLog.addWarningMessage('You feel disoriented!');
          }
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
      this.checkRandomEncounter(); // Check for encounters when resting
      return true;
    }

    if (key === 'g') {
      this.pickupItems();
      return true;
    }

    if (key === 'c') {
      this.toggleCombat();
      return true;
    }

    if (key === 't') {
      this.triggerCombat();
      return true;
    }

    if (key === 'm') {
      this.toggleMap();
      return true;
    }

    if (key === 'tab') {
      console.log('[DEBUG] Tab pressed - switching to inventory scene');
      this.sceneManager.switchTo('inventory');
      return true;
    }

    if (key === 'escape') {
      if (safeConfirm('Return to main menu? (Progress will be saved)', false)) {
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

  private triggerCombat(): void {
    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) {
      this.messageLog.addWarningMessage('No dungeon data - cannot trigger combat');
      return;
    }

    const playerPos = `(${this.gameState.party.x}, ${this.gameState.party.y})`;
    const currentZone = this.getOverrideZoneAtPosition(
      this.gameState.party.x, 
      this.gameState.party.y, 
      currentDungeon
    );

    // Check if in safe zone
    if (currentZone?.type === 'safe') {
      this.messageLog.addWarningMessage(`Cannot trigger combat in safe zone at ${playerPos}`);
      return;
    }

    // Store zone information for combat scene to generate proper messaging
    this.gameState.encounterContext = {
      zoneType: currentZone?.type || 'normal',
      bossType: currentZone?.data?.bossType,
      description: currentZone?.data?.description,
      monsterGroups: currentZone?.data?.monsterGroups
    };

    this.messageLog.addSystemMessage(`Forcing encounter at ${playerPos}...`);

    // Store encounter position to prevent re-encounters at same spot
    this.lastEncounterPosition = {
      x: this.gameState.party.x,
      y: this.gameState.party.y,
      floor: this.gameState.currentFloor
    };
    
    this.gameState.inCombat = true;
    this.sceneManager.switchTo('combat');
  }

  private toggleMap(): void {
    this.dungeonMapView.toggle();

    if (this.dungeonMapView.getIsVisible()) {
      this.messageLog.addSystemMessage('Map opened');
    } else {
      this.messageLog.addSystemMessage('Map closed');
    }
  }

  private pickupItems(): void {
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentFloor.floorItems) {
      currentFloor.floorItems = new Map();
    }

    const position = `${this.gameState.party.x},${this.gameState.party.y}`;
    const items = currentFloor.floorItems.get(position);

    if (!items || items.length === 0) {
      this.messageLog.addSystemMessage('There are no items here.');
      return;
    }

    const aliveCharacters = this.gameState.party.getAliveCharacters();
    if (aliveCharacters.length === 0) {
      this.messageLog.addWarningMessage('No alive characters to carry items!');
      return;
    }

    // Try to pick up all items, distributing among party members
    const pickedUp: Item[] = [];
    const remaining: Item[] = [];
    
    for (const item of items) {
      let picked = false;
      // Try to give to each character until someone can carry it
      for (const character of aliveCharacters) {
        // Check inventory capacity (simplified - could add weight limits later)
        if (character.inventory.length < GAME_CONFIG.ITEMS.INVENTORY.MAX_ITEMS_PER_CHARACTER) {
          InventorySystem.addItemToInventory(character, item.id);
          this.messageLog.addItemMessage(
            `${character.name} picks up ${item.identified ? item.name : item.unidentifiedName || '?Item'}`
          );
          picked = true;
          pickedUp.push(item);
          break;
        }
      }
      if (!picked) {
        remaining.push(item);
      }
    }

    // Update floor items
    if (remaining.length > 0) {
      currentFloor.floorItems.set(position, remaining);
      this.messageLog.addWarningMessage(`${remaining.length} item(s) could not be picked up (inventory full).`);
    } else {
      currentFloor.floorItems.delete(position);
    }

    if (pickedUp.length > 0) {
      this.messageLog.addSystemMessage(`Picked up ${pickedUp.length} item(s).`);
    }
  }

  private renderControls(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    const y = ctx.canvas.height - 45;
    
    // Check if there are items on ground
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    const position = `${this.gameState.party.x},${this.gameState.party.y}`;
    const hasItems = currentFloor?.floorItems?.has(position) && 
                     currentFloor.floorItems.get(position)!.length > 0;
    
    let controls = 'TAB: Inventory | R: Rest | M: Map | C: Toggle Combat';
    if (hasItems) {
      controls = 'G: Pick Up Items | ' + controls;
    }
    
    ctx.fillText(controls, 10, y);
    ctx.fillText('WASD/Arrows: Move | SPACE/ENTER: Interact | ESC: Menu', 10, y + 12);
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
          this.gameState.hasEnteredDungeon = false; // Allow "Entered the dungeon..." for new floor
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
          this.gameState.hasEnteredDungeon = false; // Allow "Entered the dungeon..." for new floor
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

    // Check for encounters after any interaction
    this.checkRandomEncounter();
  }
}
