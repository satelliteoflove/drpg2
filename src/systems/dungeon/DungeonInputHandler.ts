import { GameState, Direction } from '../../types/GameTypes';
import { KEY_BINDINGS } from '../../config/KeyBindings';
import { DebugLogger } from '../../utils/DebugLogger';
import { DungeonMovementHandler, MovementResult } from './DungeonMovementHandler';
import { DungeonItemPickupUI } from './DungeonItemPickupUI';
import { SceneManager } from '../../core/Scene';

export interface DungeonInputContext {
  isAwaitingCastleStairsResponse?: boolean;
  dungeonMapView?: any;
}

export class DungeonInputHandler {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private messageLog: any;
  private movementHandler: DungeonMovementHandler;
  private itemPickupUI: DungeonItemPickupUI;
  private context: DungeonInputContext;

  constructor(
    gameState: GameState,
    sceneManager: SceneManager,
    messageLog: any,
    movementHandler: DungeonMovementHandler,
    itemPickupUI: DungeonItemPickupUI
  ) {
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = messageLog;
    this.movementHandler = movementHandler;
    this.itemPickupUI = itemPickupUI;
    this.context = {};
  }

  public setContext(context: DungeonInputContext): void {
    this.context = { ...this.context, ...context };
  }

  public handleInput(key: string): boolean {
    if (key.includes('ctrl')) {
      DebugLogger.debug('DungeonInputHandler', 'Key pressed: ' + key);
      DebugLogger.debug(
        'DungeonInputHandler',
        'Expected debug overlay key: ' + KEY_BINDINGS.dungeonActions.debugOverlay
      );
    }

    if (this.context.isAwaitingCastleStairsResponse) {
      return this.handleCastleStairsInput(key);
    }

    if (this.itemPickupUI.isActive()) {
      return this.itemPickupUI.handleInput(key);
    }

    if (key === KEY_BINDINGS.dungeonActions.debugOverlay) {
      this.switchToDebugScene();
      return true;
    }

    const movementHandled = this.handleMovementInput(key);
    if (movementHandled) return true;

    const actionHandled = this.handleActionInput(key);
    if (actionHandled) return true;

    const sceneHandled = this.handleSceneSwitch(key);
    if (sceneHandled) return true;

    return false;
  }

  private handleMovementInput(key: string): boolean {
    let direction: Direction | null = null;
    let isTurn = false;

    switch (key) {
      case 'w':
      case 'arrowup':
        direction = 'forward';
        break;
      case 's':
      case 'arrowdown':
        direction = 'backward';
        break;
      case 'a':
      case 'arrowleft':
        direction = 'left';
        isTurn = true;
        break;
      case 'd':
      case 'arrowright':
        direction = 'right';
        isTurn = true;
        break;
    }

    if (!direction) return false;

    if (isTurn) {
      this.movementHandler.handleTurn(direction as 'left' | 'right');
    } else {
      const result = this.movementHandler.handleMovement(direction);
      this.processMovementResult(result);
    }

    return true;
  }

  private processMovementResult(result: MovementResult): void {
    if (!result.moved && result.message) {
      this.messageLog?.addSystemMessage(result.message);
    }

    if (result.triggered) {
      switch (result.triggered) {
        case 'combat':
          DebugLogger.debug('DungeonInputHandler', 'Combat triggered from movement');
          break;
        case 'stairs':
          this.checkForCastleReturn();
          break;
      }
    }
  }

  private handleActionInput(key: string): boolean {
    if (key === 'enter' || key === ' ') {
      this.handleInteraction();
      return true;
    }

    if (key === KEY_BINDINGS.dungeonActions.rest) {
      this.handleRest();
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

    return false;
  }

  private handleSceneSwitch(key: string): boolean {
    if (key === KEY_BINDINGS.dungeonActions.inventory) {
      DebugLogger.debug('DungeonInputHandler', 'Tab pressed - switching to inventory scene');
      this.sceneManager.switchTo('inventory');
      return true;
    }

    if (key === 'escape') {
      this.sceneManager.switchTo('town');
      return true;
    }

    return false;
  }

  private handleInteraction(): void {
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentFloor) return;

    const currentTile = currentFloor.tiles[this.gameState.party.y][this.gameState.party.x];
    if (!currentTile) return;

    switch (currentTile.type) {
      case 'stairs_up':
        if (this.gameState.currentFloor > 1) {
          this.movementHandler.handleMovement('forward');
        } else {
          this.messageLog?.addSystemMessage("You're already on the top floor!");
        }
        break;

      case 'stairs_down':
        if (this.gameState.currentFloor < this.gameState.dungeon.length) {
          this.movementHandler.handleMovement('forward');
        } else {
          this.messageLog?.addSystemMessage("You're already on the bottom floor!");
        }
        break;

      case 'chest':
        if (!currentTile.properties?.opened) {
          this.openChest(currentTile);
        } else {
          this.messageLog?.addSystemMessage('The chest has already been opened.');
        }
        break;

      case 'door':
        if (currentTile.properties?.locked) {
          this.messageLog?.addSystemMessage('The door is locked. You need a key.');
        } else {
          currentTile.type = 'floor';
          this.messageLog?.addSystemMessage('You open the door.');
        }
        break;

      default:
        this.messageLog?.addSystemMessage('Nothing to interact with here.');
    }
  }

  private openChest(tile: any): void {
    const items = tile.properties?.items || [];
    const gold = tile.properties?.gold || 0;

    if (gold > 0) {
      this.gameState.party.pooledGold += gold;
      this.messageLog?.addSystemMessage(`Found ${gold} gold!`);
    }

    if (items.length > 0) {
      this.itemPickupUI.startItemPickup(items);
    }

    tile.properties = { ...tile.properties, opened: true };
  }

  private handleRest(): void {
    this.gameState.party.rest();
    this.messageLog?.addSystemMessage('Party rests and recovers some health and mana');

    const result = this.movementHandler.handleMovement('forward');
    if (result.triggered === 'combat') {
      DebugLogger.debug('DungeonInputHandler', 'Encounter triggered while resting');
    }
  }

  private toggleCombat(): void {
    this.gameState.combatEnabled = !this.gameState.combatEnabled;

    if (this.gameState.combatEnabled) {
      this.messageLog?.addSystemMessage('Combat encounters ENABLED');
    } else {
      this.messageLog?.addWarningMessage('Combat encounters DISABLED (testing mode)');
    }
  }

  private triggerCombat(): void {
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentFloor) {
      this.messageLog?.addWarningMessage('No dungeon data - cannot trigger combat');
      return;
    }

    this.messageLog?.addSystemMessage('Forcing encounter...');
    this.gameState.inCombat = true;
    this.sceneManager.switchTo('combat');
  }

  private toggleMap(): void {
    if (!this.context.dungeonMapView) {
      DebugLogger.warn('DungeonInputHandler', 'No map view available');
      return;
    }

    this.context.dungeonMapView.toggle();

    if (this.context.dungeonMapView.getIsVisible()) {
      this.messageLog?.addSystemMessage('Map opened');
    } else {
      this.messageLog?.addSystemMessage('Map closed');
    }
  }

  private switchToDebugScene(): void {
    DebugLogger.debug('DungeonInputHandler', 'Switching to debug scene');
    const debugScene = this.sceneManager.getScene('debug') as any;
    if (debugScene && debugScene.setPreviousScene) {
      debugScene.setPreviousScene('dungeon');
    }
    this.sceneManager.switchTo('debug');
  }

  private handleCastleStairsInput(key: string): boolean {
    if (key === 'y') {
      this.sceneManager.switchTo('town');
      return true;
    } else if (key === 'n') {
      this.context.isAwaitingCastleStairsResponse = false;
      this.messageLog?.addSystemMessage('You remain in the castle.');
      return true;
    }
    return false;
  }

  private checkForCastleReturn(): void {
    const castleStairsPos = this.movementHandler.getCastleStairsPosition();
    if (castleStairsPos &&
        this.gameState.party.x === castleStairsPos.x &&
        this.gameState.party.y === castleStairsPos.y &&
        this.gameState.currentFloor === 0) {
      this.context.isAwaitingCastleStairsResponse = true;
      this.messageLog?.addSystemMessage('Return to town? (Y/N)');
    }
  }
}