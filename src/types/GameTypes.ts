import { SpellData } from './SpellTypes';
import { ActiveStatusEffect } from './StatusEffectTypes';
import { ActiveModifier } from '../systems/ModifierSystem';

export type CharacterClass =
  | 'Fighter'
  | 'Mage'
  | 'Priest'
  | 'Thief'
  | 'Bishop'
  | 'Samurai'
  | 'Lord'
  | 'Ninja'
  | 'Alchemist'
  | 'Bard'
  | 'Ranger'
  | 'Psionic'
  | 'Valkyrie'
  | 'Monk';
export type CharacterRace = 'Human' | 'Elf' | 'Dwarf' | 'Gnome' | 'Hobbit' | 'Faerie' | 'Lizman' | 'Dracon' | 'Rawulf' | 'Mook' | 'Felpurr';
export type CharacterAlignment = 'Good' | 'Neutral' | 'Evil';
export type CharacterStatus =
  | 'OK'
  | 'Dead'
  | 'Ashed'
  | 'Lost'
  | 'Paralyzed'
  | 'Stoned'
  | 'Poisoned'
  | 'Sleeping'
  | 'Silenced'
  | 'Blinded'
  | 'Confused'
  | 'Afraid'
  | 'Charmed'
  | 'Berserk'
  | 'Blessed'
  | 'Cursed';

export interface CharacterStats {
  strength: number;
  intelligence: number;
  piety: number;
  vitality: number;
  agility: number;
  luck: number;
}

export interface ICharacter {
  id: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  alignment: CharacterAlignment;
  gender: 'male' | 'female';
  level: number;
  experience: number;
  experienceModifier: number;
  pendingLevelUp: boolean;
  stats: CharacterStats;
  baseStats: CharacterStats;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  ac: number;
  statuses: ActiveStatusEffect[];
  modifiers?: ActiveModifier[];
  age: number;
  gold: number;
  equipment: Equipment;
  inventory: Item[];
  spells: SpellData[];
  knownSpells: string[];
  isDead: boolean;
  deathCount: number;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  shield?: Item;
  helmet?: Item;
  gauntlets?: Item;
  boots?: Item;
  accessory?: Item;
}

export interface Item {
  id: string;
  name: string;
  unidentifiedName?: string; // Display name when unidentified (e.g., "?Sword", "?Armor")
  description?: string; // Optional lore/flavor text for the item
  type:
    | 'weapon'
    | 'armor'
    | 'shield'
    | 'helmet'
    | 'gauntlets'
    | 'boots'
    | 'accessory'
    | 'consumable'
    | 'special';
  value: number;
  weight: number;
  identified: boolean;
  cursed: boolean;
  blessed: boolean; // Blessed items have enhanced properties
  enchantment: number; // +0, +1, +2, etc. (negative for cursed)
  equipped: boolean;
  quantity: number;
  effects?: ItemEffect[];
  classRestrictions?: string[]; // Classes that can use this item (empty = all)
  alignmentRestrictions?: ('Good' | 'Neutral' | 'Evil')[]; // Alignments that can use (empty = all)
  invokable?: boolean; // Can be invoked/used for special effect
  spellId?: string; // Spell cast when invoked
  charges?: number; // Number of uses remaining (for consumables/invokables)
  maxCharges?: number; // Maximum charges for reference
  rarity?: ItemRarity; // Item rarity (assigned at drop time)
  resistances?: CharacterStatus[]; // Status effects this item grants resistance to
  resistanceBonus?: number; // Resistance % bonus per status (default 30 if not specified)
  onHitEffect?: {
    statusType: CharacterStatus;
    chance: number;
    duration?: number;
  };
}

export type ItemEffect =
  | {
      type: 'damage' | 'ac' | 'heal' | 'cure' | 'special';
      value: number;
      target?: never;
    }
  | {
      type: 'stat';
      value: number;
      target: keyof CharacterStats;
    }
  | {
      type: 'statusEffect';
      statusType: CharacterStatus;
      chance: number;
      duration: number;
      value?: never;
      target?: never;
    };

export type Spell = SpellData;

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  currentHp?: number;
  isDead?: boolean;
  ac: number;
  attacks: Attack[];
  experience: number;
  gold: number;
  itemDrops: ItemDrop[];
  lootDrops?: LootDrop[]; // New loot system (takes precedence if present)
  resistances: string[];
  weaknesses: string[];
  magicResistance?: number;
  resistance?: number;
  level?: number;
  monsterType?: string;
  sprite?: string;
  statuses?: ActiveStatusEffect[];
  modifiers?: ActiveModifier[];
}

export interface Attack {
  name: string;
  damage: string;
  effect?: string;
  chance: number;
}

export interface ItemDrop {
  itemId: string;
  chance: number;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface LootDrop {
  itemId: string;
  chance: number; // Base drop chance
  minLevel?: number; // Level requirements
  maxLevel?: number;
}

export interface WallProperties {
  locked: boolean;
  open: boolean;
  openMechanism?: 'player' | 'key' | 'lever' | 'event';
  keyId?: string;
  oneWay?: Direction;
  hidden: boolean;
  discovered: boolean;
}

export interface Wall {
  exists: boolean;
  type: 'solid' | 'door' | 'secret' | 'illusory';
  properties: WallProperties | null;
}

export interface SpecialTile {
  type: 'stairs_up' | 'stairs_down' | 'teleporter' | 'trap' | 'switch' | 'treasure' | 'chest' | 'event';
  properties?: {
    locked?: boolean;
    opened?: boolean;
    items?: Item[];
    gold?: number;
    trapType?: string;
    damage?: number;
    statusType?: CharacterStatus;
    statusChance?: number;
    statusDuration?: number;
    oneTime?: boolean;
    eventType?: string;
    message?: string;
    targetX?: number;
    targetY?: number;
    monsters?: any[];
    requiredKeyIds?: string[];
  };
}

export interface DoorPlacement {
  x: number;
  y: number;
  wall: 'north' | 'south' | 'east' | 'west';
  locked: boolean;
  keyId?: string;
}

export interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'large' | 'medium' | 'small' | 'junction';
  doors: DoorPlacement[];
  specialTiles: { x: number; y: number; type: string }[];
}

export interface Edge {
  from: Room;
  to: Room;
  distance: number;
}

export interface Corridor {
  id: string;
  path: { x: number; y: number }[];
  connectsRooms: [string, string];
}

export interface DungeonGenerationConfig {
  width: number;
  height: number;
  seed?: string;
  rooms: {
    large: { count: [number, number]; size: [number, number] };
    medium: { count: [number, number]; size: [number, number] };
    small: { count: [number, number]; size: [number, number] };
  };
  corridors: {
    width: number;
    extraConnections: number;
  };
  doors: {
    perLargeRoom: [number, number];
    perMediumRoom: [number, number];
    perSmallRoom: [number, number];
    lockedPercentage: number;
  };
  specialTiles: {
    teleporterPairs: number;
    trapsPerZone: [number, number];
    switches: number;
    treasureRooms: number;
  };
}

export interface DungeonTile {
  x: number;
  y: number;
  type: 'floor' | 'solid';
  discovered: boolean;
  hasMonster: boolean;
  hasItem: boolean;
  northWall: Wall;
  southWall: Wall;
  eastWall: Wall;
  westWall: Wall;
  special?: SpecialTile;
  encounterZoneId?: string;
  region?: number;
}

export interface Connector {
  x: number;
  y: number;
  regions: Set<number>;
}

export interface DungeonLevel {
  level: number;
  width: number;
  height: number;
  tiles: DungeonTile[][];
  overrideZones: OverrideZone[];
  events: DungeonEvent[];
  startX: number;
  startY: number;
  stairsUp?: { x: number; y: number };
  stairsDown?: { x: number; y: number };
  properties?: {
    isCastle?: boolean;
  };
}

export interface OverrideZone {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type:
    | 'safe'
    | 'boss'
    | 'special_mobs'
    | 'high_frequency'
    | 'low_frequency'
    | 'ambush'
    | 'treasure';
  data?: {
    monsterGroups?: string[];
    encounterRate?: number;
    bossType?: string;
    treasureType?: string;
    description?: string;
  };
}

export type DungeonEventData =
  | { type: 'message'; text: string }
  | { type: 'trap'; damage: number }
  | { type: 'treasure'; gold: number }
  | { type: 'teleport'; x: number; y: number }
  | { type: 'spinner'; rotations: number }
  | { type: 'darkness'; duration: number };

export interface DungeonEvent {
  x: number;
  y: number;
  type: 'message' | 'trap' | 'treasure' | 'teleport' | 'spinner' | 'darkness';
  data: DungeonEventData;
  triggered: boolean;
}

export interface IParty {
  characters: ICharacter[];
  formation: Formation;
  x: number;
  y: number;
  facing: Direction;
  floor: number;
  pooledGold: number;
}

export type Formation = 'front' | 'back';
export type Direction = 'north' | 'south' | 'east' | 'west' | 'forward' | 'backward' | 'left' | 'right';

export interface GameState {
  party: any; // Using any here because Party class has methods that IParty interface doesn't
  dungeon: DungeonLevel[];
  currentFloor: number;
  inCombat: boolean;
  currentEncounter?: Encounter;
  gameTime: number;
  turnCount: number;
  combatEnabled: boolean;
  messageLog?: any; // MessageLog instance that persists across scenes
  hasEnteredDungeon?: boolean; // Track if player has entered dungeon to prevent duplicate messages
  encounterContext?: {
    zoneType: string;
    bossType?: string;
    description?: string;
    monsterGroups?: string[];
  };
  pendingLoot?: Item[]; // Items waiting to be distributed after combat
  combatContext?: {
    monsters: any[];
    floor: number;
    surprised: boolean;
    zoneType?: string;
    monsterGroups?: string[];
    description?: string;
  };
  characterRoster: ICharacter[];
  dungeonSeed?: string;
  playtimeSeconds?: number;
  dungeonEntryTime?: number;
  banterState?: {
    lastTriggerTime: number;
    lastTimeTrigger: number;
    lastPosition: { x: number; y: number } | null;
    stepCount: number;
  };
}

export interface Encounter {
  monsters: Monster[];
  surprise: boolean;
  turnOrder: (ICharacter | Monster)[];
  currentTurn: number;
}
