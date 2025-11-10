import { GameState, Direction } from '../../types/GameTypes';
import { KEY_BINDINGS } from '../../config/KeyBindings';
import { DebugLogger } from '../../utils/DebugLogger';
import { DungeonMovementHandler, MovementResult } from './DungeonMovementHandler';
import { DungeonItemPickupUI } from './DungeonItemPickupUI';
import { SceneManager } from '../../core/Scene';
import { SaveManager } from '../../utils/SaveManager';

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

  public getIsAwaitingResponse(): boolean {
    return this.context.isAwaitingCastleStairsResponse || false;
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

    const movement = KEY_BINDINGS.movement;

    if (key === movement.up || key === movement.alternateUp) {
      direction = 'forward';
    } else if (key === movement.down || key === movement.alternateDown) {
      direction = 'backward';
    } else if (key === movement.left || key === movement.alternateLeft) {
      direction = 'left';
      isTurn = true;
    } else if (key === movement.right || key === movement.alternateRight) {
      direction = 'right';
      isTurn = true;
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
      }
    }
  }

  private handleActionInput(key: string): boolean {
    if (key === 'enter' || key === ' ') {
      this.handleInteraction();
      return true;
    }

    if (key === KEY_BINDINGS.dungeonActions.camp) {
      this.sceneManager.switchTo('camp');
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

  private handleSceneSwitch(_key: string): boolean {
    return false;
  }

  private handleInteraction(): void {
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentFloor) return;

    const currentTile = currentFloor.tiles[this.gameState.party.y][this.gameState.party.x];
    if (!currentTile) return;

    const doorWall = this.getDoorInFront(currentTile);
    if (doorWall) {
      this.passThroughDoor(currentTile, doorWall);
      return;
    }

    if (!currentTile.special) {
      this.messageLog?.addSystemMessage('Nothing to interact with here.');
      return;
    }

    switch (currentTile.special.type) {
      case 'stairs_up':
        if (this.gameState.currentFloor === 1) {
          this.messageLog?.addSystemMessage('You are at the castle entrance. Do you want to return to town? (Y/N)');
          this.context.isAwaitingCastleStairsResponse = true;
        } else if (this.gameState.currentFloor > 1) {
          SaveManager.saveGame(this.gameState, this.gameState.playtimeSeconds || 0);
          this.movementHandler.handleStairsUp();
        } else {
          this.messageLog?.addSystemMessage("You're already on the top floor!");
        }
        break;

      case 'stairs_down':
        if (this.gameState.currentFloor < this.gameState.dungeon.length) {
          if (currentTile.special.properties?.locked && currentTile.special.properties?.requiredKeyIds) {
            const requiredKeys = currentTile.special.properties.requiredKeyIds;
            if (!this.hasRequiredKeys(requiredKeys)) {
              const keyNames = requiredKeys.map(id => this.getKeyDisplayName(id)).join(', ');
              this.messageLog?.addSystemMessage(`The stairs are locked. You need: ${keyNames}`);
              return;
            }

            this.consumeKeysFromParty(requiredKeys);
            currentTile.special.properties.locked = false;
            this.messageLog?.addSystemMessage('You unlock the stairs and descend...');
          }

          SaveManager.saveGame(this.gameState, this.gameState.playtimeSeconds || 0);
          this.movementHandler.handleStairsDown();
        } else {
          this.messageLog?.addSystemMessage("You're already on the bottom floor!");
        }
        break;

      case 'chest':
        if (!currentTile.special.properties?.opened) {
          this.openChest(currentTile);
        } else {
          this.messageLog?.addSystemMessage('The chest has already been opened.');
        }
        break;

      default:
        this.messageLog?.addSystemMessage('Nothing to interact with here.');
    }
  }

  private openChest(tile: any): void {
    const items = tile.special?.properties?.items || [];
    const gold = tile.special?.properties?.gold || 0;

    if (gold > 0) {
      this.gameState.party.pooledGold += gold;
      this.messageLog?.addSystemMessage(`Found ${gold} gold!`);
    }

    if (items.length > 0) {
      this.itemPickupUI.startItemPickup(items);
    }

    if (tile.special) {
      tile.special.properties = { ...tile.special.properties, opened: true };
    }
  }

  private getDoorInFront(currentTile: any): 'north' | 'south' | 'east' | 'west' | null {
    const facing = this.gameState.party.facing;

    switch (facing) {
      case 'north':
        if (currentTile.northWall?.type === 'door') return 'north';
        break;
      case 'south':
        if (currentTile.southWall?.type === 'door') return 'south';
        break;
      case 'east':
        if (currentTile.eastWall?.type === 'door') return 'east';
        break;
      case 'west':
        if (currentTile.westWall?.type === 'door') return 'west';
        break;
    }

    return null;
  }

  private passThroughDoor(currentTile: any, direction: 'north' | 'south' | 'east' | 'west'): void {
    let wall;
    switch (direction) {
      case 'north':
        wall = currentTile.northWall;
        break;
      case 'south':
        wall = currentTile.southWall;
        break;
      case 'east':
        wall = currentTile.eastWall;
        break;
      case 'west':
        wall = currentTile.westWall;
        break;
    }

    if (!wall || wall.type !== 'door' || !wall.properties) return;

    if (wall.properties.locked) {
      this.messageLog?.addSystemMessage('The door is locked.');
      return;
    }

    const openMechanism = wall.properties.openMechanism || 'player';

    if (openMechanism === 'lever' || openMechanism === 'event') {
      if (!wall.properties.open) {
        this.messageLog?.addSystemMessage('The door won\'t budge.');
        return;
      }
    }

    const absoluteDirection = direction;
    this.movementHandler.handleDoorPassage(absoluteDirection);
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
    const normalizedKey = key.toLowerCase();
    if (normalizedKey === 'y') {
      this.context.isAwaitingCastleStairsResponse = false;
      SaveManager.saveGame(this.gameState, this.gameState.playtimeSeconds || 0);
      // Reset the movement handler's last position so the prompt can be triggered again
      this.movementHandler.resetLastTileEventPosition();
      this.sceneManager.switchTo('town');
      return true;
    } else if (normalizedKey === 'n') {
      this.context.isAwaitingCastleStairsResponse = false;
      // Reset so player can trigger the prompt again
      this.movementHandler.resetLastTileEventPosition();
      this.messageLog?.addSystemMessage('You remain in the dungeon.');
      return true;
    }
    return false;
  }

  private hasRequiredKeys(requiredKeyIds: string[]): boolean {
    for (const keyId of requiredKeyIds) {
      if (!this.findKeyInParty(keyId)) {
        return false;
      }
    }
    return true;
  }

  private findKeyInParty(keyId: string): boolean {
    const party = this.gameState.party;
    for (const character of party.characters) {
      const hasKey = character.inventory.some((item: any) => item.id === keyId);
      if (hasKey) return true;
    }
    return false;
  }

  private consumeKeysFromParty(requiredKeyIds: string[]): void {
    const party = this.gameState.party;
    for (const keyId of requiredKeyIds) {
      let consumed = false;
      for (const character of party.characters) {
        if (consumed) break;
        const keyIndex = character.inventory.findIndex((item: any) => item.id === keyId);
        if (keyIndex !== -1) {
          character.inventory.splice(keyIndex, 1);
          consumed = true;
        }
      }
    }
  }

  private getKeyDisplayName(keyId: string): string {
    const parts = keyId.split('_');
    if (parts.length >= 2) {
      const type = parts[0];
      if (type === 'bronze') return 'Bronze Key';
      if (type === 'silver') return 'Silver Key';
      if (type === 'gold') return 'Gold Key';
    }
    return 'Key';
  }

}