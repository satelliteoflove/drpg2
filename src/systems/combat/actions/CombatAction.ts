import { Character } from '../../../entities/Character';
import { Encounter, Item, Monster } from '../../../types/GameTypes';
import { SpellCaster } from '../../magic/SpellCaster';
import { StatusEffectSystem } from '../../StatusEffectSystem';
import { ModifierSystem } from '../../ModifierSystem';
import { DamageCalculator } from '../helpers/DamageCalculator';
import { WeaponEffectApplicator } from '../helpers/WeaponEffectApplicator';

export interface CombatActionContext {
  encounter: Encounter;
  party: Character[];
  spellCaster: SpellCaster;
  statusEffectSystem: StatusEffectSystem;
  modifierSystem: ModifierSystem;
  damageCalculator: DamageCalculator;
  weaponEffectApplicator: WeaponEffectApplicator;
  getCurrentUnit: () => Character | Monster | null;
  cleanupDeadUnits: () => void;
  endCombat: (victory: boolean, rewards?: { experience: number; gold: number; items: Item[] }, escaped?: boolean) => void;
}

export interface CombatActionParams {
  targetIndex?: number;
  spellId?: string;
  target?: Character | Monster;
  itemId?: string;
}

export interface CombatActionResult {
  success: boolean;
  message: string;
  delay: number;
  shouldEndCombat?: {
    victory: boolean;
    escaped?: boolean;
    rewards?: { experience: number; gold: number; items: Item[] };
  };
}

export interface CombatAction {
  readonly name: string;
  canExecute(context: CombatActionContext, params: CombatActionParams): boolean;
  execute(context: CombatActionContext, params: CombatActionParams): CombatActionResult;
  getDelay(context: CombatActionContext, params: CombatActionParams): number;
}
