import { SpellData } from './SpellTypes';

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
  | 'Sleeping';

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
  status: CharacterStatus;
  age: number;
  gold: number;
  equipment: Equipment;
  inventory: Item[];
  spells: SpellData[];
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
}

export interface ItemEffect {
  type: 'damage' | 'ac' | 'stat' | 'heal' | 'cure' | 'special';
  value: number;
  target?: keyof CharacterStats;
}

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

export interface DungeonTile {
  x: number;
  y: number;
  type: 'wall' | 'floor' | 'door' | 'stairs_up' | 'stairs_down' | 'chest' | 'trap' | 'event' | 'solid' | 'corridor';
  discovered: boolean;
  hasMonster: boolean;
  hasItem: boolean;
  northWall: boolean;
  southWall: boolean;
  eastWall: boolean;
  westWall: boolean;
  properties?: {
    locked?: boolean;
    opened?: boolean;
    items?: Item[];
    gold?: number;
    trapType?: string;
    damage?: number;
    oneTime?: boolean;
    eventType?: string;
    message?: string;
    targetX?: number;
    targetY?: number;
    monsters?: any[];
  };
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
  };
  characterRoster: ICharacter[];
}

export interface Encounter {
  monsters: Monster[];
  surprise: boolean;
  canRun: boolean;
  turnOrder: (ICharacter | Monster)[];
  currentTurn: number;
}
