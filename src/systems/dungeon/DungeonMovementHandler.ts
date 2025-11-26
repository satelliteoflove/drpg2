import { GameState, DungeonTile, Direction, OverrideZone } from '../../types/GameTypes';
import { GameUtilities } from '../../utils/GameUtilities';
import { DebugLogger } from '../../utils/DebugLogger';
import { SceneManager } from '../../core/Scene';
import { GAME_CONFIG } from '../../config/GameConstants';
import { StatusEffectSystem } from '../StatusEffectSystem';
import { ModifierSystem } from '../ModifierSystem';
import { TurnAnimationController, CardinalDirection } from './TurnAnimationController';
import { LineOfSightCalculator } from '../../utils/LineOfSightCalculator';
import { GameServices } from '../../services/GameServices';
import { BanterEventTracker } from '../../types/BanterTypes';
import { SFX_CATALOG } from '../../config/AudioConstants';

export interface MovementResult {
  moved: boolean;
  blocked: boolean;
  triggered: 'combat' | 'trap' | 'event' | 'stairs' | 'chest' | 'treasure' | 'door' | null;
  message?: string;
}

export class DungeonMovementHandler {
  private static readonly MOVE_DELAY = 100;
  private static readonly ENCOUNTER_CHANCE_BASE = 0.05;
  private static readonly ENCOUNTER_CHANCE_SCALING = 0.02;

  private gameState: GameState;
  private messageLog: any;
  private sceneManager: SceneManager;
  private statusEffectSystem: StatusEffectSystem;
  private modifierSystem: ModifierSystem;
  private lastMoveTime: number = 0;
  private lastTileEventPosition: { x: number; y: number; floor: number } | null = null;
  private lastEncounterPosition: { x: number; y: number; floor: number } | null = null;
  private turnAnimationController: TurnAnimationController;
  private eventTracker: BanterEventTracker | null = null;
  private stepsSinceLastEncounter: number = GAME_CONFIG.ENCOUNTER.COOLDOWN_MIN_STEPS;

  constructor(gameState: GameState, messageLog: any, sceneManager: SceneManager) {
    this.gameState = gameState;
    this.messageLog = messageLog;
    this.sceneManager = sceneManager;
    this.statusEffectSystem = StatusEffectSystem.getInstance();
    this.modifierSystem = ModifierSystem.getInstance();
    this.turnAnimationController = new TurnAnimationController();

    try {
      this.eventTracker = GameServices.getInstance().getBanterEventTracker();
    } catch (e) {
      DebugLogger.warn('DungeonMovementHandler', 'BanterEventTracker not available');
    }
  }

  public getTurnAnimationController(): TurnAnimationController {
    return this.turnAnimationController;
  }

  private checkDarkZoneEntry(_tile: DungeonTile): void {
    if (!this.eventTracker) {
      return;
    }
  }

  public handleMovement(direction: Direction): MovementResult {
    if (this.turnAnimationController.isActive()) {
      return { moved: false, blocked: true, triggered: null };
    }

    const now = Date.now();
    if (now - this.lastMoveTime < DungeonMovementHandler.MOVE_DELAY) {
      return { moved: false, blocked: true, triggered: null };
    }

    const party = this.gameState.party;
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];

    if (!currentFloor || !party) {
      DebugLogger.warn('DungeonMovementHandler', 'No current floor or party available');
      return { moved: false, blocked: true, triggered: null };
    }

    let absoluteDirection: Direction;
    if (direction === 'forward' || direction === 'backward') {
      absoluteDirection = this.getAbsoluteDirection(direction, party.facing);
    } else {
      absoluteDirection = direction;
    }

    const delta = GameUtilities.getMovementDelta(absoluteDirection);
    const newX = party.x + delta.dx;
    const newY = party.y + delta.dy;

    const currentTile = currentFloor.tiles[party.y][party.x];

    const oneWayBlocked = this.isBlockedByOneWayDoor(currentTile, absoluteDirection);
    if (oneWayBlocked) {
      GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.DUNGEON.DOOR_LOCKED);
      this.messageLog?.addSystemMessage('The door only opens from the other side.');
      return { moved: false, blocked: true, triggered: null };
    }

    if (!this.canMoveTo(null, currentTile, absoluteDirection)) {
      this.messageLog?.addSystemMessage('The way is blocked.');
      return { moved: false, blocked: true, triggered: null };
    }

    if (newX < 0 || newX >= currentFloor.width || newY < 0 || newY >= currentFloor.height) {
      this.messageLog?.addSystemMessage('You cannot move in that direction.');
      return { moved: false, blocked: true, triggered: null };
    }

    const targetTile = currentFloor.tiles[newY][newX];

    if (targetTile.type === 'solid') {
      this.messageLog?.addSystemMessage('The way is blocked.');
      return { moved: false, blocked: true, triggered: null };
    }

    const fromPos = { x: party.x, y: party.y };
    const toPos = { x: newX, y: newY };

    this.turnAnimationController.startMove(fromPos, toPos, () => {
      GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.DUNGEON.FOOTSTEP);
      party.x = newX;
      party.y = newY;

      if (party.x < 0 || party.x >= currentFloor.width || party.y < 0 || party.y >= currentFloor.height) {
        DebugLogger.warn('DungeonMovementHandler', `Party moved out of bounds to (${party.x}, ${party.y})! Reverting.`);
        party.x = fromPos.x;
        party.y = fromPos.y;
        this.messageLog?.addSystemMessage('You cannot move in that direction.');
        return;
      }

      this.gameState.turnCount++;
      this.lastMoveTime = Date.now();
      this.stepsSinceLastEncounter++;
      this.tickAllPartyMembers();
      this.updateDiscoveredTiles();

      this.checkDarkZoneEntry(targetTile);

      this.handleTileEffect(targetTile);

      if (this.shouldCheckRandomEncounter(targetTile)) {
        const encountered = this.checkRandomEncounter();
        if (encountered) {
          DebugLogger.debug('DungeonMovementHandler', 'Random encounter triggered after movement');
        }
      }
    });

    return { moved: true, blocked: false, triggered: null };
  }

  public handleTurn(direction: 'left' | 'right'): void {
    const party = this.gameState.party;
    if (!party) return;

    if (this.turnAnimationController.isActive()) {
      return;
    }

    const currentFacing = party.facing;
    const newFacing = this.getNewFacing(currentFacing, direction);

    this.turnAnimationController.startTurn(currentFacing, newFacing, () => {
      party.move(direction);
      this.gameState.turnCount++;
      this.lastMoveTime = Date.now();
      this.tickAllPartyMembers();
      this.updateDiscoveredTiles();
      DebugLogger.debug('DungeonMovementHandler', `Turn complete: ${currentFacing} → ${newFacing}`);
    });

    DebugLogger.debug('DungeonMovementHandler', `Starting turn animation: ${currentFacing} → ${newFacing}`);
  }

  private getNewFacing(current: CardinalDirection, turn: 'left' | 'right'): CardinalDirection {
    const directions: CardinalDirection[] = turn === 'left'
      ? ['north', 'west', 'south', 'east']
      : ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(current);
    return directions[(currentIndex + 1) % 4];
  }

  private tickAllPartyMembers(): void {
    const party = this.gameState.party;
    if (!party || !party.characters) return;

    party.characters.forEach((char: any) => {
      if (!char.isDead) {
        this.statusEffectSystem.tick(char, 'exploration');
        this.modifierSystem.tick(char, 'exploration');
      }
    });
  }

  private isBlockedByOneWayDoor(currentTile: DungeonTile, direction: Direction): boolean {
    switch (direction) {
      case 'north':
        return !!(currentTile.northWall.properties?.oneWay && currentTile.northWall.properties.oneWay === 'south');
      case 'south':
        return !!(currentTile.southWall.properties?.oneWay && currentTile.southWall.properties.oneWay === 'north');
      case 'east':
        return !!(currentTile.eastWall.properties?.oneWay && currentTile.eastWall.properties.oneWay === 'west');
      case 'west':
        return !!(currentTile.westWall.properties?.oneWay && currentTile.westWall.properties.oneWay === 'east');
    }
    return false;
  }

  private canMoveTo(targetTile: DungeonTile | null, currentTile: DungeonTile | null, direction: Direction): boolean {
    if (!currentTile) return targetTile !== null && targetTile.type !== 'solid';

    switch (direction) {
      case 'north':
        if (currentTile.northWall.exists && !currentTile.northWall.properties?.open) return false;
        if (currentTile.northWall.properties?.oneWay && currentTile.northWall.properties.oneWay === 'south') return false;
        break;
      case 'south':
        if (currentTile.southWall.exists && !currentTile.southWall.properties?.open) return false;
        if (currentTile.southWall.properties?.oneWay && currentTile.southWall.properties.oneWay === 'north') return false;
        break;
      case 'east':
        if (currentTile.eastWall.exists && !currentTile.eastWall.properties?.open) return false;
        if (currentTile.eastWall.properties?.oneWay && currentTile.eastWall.properties.oneWay === 'west') return false;
        break;
      case 'west':
        if (currentTile.westWall.exists && !currentTile.westWall.properties?.open) return false;
        if (currentTile.westWall.properties?.oneWay && currentTile.westWall.properties.oneWay === 'east') return false;
        break;
    }

    if (targetTile) {
      return targetTile.type !== 'solid';
    }

    return true;
  }

  private getAbsoluteDirection(relativeDir: 'forward' | 'backward', facing: Direction): Direction {
    // Convert relative direction based on current facing
    if (relativeDir === 'forward') {
      return facing as Direction;
    } else { // backward
      switch (facing) {
        case 'north': return 'south';
        case 'south': return 'north';
        case 'east': return 'west';
        case 'west': return 'east';
        default: return facing as Direction;
      }
    }
  }

  private handleTileEffect(tile: DungeonTile): MovementResult['triggered'] {
    const currentPosition = {
      x: this.gameState.party.x,
      y: this.gameState.party.y,
      floor: this.gameState.currentFloor,
    };

    const isSamePosition = this.lastTileEventPosition &&
      this.lastTileEventPosition.x === currentPosition.x &&
      this.lastTileEventPosition.y === currentPosition.y &&
      this.lastTileEventPosition.floor === currentPosition.floor;

    if (!tile.special) return null;

    switch (tile.special.type) {
      case 'stairs_up':
        if (!isSamePosition) {
          this.messageLog?.addSystemMessage('You found stairs going up. Press ENTER to use them.');
          this.lastTileEventPosition = currentPosition;
        }
        break;

      case 'stairs_down':
        if (!isSamePosition) {
          this.messageLog?.addSystemMessage('You found stairs going down. Press ENTER to use them.');
          this.lastTileEventPosition = currentPosition;
        }
        break;

      case 'chest':
        if (tile.special.properties?.opened) {
          this.messageLog?.addSystemMessage('The chest has already been opened.');
        } else {
          GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.DUNGEON.CHEST_OPEN);
          this.handleChest(tile);
          return 'chest';
        }
        break;

      case 'treasure':
        if (!tile.special.properties?.opened) {
          GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.DUNGEON.ITEM_PICKUP);
          this.handleTreasure(tile);
          return 'treasure';
        }
        break;

      case 'trap':
        if (!isSamePosition) {
          GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.DUNGEON.TRAP_TRIGGER);
          this.handleTrap(tile);
          this.lastTileEventPosition = currentPosition;
          return 'trap';
        }
        break;

      case 'event':
        if (!isSamePosition && tile.special.properties?.eventType) {
          this.handleEvent(tile);
          this.lastTileEventPosition = currentPosition;
          return 'event';
        }
        break;
    }

    return null;
  }

  public handleStairsUp(): void {
    this.gameState.currentFloor--;
    const newFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];

    if (newFloor && newFloor.stairsDown) {
      const stairsX = newFloor.stairsDown.x;
      const stairsY = newFloor.stairsDown.y;

      if (this.isValidPosition(stairsX, stairsY, newFloor)) {
        this.gameState.party.x = stairsX;
        this.gameState.party.y = stairsY;
      } else {
        DebugLogger.error('DungeonMovementHandler', `Invalid stairs position (${stairsX}, ${stairsY}) on floor ${this.gameState.currentFloor}. Using fallback.`);
        const fallback = this.findValidFloorTile(newFloor);
        this.gameState.party.x = fallback.x;
        this.gameState.party.y = fallback.y;
      }
    }

    this.updateDiscoveredTiles();
    this.messageLog?.addSystemMessage(`Ascended to floor ${this.gameState.currentFloor}`);
  }

  public handleStairsDown(): void {
    this.gameState.currentFloor++;
    const newFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];

    if (newFloor.stairsUp) {
      const stairsX = newFloor.stairsUp.x;
      const stairsY = newFloor.stairsUp.y;

      if (this.isValidPosition(stairsX, stairsY, newFloor)) {
        this.gameState.party.x = stairsX;
        this.gameState.party.y = stairsY;
      } else {
        DebugLogger.error('DungeonMovementHandler', `Invalid stairs position (${stairsX}, ${stairsY}) on floor ${this.gameState.currentFloor}. Using fallback.`);
        const fallback = this.findValidFloorTile(newFloor);
        this.gameState.party.x = fallback.x;
        this.gameState.party.y = fallback.y;
      }
    }

    this.updateDiscoveredTiles();
    this.messageLog?.addSystemMessage(`Descended to floor ${this.gameState.currentFloor}`);
  }

  public handleDoorPassage(direction: Direction): void {
    const party = this.gameState.party;
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];

    if (!currentFloor) {
      DebugLogger.warn('DungeonMovementHandler', 'No current floor available');
      return;
    }

    const delta = GameUtilities.getMovementDelta(direction);
    const newX = party.x + delta.dx;
    const newY = party.y + delta.dy;

    if (newX < 0 || newX >= currentFloor.width || newY < 0 || newY >= currentFloor.height) {
      this.messageLog?.addSystemMessage('You cannot move in that direction.');
      return;
    }

    const targetTile = currentFloor.tiles[newY][newX];

    if (targetTile.type === 'solid') {
      this.messageLog?.addSystemMessage('The way is blocked.');
      return;
    }

    const dungeonScene = this.sceneManager.getCurrentScene();
    if (dungeonScene && typeof (dungeonScene as any).setDoorPassageState === 'function') {
      (dungeonScene as any).setDoorPassageState({
        x: party.x,
        y: party.y,
        direction: direction
      });
    }

    const fromPos = { x: party.x, y: party.y };
    const toPos = { x: newX, y: newY };

    this.turnAnimationController.startMove(fromPos, toPos, () => {
      party.x = newX;
      party.y = newY;

      if (dungeonScene && typeof (dungeonScene as any).setDoorPassageState === 'function') {
        (dungeonScene as any).setDoorPassageState(null);
      }

      this.updateDiscoveredTiles();
      this.tickAllPartyMembers();
      this.lastMoveTime = Date.now();

      this.checkForEncounterWithMultiplier(3.0);

      this.handleTileEffect(targetTile);
    });
  }

  private isValidPosition(x: number, y: number, floor: any): boolean {
    if (x < 0 || x >= floor.width || y < 0 || y >= floor.height) {
      return false;
    }
    const tile = floor.tiles[y][x];
    return tile && tile.type !== 'solid';
  }

  private findValidFloorTile(floor: any): { x: number; y: number } {
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        const tile = floor.tiles[y][x];
        if (tile && tile.type === 'floor') {
          return { x, y };
        }
      }
    }
    DebugLogger.warn('DungeonMovementHandler', 'No valid floor tile found, defaulting to (1,1)');
    return { x: 1, y: 1 };
  }

  private handleChest(tile: DungeonTile): void {
    if (!tile.special?.properties) return;

    const items = tile.special.properties.items || [];
    const gold = tile.special.properties.gold || 0;

    if (gold > 0) {
      this.gameState.party.pooledGold += gold;
      this.messageLog?.addSystemMessage(`Found ${gold} gold in the chest!`);
    }

    if (items.length > 0) {
      if (!this.gameState.pendingLoot) {
        this.gameState.pendingLoot = [];
      }
      this.gameState.pendingLoot.push(...items);
      this.messageLog?.addSystemMessage(`Found ${items.length} item(s) in the chest!`);
    }

    tile.special.properties.opened = true;
  }

  private handleTreasure(tile: DungeonTile): void {
    if (!tile.special?.properties) return;

    const items = tile.special.properties.items || [];
    const gold = tile.special.properties.gold || 0;

    if (gold > 0) {
      this.gameState.party.pooledGold += gold;
      this.messageLog?.addSystemMessage(`Found ${gold} gold!`);
    }

    if (items.length > 0) {
      if (!this.gameState.pendingLoot) {
        this.gameState.pendingLoot = [];
      }
      this.gameState.pendingLoot.push(...items);
      const itemName = items[0].name;
      this.messageLog?.addSystemMessage(`Found ${itemName}!`);
    }

    tile.special.properties.opened = true;
    tile.hasItem = false;
  }

  private handleTrap(tile: DungeonTile): void {
    if (!tile.special?.properties) return;

    const trapType = tile.special.properties.trapType || 'spike';
    const damage = tile.special.properties.damage || 5;

    this.messageLog?.addSystemMessage(`A ${trapType} trap springs!`);

    const party = this.gameState.party.getAliveCharacters();
    const victim = party[Math.floor(Math.random() * party.length)];

    if (victim) {
      victim.hp = Math.max(0, victim.hp - damage);
      this.messageLog?.addSystemMessage(`${victim.name} takes ${damage} damage!`);

      if (tile.special.properties.statusType && !victim.isDead) {
        const statusChance = tile.special.properties.statusChance ?? 1.0;
        const roll = Math.random();

        if (roll < statusChance) {
          const applied = this.statusEffectSystem.applyStatusEffect(
            victim,
            tile.special.properties.statusType,
            {
              duration: tile.special.properties.statusDuration,
              source: `${trapType}_trap`,
              ignoreResistance: false
            }
          );

          if (applied) {
            this.messageLog?.addSystemMessage(
              `${victim.name} is afflicted by ${tile.special.properties.statusType}!`
            );
          } else {
            this.messageLog?.addSystemMessage(
              `${victim.name} resisted the ${tile.special.properties.statusType} effect!`
            );
          }
        }
      }

      if (victim.hp <= 0) {
        victim.isDead = true;
        this.messageLog?.addSystemMessage(`${victim.name} has died!`);
      }
    }

    if (tile.special.properties.oneTime) {
      tile.special = undefined;
    }
  }

  private handleEvent(tile: DungeonTile): void {
    if (!tile.special?.properties) return;

    const eventType = tile.special.properties.eventType;

    switch (eventType) {
      case 'message':
        this.messageLog?.addSystemMessage(tile.special.properties.message || 'Something happens...');
        break;

      case 'encounter':
        this.triggerCombat(tile.special.properties.monsters);
        break;

      case 'heal':
        const party = this.gameState.party.getAliveCharacters();
        party.forEach((char: any) => {
          const healAmount = Math.min(10, char.maxHp - char.hp);
          if (healAmount > 0) {
            char.hp += healAmount;
            this.messageLog?.addSystemMessage(`${char.name} recovers ${healAmount} HP.`);
          }
        });
        break;

      case 'teleport':
        const targetX = tile.special.properties.targetX || 0;
        const targetY = tile.special.properties.targetY || 0;
        this.gameState.party.x = targetX;
        this.gameState.party.y = targetY;
        this.messageLog?.addSystemMessage('You are teleported to a new location!');
        break;
    }

    if (tile.special.properties.oneTime) {
      tile.special = undefined;
    }
  }

  private shouldCheckRandomEncounter(tile: DungeonTile): boolean {
    if (!this.gameState.combatEnabled) return false;
    if (tile.type !== 'floor') return false;

    const currentPosition = {
      x: this.gameState.party.x,
      y: this.gameState.party.y,
      floor: this.gameState.currentFloor,
    };

    if (this.lastEncounterPosition &&
        this.lastEncounterPosition.x === currentPosition.x &&
        this.lastEncounterPosition.y === currentPosition.y &&
        this.lastEncounterPosition.floor === currentPosition.floor) {
      return false;
    }

    return true;
  }

  private calculateEncounterRampMultiplier(): number {
    const cooldownMin = GAME_CONFIG.ENCOUNTER.COOLDOWN_MIN_STEPS;
    const rampPercentPerStep = GAME_CONFIG.ENCOUNTER.COOLDOWN_RAMP_PERCENT_PER_STEP;

    if (this.stepsSinceLastEncounter < cooldownMin) {
      return 0;
    }

    const stepsOverCooldown = this.stepsSinceLastEncounter - cooldownMin;
    return Math.min(1.0, (stepsOverCooldown * rampPercentPerStep) / 100);
  }

  private getBaseEncounterChance(zone: OverrideZone | null): number {
    if (zone) {
      return GAME_CONFIG.ENCOUNTER.OVERRIDE_ZONE_RATES[zone.type];
    }
    return DungeonMovementHandler.ENCOUNTER_CHANCE_BASE +
           (this.gameState.currentFloor - 1) * DungeonMovementHandler.ENCOUNTER_CHANCE_SCALING;
  }

  private checkRandomEncounter(): boolean {
    const rampMultiplier = this.calculateEncounterRampMultiplier();

    if (rampMultiplier === 0) {
      DebugLogger.debug('DungeonMovementHandler', `Encounter cooldown active: ${this.stepsSinceLastEncounter}/${GAME_CONFIG.ENCOUNTER.COOLDOWN_MIN_STEPS} steps`);
      return false;
    }

    const zone = this.findZoneAtPosition(this.gameState.party.x, this.gameState.party.y);
    const baseChance = this.getBaseEncounterChance(zone);

    if (baseChance === 0) {
      return false;
    }

    if (zone) {
      DebugLogger.debug('DungeonMovementHandler', `Zone encounter check: ${zone.type} (rate: ${baseChance})`);
    }

    const chance = baseChance * rampMultiplier;

    DebugLogger.debug('DungeonMovementHandler', `Encounter check: steps=${this.stepsSinceLastEncounter}, ramp=${(rampMultiplier * 100).toFixed(0)}%, chance=${(chance * 100).toFixed(1)}%`);

    if (Math.random() < chance) {
      this.triggerCombat(undefined, zone);
      this.lastEncounterPosition = {
        x: this.gameState.party.x,
        y: this.gameState.party.y,
        floor: this.gameState.currentFloor,
      };
      this.stepsSinceLastEncounter = 0;
      return true;
    }

    return false;
  }

  private findZoneAtPosition(x: number, y: number): OverrideZone | null {
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentFloor || !currentFloor.overrideZones) return null;

    for (const zone of currentFloor.overrideZones) {
      if (x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2) {
        return zone;
      }
    }

    return null;
  }

  private checkForEncounterWithMultiplier(multiplier: number): boolean {
    if (!this.gameState.combatEnabled) return false;

    const rampMultiplier = this.calculateEncounterRampMultiplier();

    if (rampMultiplier === 0) {
      DebugLogger.debug('DungeonMovementHandler', `Encounter cooldown active (with multiplier): ${this.stepsSinceLastEncounter}/${GAME_CONFIG.ENCOUNTER.COOLDOWN_MIN_STEPS} steps`);
      return false;
    }

    const zone = this.findZoneAtPosition(this.gameState.party.x, this.gameState.party.y);
    const baseChance = this.getBaseEncounterChance(zone);

    if (baseChance === 0) {
      return false;
    }

    const chance = baseChance * rampMultiplier * multiplier;

    if (Math.random() < chance) {
      this.triggerCombat(undefined, zone);
      this.lastEncounterPosition = {
        x: this.gameState.party.x,
        y: this.gameState.party.y,
        floor: this.gameState.currentFloor,
      };
      this.stepsSinceLastEncounter = 0;
      return true;
    }

    return false;
  }

  private triggerCombat(specificMonsters?: any[], zone?: OverrideZone | null): void {
    DebugLogger.debug('DungeonMovementHandler', 'Triggering combat encounter', {
      zoneType: zone?.type,
      zoneDescription: zone?.data?.description,
    });

    const monsters = specificMonsters || this.generateRandomMonsters(zone);

    this.gameState.combatContext = {
      monsters: monsters,
      floor: this.gameState.currentFloor,
      surprised: Math.random() < GAME_CONFIG.ENCOUNTER.SURPRISE_CHANCE,
      zoneType: zone?.type,
      monsterGroups: zone?.data?.monsterGroups,
      description: zone?.data?.description,
    };

    this.gameState.inCombat = true;
    this.sceneManager.switchTo('combat');
  }

  private generateRandomMonsters(zone?: OverrideZone | null): any[] {
    const floor = this.gameState.currentFloor;

    if (zone?.type === 'boss') {
      return this.generateBossMonsters(floor);
    }

    if (zone?.type === 'special_mobs') {
      return this.generateSpecialMonsters(floor, zone);
    }

    const baseCount = zone?.type === 'high_frequency' ? 2 : 1;
    const monsterCount = baseCount + Math.floor(Math.random() * 3);
    const monsters = [];

    for (let i = 0; i < monsterCount; i++) {
      monsters.push({
        name: `Monster ${i + 1}`,
        hp: 10 + floor * 5,
        maxHp: 10 + floor * 5,
        ac: 10 + Math.floor(floor / 2),
        attacks: [{ damage: `1d${4 + floor}` }],
        xpValue: 10 * floor,
      });
    }

    return monsters;
  }

  private generateBossMonsters(floor: number): any[] {
    const bossHp = 30 + floor * 15;
    return [{
      name: `Floor ${floor} Guardian`,
      hp: bossHp,
      maxHp: bossHp,
      ac: 12 + floor,
      attacks: [
        { damage: `2d${4 + floor}` },
        { damage: `1d${6 + floor}` },
      ],
      xpValue: 50 * floor,
      isBoss: true,
    }];
  }

  private generateSpecialMonsters(floor: number, _zone: OverrideZone): any[] {
    const monsterCount = 2 + Math.floor(Math.random() * 2);
    const monsters = [];
    const specialHpBonus = 5;

    for (let i = 0; i < monsterCount; i++) {
      monsters.push({
        name: `Lair Dweller ${i + 1}`,
        hp: 15 + floor * 5 + specialHpBonus,
        maxHp: 15 + floor * 5 + specialHpBonus,
        ac: 11 + Math.floor(floor / 2),
        attacks: [{ damage: `1d${5 + floor}` }],
        xpValue: 15 * floor,
      });
    }

    return monsters;
  }

  public getCastleStairsPosition(): { x: number; y: number } | null {
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (currentFloor?.properties?.isCastle && currentFloor.stairsUp) {
      return currentFloor.stairsUp;
    }
    return null;
  }

  public updateDiscoveredTiles(): void {
    const currentFloor = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (!currentFloor) return;

    const party = this.gameState.party;
    const viewDistance = GAME_CONFIG.DUNGEON.VIEW_DISTANCE;

    const playerX = party.x + 0.5;
    const playerY = party.y + 0.5;

    const losCalculator = new LineOfSightCalculator(currentFloor);

    for (let dy = -viewDistance; dy <= viewDistance; dy++) {
      for (let dx = -viewDistance; dx <= viewDistance; dx++) {
        const tileX = party.x + dx;
        const tileY = party.y + dy;

        if (tileX >= 0 && tileX < currentFloor.width &&
            tileY >= 0 && tileY < currentFloor.height) {
          const tile = currentFloor.tiles[tileY][tileX];
          if (tile && losCalculator.hasLineOfSight(playerX, playerY, tileX, tileY)) {
            tile.discovered = true;
          }
        }
      }
    }
  }

  public resetLastTileEventPosition(): void {
    this.lastTileEventPosition = null;
  }

  public getEncounterCooldownState(): {
    stepsSinceLastEncounter: number;
    cooldownMin: number;
    rampPercentPerStep: number;
    currentRampPercent: number;
    actualDangerPercent: number;
    encounterReady: boolean;
  } {
    const rampMultiplier = this.calculateEncounterRampMultiplier();
    const zone = this.findZoneAtPosition(this.gameState.party.x, this.gameState.party.y);
    const baseChance = this.getBaseEncounterChance(zone);
    const actualChance = baseChance * rampMultiplier;
    const dangerMax = GAME_CONFIG.ENCOUNTER.DANGER_INDICATOR_MAX;
    const actualDangerPercent = Math.min(100, (actualChance / dangerMax) * 100);

    return {
      stepsSinceLastEncounter: this.stepsSinceLastEncounter,
      cooldownMin: GAME_CONFIG.ENCOUNTER.COOLDOWN_MIN_STEPS,
      rampPercentPerStep: GAME_CONFIG.ENCOUNTER.COOLDOWN_RAMP_PERCENT_PER_STEP,
      currentRampPercent: rampMultiplier * 100,
      actualDangerPercent,
      encounterReady: rampMultiplier > 0,
    };
  }

  public resetEncounterCooldown(): void {
    this.stepsSinceLastEncounter = 0;
    DebugLogger.debug('DungeonMovementHandler', 'Encounter cooldown reset');
  }
}