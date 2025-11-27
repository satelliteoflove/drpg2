import { ICharacter } from '../types/GameTypes';
import { DebugLogger } from '../utils/DebugLogger';

export type ModifierStat = 'evasion' | 'damageReduction' | 'attack' | 'damage' | 'speed';

export interface ActiveModifier {
  stat: ModifierStat;
  value: number;
  source: string;
  turnsRemaining?: number;
  casterLevel?: number;
  power?: number;
  countsOnlyInCombat?: boolean;
}

export interface ModifierApplicationOptions {
  duration?: number;
  source?: string;
  casterLevel?: number;
  power?: number;
  countsOnlyInCombat?: boolean;
}

export type ModifierContext = 'combat' | 'exploration' | 'town';

export class ModifierSystem {
  private static instance: ModifierSystem;

  constructor() {}

  public static getInstance(): ModifierSystem {
    if (!ModifierSystem.instance) {
      ModifierSystem.instance = new ModifierSystem();
    }
    return ModifierSystem.instance;
  }

  public applyModifier(
    target: ICharacter,
    stat: ModifierStat,
    value: number,
    options: ModifierApplicationOptions = {}
  ): boolean {
    if (!target.modifiers) {
      target.modifiers = [];
    }

    const modifier: ActiveModifier = {
      stat,
      value,
      source: options.source || 'unknown',
      turnsRemaining: options.duration,
      casterLevel: options.casterLevel,
      power: options.power,
      countsOnlyInCombat: options.countsOnlyInCombat
    };

    target.modifiers.push(modifier);

    DebugLogger.info('ModifierSystem', `Applied ${stat} modifier (${value > 0 ? '+' : ''}${value}) to ${target.name}`, { modifier });

    return true;
  }

  public removeModifier(target: ICharacter, stat: ModifierStat, source?: string): number {
    if (!target.modifiers) {
      target.modifiers = [];
      return 0;
    }

    const initialLength = target.modifiers.length;

    if (source) {
      target.modifiers = target.modifiers.filter(m => !(m.stat === stat && m.source === source));
    } else {
      target.modifiers = target.modifiers.filter(m => m.stat !== stat);
    }

    const removedCount = initialLength - target.modifiers.length;

    if (removedCount > 0) {
      const sourceInfo = source ? ` from source: ${source}` : '';
      DebugLogger.info('ModifierSystem', `Removed ${removedCount} ${stat} modifier(s) from ${target.name}${sourceInfo}`);
    }

    return removedCount;
  }

  public removeAllModifiers(target: ICharacter, source?: string): number {
    if (!target.modifiers) {
      target.modifiers = [];
      return 0;
    }

    const initialLength = target.modifiers.length;

    if (source) {
      target.modifiers = target.modifiers.filter(m => m.source !== source);
    } else {
      target.modifiers = [];
    }

    const removedCount = initialLength - target.modifiers.length;

    if (removedCount > 0) {
      const sourceInfo = source ? ` from source: ${source}` : '';
      DebugLogger.info('ModifierSystem', `Removed ${removedCount} modifier(s) from ${target.name}${sourceInfo}`);
    }

    return removedCount;
  }

  public getModifiers(target: ICharacter, stat: ModifierStat): ActiveModifier[] {
    if (!target.modifiers) {
      return [];
    }
    return target.modifiers.filter(m => m.stat === stat);
  }

  public getTotalModifier(target: ICharacter, stat: ModifierStat): number {
    if (!target.modifiers) {
      return 0;
    }

    return target.modifiers
      .filter(m => m.stat === stat)
      .reduce((sum, m) => sum + m.value, 0);
  }

  public tick(target: ICharacter, context: ModifierContext): void {
    if (!target.modifiers) {
      target.modifiers = [];
      return;
    }

    for (let i = target.modifiers.length - 1; i >= 0; i--) {
      const modifier = target.modifiers[i];

      if (modifier.turnsRemaining !== undefined) {
        if (modifier.countsOnlyInCombat && context !== 'combat') {
          continue;
        }

        modifier.turnsRemaining--;

        if (modifier.turnsRemaining <= 0) {
          target.modifiers.splice(i, 1);
          DebugLogger.info('ModifierSystem', `${modifier.stat} modifier from ${modifier.source} expired on ${target.name}`);
        }
      }
    }
  }

  public clearExpiredModifiers(target: ICharacter): void {
    if (!target.modifiers) {
      target.modifiers = [];
      return;
    }

    const initialLength = target.modifiers.length;
    target.modifiers = target.modifiers.filter(m =>
      m.turnsRemaining === undefined || m.turnsRemaining > 0
    );

    const removedCount = initialLength - target.modifiers.length;
    if (removedCount > 0) {
      DebugLogger.info('ModifierSystem', `Cleared ${removedCount} expired modifier(s) from ${target.name}`);
    }
  }
}
