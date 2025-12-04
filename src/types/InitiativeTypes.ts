import { Character } from '../entities/Character';
import { Monster } from './GameTypes';

export type CombatEntity = Character | Monster;

export type EntityState = 'choosing' | 'charging';

export interface ChargeState {
  entityId: string;
  ticksRemaining: number;
  state: EntityState;
}

export interface TurnQueueEntry {
  entityId: string;
  entityName: string;
  isPlayer: boolean;
  ticksRemaining: number;
  isChoosing: boolean;
}

export interface InitiativeSnapshot {
  queue: TurnQueueEntry[];
  choosingEntityId: string | null;
}

export interface GhostSimulationResult {
  position: number;
  finalTicksRemaining: number;
}

export type WeaponSpeedCategory = 'unarmed' | 'light' | 'standard' | 'heavy';

export type SpellEffectCategory =
  | 'damage'
  | 'healing'
  | 'buff'
  | 'debuff'
  | 'status_inflict'
  | 'status_cure'
  | 'instant_death'
  | 'resurrection'
  | 'utility';

export type SpellTargetScope =
  | 'self'
  | 'single_ally'
  | 'single_enemy'
  | 'row'
  | 'group'
  | 'all_allies'
  | 'all_enemies';

export interface CursorMemoryEntry {
  actionIndex: number;
  targetId?: string;
  spellId?: string;
  itemId?: string;
}

export function isCharacter(entity: CombatEntity): entity is Character {
  return 'stats' in entity && 'class' in entity;
}

export function isMonster(entity: CombatEntity): entity is Monster {
  return 'attacks' in entity && !('class' in entity);
}

export function getEntityId(entity: CombatEntity): string {
  return entity.id;
}

export function getEntityName(entity: CombatEntity): string {
  return entity.name;
}

export function getEntityAgility(entity: CombatEntity): number {
  if (isCharacter(entity)) {
    return entity.stats.agility;
  }
  return (entity as Monster).agility ?? 10;
}

export function getEntityLevel(entity: CombatEntity): number {
  if (isCharacter(entity)) {
    return entity.level;
  }
  return (entity as Monster).level ?? 1;
}
