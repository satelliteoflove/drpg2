import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { InputManager } from '../core/Input';
import { DungeonTile, GameState, Item } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { DungeonView } from '../ui/DungeonView';
import { StatusPanel } from '../ui/StatusPanel';
import { DungeonMapView } from '../ui/DungeonMapView';
import { DebugOverlay } from '../ui/DebugOverlay';
import { GAME_CONFIG } from '../config/GameConstants';
import { InventorySystem } from '../systems/InventorySystem';
import { KEY_BINDINGS } from '../config/KeyBindings';
import { CombatSystem } from '../systems/CombatSystem';
import { DebugLogger } from '../utils/DebugLogger';
import { UI_CONSTANTS } from '../config/UIConstants';
import { DungeonASCIIState } from '../rendering/scenes/DungeonASCIIState';
import { CanvasRenderer, RendererConfig } from '../rendering/CanvasRenderer';
import { FeatureFlags, FeatureFlagKey } from '../config/FeatureFlags';

export class DungeonScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private inputManager: InputManager;
  private dungeonView!: DungeonView;
  private statusPanel!: StatusPanel;
  private messageLog: any; // Shared from gameState
  private dungeonMapView!: DungeonMapView;
  private debugOverlay!: DebugOverlay;
  private lastMoveTime: number = 0;
  private moveDelay: number = UI_CONSTANTS.TIMING.MOVE_DELAY;
  private lastTileEventPosition: { x: number; y: number; floor: number } | null = null;
  private lastEncounterPosition: { x: number; y: number; floor: number } | null = null;
  
  // ASCII rendering components
  public dungeonASCIIState: DungeonASCIIState | null = null;
  private canvasRenderer: CanvasRenderer | null = null;
  
  // Item pickup state
  private itemPickupState: 'none' | 'selecting_character' = 'none';
  
  // Castle stairs state
  private isAwaitingCastleStairsResponse: boolean = false;
  private itemsToPickup: Item[] = [];
  private currentItemIndex = 0;
  private selectedCharacterIndex = 0;

  constructor(gameState: GameState, sceneManager: SceneManager, inputManager: InputManager) {
    super('Dungeon');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.inputManager = inputManager;
    
    // Initialize messageLog immediately to avoid runtime errors
    this.messageLog = this.gameState.messageLog;
    
    // Safety check - if messageLog is still undefined, create a temporary one
    if (!this.messageLog) {
      DebugLogger.warn('DungeonScene', 'MessageLog not found in gameState, this should not happen');
    }
  }

  public enter(): void {
    // Set debug overlay scene name
    this.debugOverlay?.setCurrentScene('Dungeon');

    // Check if ASCII should be enabled
    if (this.shouldUseASCIIRendering() && !this.dungeonASCIIState) {
      // Initialize ASCII components early if the flag is enabled
      const canvas = (window as any).game?.canvas;
      if (canvas) {
        this.initializeASCIIComponents(canvas);
      }
    }

    // Also check if ASCII was enabled after scene creation
    this.checkAndInitializeASCII()

    // Only show "Entered the dungeon..." message when truly entering for the first time,
    // not when returning from combat, inventory, etc.
    if (!this.gameState.inCombat && !this.gameState.hasEnteredDungeon) {
      this.messageLog?.addSystemMessage('Entered the dungeon...');
      this.gameState.hasEnteredDungeon = true;
    }
    this.lastTileEventPosition = null;
    
    // Check for pending loot from combat
    if (this.gameState.pendingLoot && this.gameState.pendingLoot.length > 0) {
      const aliveCharacters = this.gameState.party.getAliveCharacters();
      if (aliveCharacters.length > 0) {
        // Start item distribution immediately
        this.itemsToPickup = this.gameState.pendingLoot;
        this.currentItemIndex = 0;
        this.selectedCharacterIndex = 0;
        this.itemPickupState = 'selecting_character';
        
        const currentItem = this.itemsToPickup[this.currentItemIndex];
        this.messageLog.addSystemMessage(
          `Distributing loot: ${currentItem.identified ? currentItem.name : currentItem.unidentifiedName || '?Item'}. Who should take it?`
        );
        
        // Clear pending loot
        this.gameState.pendingLoot = undefined;
      }
    }
  }

  public exit(): void {}

  public update(_deltaTime: number): void {
    this.handleMovement();
    this.checkTileEvents();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Check if ASCII needs to be initialized (in case it was enabled after scene creation)
    this.checkAndInitializeASCII();

    if (this.shouldUseASCIIRendering()) {
      this.renderASCII(ctx);
    } else {
      this.renderImperative(ctx);
    }
  }

  private shouldUseASCIIRendering(): boolean {
    return FeatureFlags.isEnabled(FeatureFlagKey.ASCII_RENDERING) || 
           FeatureFlags.isEnabled('DUNGEON_ASCII', 'Dungeon');
  }

  private renderASCII(ctx: CanvasRenderingContext2D): void {
    if (!this.dungeonASCIIState) {
      this.initializeASCIIComponents(ctx.canvas);
    }

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentDungeon) return;

    // Update ASCII state with current game data
    this.dungeonASCIIState!.setDungeon(currentDungeon);
    this.dungeonASCIIState!.setPlayerPosition(
      this.gameState.party.x,
      this.gameState.party.y,
      this.gameState.party.facing
    );

    // Update view based on map visibility
    this.dungeonASCIIState!.setMapVisible(this.dungeonMapView?.getIsVisible() || false);
    this.dungeonASCIIState!.updateDungeonView();

    // Render status and messages
    this.dungeonASCIIState!.renderStatusPanel(this.gameState.party);
    
    // Get recent messages from log
    const messages: string[] = [];
    if (this.messageLog && this.messageLog.messages) {
      const recentMessages = this.messageLog.messages.slice(-4);
      recentMessages.forEach((msg: any) => {
        messages.push(msg.text || msg);
      });
    }
    this.dungeonASCIIState!.renderMessageLog(messages);
    
    // Render controls
    this.dungeonASCIIState!.renderControls();

    // Handle special UI states
    if (this.itemPickupState === 'selecting_character') {
      const aliveCharacters = this.gameState.party.getAliveCharacters();
      const currentItem = this.itemsToPickup[this.currentItemIndex];
      const itemName = currentItem.identified ? currentItem.name : currentItem.unidentifiedName || '?Item';
      this.dungeonASCIIState!.renderItemPickupUI(itemName, aliveCharacters, this.selectedCharacterIndex);
    }

    if (this.isAwaitingCastleStairsResponse) {
      this.dungeonASCIIState!.renderCastleStairsPrompt();
    }

    // Render to canvas
    if (this.canvasRenderer) {
      this.canvasRenderer.renderASCIIGrid(this.dungeonASCIIState!.getGrid());
    }

    // Update debug overlay
    this.updateDebugData();
    this.debugOverlay?.render(this.gameState);
  }

  private renderImperative(ctx: CanvasRenderingContext2D): void {
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
      
      // Update debug overlay with current system data
      this.updateDebugData();
      
      // Always render debug overlay last so it appears on top
      this.debugOverlay.render(this.gameState);
    }
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    if (this.shouldUseASCIIRendering()) {
      // ASCII rendering uses single layer
      this.render(renderContext.mainContext);
    } else {
      // Original layered rendering
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
            this.renderItemPickupUI(ctx);
          }
          this.dungeonMapView.render(ctx);
          
          // Update debug overlay with current system data
          this.updateDebugData();
          
          // Always render debug overlay last so it appears on top
          this.debugOverlay.render(this.gameState);
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
  }

  private initializeUI(canvas: HTMLCanvasElement): void {
    this.dungeonView = new DungeonView(canvas);
    this.statusPanel = new StatusPanel(canvas, 624, 0, 400, 500);
    this.dungeonMapView = new DungeonMapView(canvas);
    this.debugOverlay = new DebugOverlay(canvas);
  }

  private initializeASCIIComponents(canvas: HTMLCanvasElement): void {
    const rendererConfig: RendererConfig = {
      charWidth: 10,
      charHeight: 20,
      fontFamily: 'monospace',
      fontSize: 16,
      antialiasing: false
    };

    this.dungeonASCIIState = new DungeonASCIIState();
    this.canvasRenderer = new CanvasRenderer(canvas, rendererConfig);

    // Also initialize imperative components for fallback
    if (!this.dungeonView) {
      this.initializeUI(canvas);
    }

    DebugLogger.info('DungeonScene', 'ASCII rendering components initialized');
  }

  private checkAndInitializeASCII(): void {
    // This method ensures ASCII is initialized even if the flag was enabled after scene creation
    if (this.shouldUseASCIIRendering() && !this.dungeonASCIIState) {
      const canvas = (window as any).game?.canvas;
      if (canvas) {
        console.log('[DungeonScene] Initializing ASCII components dynamically');
        this.initializeASCIIComponents(canvas);
      } else {
        console.log('[DungeonScene] No canvas available for ASCII initialization');
      }
    }
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
      // Turning is not actual movement, don't set moved = true
      // Remove verbose turning message - let important events speak for themselves
    } else if (movement.right) {
      attempted = true;
      this.gameState.party.move('right');
      // Turning is not actual movement, don't set moved = true
      // Remove verbose turning message - let important events speak for themselves
    }

    if (attempted) {
      this.lastMoveTime = now;
      if (moved) {
        // Only for actual movement (forward/backward)
        this.gameState.turnCount++;
        this.markCurrentTileDiscovered();
        this.lastTileEventPosition = null;
        this.checkRandomEncounter(); // Only check encounters when player actually moves
      } else if (movement.left || movement.right) {
        // For turning only - increment turn count but don't check encounters
        this.gameState.turnCount++;
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

    DebugLogger.debug('DungeonScene', `Current pos: (${currentPosition.x}, ${currentPosition.y}, ${currentPosition.floor})`);
    DebugLogger.debug('DungeonScene', 'Last encounter pos', this.lastEncounterPosition);

    if (this.lastEncounterPosition &&
        this.lastEncounterPosition.x === currentPosition.x &&
        this.lastEncounterPosition.y === currentPosition.y &&
        this.lastEncounterPosition.floor === currentPosition.floor) {
      DebugLogger.debug('DungeonScene', 'Blocking encounter - same position as last encounter');
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
    DebugLogger.debug('DungeonScene', `Zone type: ${currentZone?.type || 'normal'}, Rate: ${encounterRate}, Should force: ${shouldTriggerEncounter}`);

    // Roll for encounter (always allow encounters unless in safe zone)
    if (shouldTriggerEncounter || Math.random() < encounterRate) {
      DebugLogger.debug('DungeonScene', `Triggering encounter at (${currentPosition.x}, ${currentPosition.y}, ${currentPosition.floor})`);
      
      // Store zone information for combat scene to use for proper messaging
      this.gameState.encounterContext = {
        zoneType: currentZone?.type || 'normal',
        bossType: currentZone?.data?.bossType,
        description: currentZone?.data?.description,
        monsterGroups
      };

      // Store encounter position to prevent re-encounters at same spot
      this.lastEncounterPosition = { ...currentPosition };
      DebugLogger.debug('DungeonScene', 'Stored encounter position', this.lastEncounterPosition);
      
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
    
    // Debug: Log the key and expected binding
    if (key.includes('ctrl')) {
      DebugLogger.debug('DungeonScene', 'Key pressed: ' + key);
      DebugLogger.debug('DungeonScene', 'Expected debug overlay key: ' + KEY_BINDINGS.dungeonActions.debugOverlay);
    }
    
    // Handle castle stairs response
    if (this.isAwaitingCastleStairsResponse) {
      return this.handleCastleStairsInput(key);
    }
    
    // Handle debug scene key combination first
    if (key === KEY_BINDINGS.dungeonActions.debugOverlay) {
      DebugLogger.debug('DungeonScene', 'Switching to debug scene');
      const debugScene = this.sceneManager.getScene('debug') as any;
      if (debugScene && debugScene.setPreviousScene) {
        debugScene.setPreviousScene('dungeon');
      }
      this.sceneManager.switchTo('debug');
      return true;
    }
    
    
    // Handle item pickup selection state
    if (this.itemPickupState === 'selecting_character') {
      return this.handleItemPickupSelection(key);
    }
    
    // Handle movement keys directly for immediate response (especially in tests)
    // But only for turning - forward/backward needs collision checking from handleMovement
    if (key === 'a' || key === 'arrowleft') {
      const now = Date.now();
      if (now - this.lastMoveTime >= this.moveDelay) {
        this.gameState.party.move('left');
        this.gameState.turnCount++;
        this.lastMoveTime = now;
      }
      return true;
    } else if (key === 'd' || key === 'arrowright') {
      const now = Date.now();
      if (now - this.lastMoveTime >= this.moveDelay) {
        this.gameState.party.move('right');
        this.gameState.turnCount++;
        this.lastMoveTime = now;
      }
      return true;
    }

    if (key === 'enter' || key === ' ') {
      this.handleInteraction();
      return true;
    }

    if (key === KEY_BINDINGS.dungeonActions.rest) {
      this.gameState.party.rest();
      this.messageLog.addSystemMessage('Party rests and recovers some health and mana');
      this.checkRandomEncounter(); // Check for encounters when resting
      return true;
    }


    if (key === KEY_BINDINGS.dungeonActions.toggleCombat) {
      this.toggleCombat();
      return true;
    }

    if (key === 't') {
      this.triggerCombat();
      return true;
    }

    if (key === KEY_BINDINGS.dungeonActions.map) {
      this.toggleMap();
      return true;
    }

    if (key === KEY_BINDINGS.dungeonActions.inventory) {
      DebugLogger.debug('DungeonScene', 'Tab pressed - switching to inventory scene');
      this.sceneManager.switchTo('inventory');
      return true;
    }

    if (key === 'escape') {
      // Go to Town instead of main menu for better game flow
      this.sceneManager.switchTo('town');
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


  private handleItemPickupSelection(key: string): boolean {
    const aliveCharacters = this.gameState.party.getAliveCharacters();
    
    if (key === 'escape' || key === 'l') {
      // Discard current item permanently
      const item = this.itemsToPickup[this.currentItemIndex];
      this.messageLog.addSystemMessage(`Discarded ${item.identified ? item.name : item.unidentifiedName || '?Item'}.`);
      
      // Move to next item or finish
      this.currentItemIndex++;
      if (this.currentItemIndex >= this.itemsToPickup.length) {
        this.itemPickupState = 'none';
        this.itemsToPickup = [];
        this.messageLog.addSystemMessage('Finished distributing items.');
      } else {
        // Show next item
        const nextItem = this.itemsToPickup[this.currentItemIndex];
        this.messageLog.addSystemMessage(
          `Found ${nextItem.identified ? nextItem.name : nextItem.unidentifiedName || '?Item'}. Who should take it?`
        );
        this.selectedCharacterIndex = 0;
      }
      return true;
    }
    
    if (key === 'arrowup' || key === 'w') {
      this.selectedCharacterIndex = Math.max(0, this.selectedCharacterIndex - 1);
      return true;
    } else if (key === 'arrowdown' || key === 's') {
      this.selectedCharacterIndex = Math.min(aliveCharacters.length - 1, this.selectedCharacterIndex + 1);
      return true;
    } else if (key === 'enter' || key === ' ') {
      // Give item to selected character
      const character = aliveCharacters[this.selectedCharacterIndex];
      const item = this.itemsToPickup[this.currentItemIndex];
      
      if (character.inventory.length >= GAME_CONFIG.ITEMS.INVENTORY.MAX_ITEMS_PER_CHARACTER) {
        this.messageLog.addWarningMessage(`${character.name}'s inventory is full!`);
        return true;
      }
      
      // Add item to character's inventory
      // Check if it's a stackable consumable
      const existingItem = character.inventory.find((i: Item) => i.id === item.id && i.type === 'consumable');
      if (existingItem && item.type === 'consumable') {
        existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
      } else {
        character.inventory.push(item);
      }
      this.messageLog.addItemMessage(
        `${character.name} takes ${item.identified ? item.name : item.unidentifiedName || '?Item'}`
      );
      
      // Move to next item or finish
      this.currentItemIndex++;
      if (this.currentItemIndex >= this.itemsToPickup.length) {
        // All items distributed
        this.itemPickupState = 'none';
        this.itemsToPickup = [];
        this.messageLog.addSystemMessage('All items distributed.');
      } else {
        // Show next item
        const nextItem = this.itemsToPickup[this.currentItemIndex];
        this.messageLog.addSystemMessage(
          `Found ${nextItem.identified ? nextItem.name : nextItem.unidentifiedName || '?Item'}. Who should take it?`
        );
        this.selectedCharacterIndex = 0;
      }
      return true;
    }
    
    // Number keys for quick character selection
    const num = parseInt(key);
    if (!isNaN(num) && num >= 1 && num <= aliveCharacters.length) {
      this.selectedCharacterIndex = num - 1;
      const character = aliveCharacters[this.selectedCharacterIndex];
      const item = this.itemsToPickup[this.currentItemIndex];
      
      if (character.inventory.length >= GAME_CONFIG.ITEMS.INVENTORY.MAX_ITEMS_PER_CHARACTER) {
        this.messageLog.addWarningMessage(`${character.name}'s inventory is full!`);
        return true;
      }
      
      // Add item to character's inventory
      // Check if it's a stackable consumable
      const existingItem = character.inventory.find((i: Item) => i.id === item.id && i.type === 'consumable');
      if (existingItem && item.type === 'consumable') {
        existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
      } else {
        character.inventory.push(item);
      }
      this.messageLog.addItemMessage(
        `${character.name} takes ${item.identified ? item.name : item.unidentifiedName || '?Item'}`
      );
      
      // Move to next item or finish
      this.currentItemIndex++;
      if (this.currentItemIndex >= this.itemsToPickup.length) {
        // All items distributed
        this.itemPickupState = 'none';
        this.itemsToPickup = [];
        this.messageLog.addSystemMessage('All items distributed.');
      } else {
        // Show next item
        const nextItem = this.itemsToPickup[this.currentItemIndex];
        this.messageLog.addSystemMessage(
          `Found ${nextItem.identified ? nextItem.name : nextItem.unidentifiedName || '?Item'}. Who should take it?`
        );
        this.selectedCharacterIndex = 0;
      }
      return true;
    }
    
    return false;
  }

  private renderControls(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    const y = ctx.canvas.height - 45;
    
    const controls = 'TAB: Inventory | R: Rest | M: Map | C: Toggle Combat | Ctrl+D: Debug';
    
    ctx.fillText(controls, 10, y);
    ctx.fillText('WASD/Arrows: Move | SPACE/ENTER: Interact | ESC: Menu', 10, y + 12);
  }
  
  private renderItemPickupUI(ctx: CanvasRenderingContext2D): void {
    if (this.itemPickupState !== 'selecting_character') return;
    
    const aliveCharacters = this.gameState.party.getAliveCharacters();
    if (aliveCharacters.length === 0 || this.itemsToPickup.length === 0) return;
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw selection window
    const windowX = 200;
    const windowY = 150;
    const windowWidth = 400;
    const windowHeight = 300;
    
    // Window background
    ctx.fillStyle = '#222';
    ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2;
    ctx.strokeRect(windowX, windowY, windowWidth, windowHeight);
    
    // Title
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    const currentItem = this.itemsToPickup[this.currentItemIndex];
    const itemName = currentItem.identified ? currentItem.name : currentItem.unidentifiedName || '?Item';
    ctx.fillText(`Select character to receive:`, windowX + windowWidth / 2, windowY + 30);
    ctx.fillText(`${itemName}`, windowX + windowWidth / 2, windowY + 50);
    
    // Item counter
    ctx.font = '12px monospace';
    ctx.fillText(`Item ${this.currentItemIndex + 1} of ${this.itemsToPickup.length}`, windowX + windowWidth / 2, windowY + 70);
    
    // Character list
    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    const startY = windowY + 100;
    const lineHeight = 25;
    
    aliveCharacters.forEach((character: any, index: number) => {
      const y = startY + (index * lineHeight);
      
      // Highlight selected character
      if (index === this.selectedCharacterIndex) {
        ctx.fillStyle = '#444';
        ctx.fillRect(windowX + 20, y - 15, windowWidth - 40, 20);
      }
      
      // Character info
      ctx.fillStyle = index === this.selectedCharacterIndex ? '#ff0' : '#fff';
      const inventorySpace = GAME_CONFIG.ITEMS.INVENTORY.MAX_ITEMS_PER_CHARACTER - character.inventory.length;
      const spacesText = inventorySpace > 0 ? `${inventorySpace} spaces` : 'FULL';
      ctx.fillText(`${index + 1}. ${character.name} (${spacesText})`, windowX + 30, y);
    });
    
    // Show "Discard" option after all characters
    const discardY = startY + (aliveCharacters.length * lineHeight);
    ctx.fillStyle = '#888';
    ctx.fillText(`L. Discard it`, windowX + 30, discardY);
    
    // Instructions
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UP/DOWN: Select | ENTER/1-6: Confirm | L: Discard', windowX + windowWidth / 2, windowY + windowHeight - 20);
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
          // Castle stairs at 0,0 on Floor 1 - authentic Wizardry mechanic
          this.showCastleStairsPrompt();
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

  private updateDebugData(): void {
    if (!this.debugOverlay) return;

    // Get current loot system debug data
    const lootData = InventorySystem.getLootDebugData();
    
    // Calculate party stats
    const totalLuck = this.gameState.party.characters.reduce((sum: number, char: Character) => sum + char.stats.luck, 0);
    const averageLevel = this.gameState.party.characters.reduce((sum: number, char: Character) => sum + char.level, 0) / this.gameState.party.characters.length;
    
    // Get combat debug data
    const combatData = CombatSystem.getCombatDebugData();

    // Update debug overlay with current data
    this.debugOverlay.updateDebugData({
      lootSystem: lootData,
      partyStats: {
        totalLuck,
        luckMultiplier: lootData.luckMultiplier,
        averageLevel
      },
      combatSystem: combatData
    });
  }

  private showCastleStairsPrompt(): void {
    this.isAwaitingCastleStairsResponse = true;
    this.messageLog.addSystemMessage('You see stairs leading up to the castle.');
    this.messageLog.addSystemMessage('Do you wish to climb the steps to the castle? (Y/N)');
  }

  private handleCastleStairsInput(key: string): boolean {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey === 'y' || key === 'enter') {
      this.isAwaitingCastleStairsResponse = false;
      this.messageLog.addSystemMessage('You climb the steps and enter the castle.');
      this.sceneManager.switchTo('town');
      return true;
    } else if (lowerKey === 'n' || key === 'escape') {
      this.isAwaitingCastleStairsResponse = false;
      this.messageLog.addSystemMessage('You remain in the dungeon.');
      return true;
    }
    
    return false;
  }

  // Testing helpers - expose private properties for Playwright tests
  public getASCIIState(): DungeonASCIIState | null {
    return this.dungeonASCIIState;
  }

  public getCanvasRenderer(): CanvasRenderer | null {
    return this.canvasRenderer;
  }

  public getDungeonView(): DungeonView | null {
    return this.dungeonView;
  }
}
