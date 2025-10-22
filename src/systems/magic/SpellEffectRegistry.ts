import { SpellEffectProcessor, EffectResult, EffectTarget } from './SpellEffectProcessor';
import { Character } from '../../entities/Character';
import { SpellData, SpellCastingContext, SpellEffect } from '../../types/SpellTypes';
import { SpellEffectConfig } from '../../data/spells/SpellEffectTypes';
import { DamageEffect } from './effects/DamageEffect';
import { HealingEffect } from './effects/HealingEffect';
import { StatusEffect } from './effects/StatusEffect';
import { ModifierEffect } from './effects/ModifierEffect';
import { CureEffect } from './effects/CureEffect';
import { BuffEffect } from './effects/BuffEffect';
import { DebuffEffect } from './effects/DebuffEffect';
import { DebugLogger } from '../../utils/DebugLogger';

export type SpellEffectType =
  | 'damage'
  | 'heal'
  | 'status'
  | 'modifier'
  | 'debuff'
  | 'buff'
  | 'cure'
  | 'instant_death'
  | 'resurrection'
  | 'teleport'
  | 'utility'
  | 'dispel'
  | 'special';

export class SpellEffectRegistry {
  private static instance: SpellEffectRegistry;
  private processors: Map<SpellEffectType, SpellEffectProcessor>;
  private defaultProcessor?: SpellEffectProcessor;

  private constructor() {
    this.processors = new Map();
    this.initializeProcessors();
  }

  public static getInstance(): SpellEffectRegistry {
    if (!SpellEffectRegistry.instance) {
      SpellEffectRegistry.instance = new SpellEffectRegistry();
    }
    return SpellEffectRegistry.instance;
  }

  private initializeProcessors(): void {
    this.registerProcessor('damage', new DamageEffect());
    this.registerProcessor('heal', new HealingEffect());
    this.registerProcessor('status', new StatusEffect());
    this.registerProcessor('modifier', new ModifierEffect());
    this.registerProcessor('cure', new CureEffect());
    this.registerProcessor('buff', new BuffEffect());
    this.registerProcessor('debuff', new DebuffEffect());

    DebugLogger.info('SpellEffectRegistry', `Initialized with ${this.processors.size} effect processors`);
  }

  public registerProcessor(type: SpellEffectType, processor: SpellEffectProcessor): void {
    if (this.processors.has(type)) {
      DebugLogger.warn('SpellEffectRegistry', `Overwriting existing processor for type: ${type}`);
    }
    this.processors.set(type, processor);
    DebugLogger.debug('SpellEffectRegistry', `Registered processor for effect type: ${type}`);
  }

  public setDefaultProcessor(processor: SpellEffectProcessor): void {
    this.defaultProcessor = processor;
  }

  public getProcessor(type: string): SpellEffectProcessor | undefined {
    const processor = this.processors.get(type as SpellEffectType);

    if (!processor) {
      DebugLogger.warn('SpellEffectRegistry', `No processor registered for effect type: ${type}`);
      return this.defaultProcessor;
    }

    return processor;
  }

  public hasProcessor(type: string): boolean {
    return this.processors.has(type as SpellEffectType);
  }

  public processEffect(
    caster: Character,
    spell: SpellData,
    effect: SpellEffect | SpellEffectConfig,
    targets: EffectTarget[],
    context: SpellCastingContext
  ): EffectResult | undefined {
    const processor = this.getProcessor(effect.type);

    if (!processor) {
      return {
        success: false,
        targets: [],
        messages: [`No processor available for effect type: ${effect.type}`]
      };
    }

    try {
      return processor.processEffect(caster, spell, effect, targets, context);
    } catch (error) {
      DebugLogger.error('SpellEffectRegistry', `Error processing effect: ${error}`, 'processEffect');
      return {
        success: false,
        targets: [],
        messages: [`Failed to process ${effect.type} effect: ${error}`]
      };
    }
  }

  public getRegisteredTypes(): SpellEffectType[] {
    return Array.from(this.processors.keys());
  }

  public clearProcessors(): void {
    this.processors.clear();
    DebugLogger.info('SpellEffectRegistry', 'All effect processors cleared');
  }
}