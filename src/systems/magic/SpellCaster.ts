import { Character } from '../../entities/Character';
import {
  SpellData,
  SpellCastingContext,
  SpellCastResult,
  SpellId
} from '../../types/SpellTypes';
import { SpellRegistry } from './SpellRegistry';
import { SpellEffectRegistry } from './SpellEffectRegistry';
import { SpellValidation } from './SpellValidation';
import { GAME_CONFIG } from '../../config/GameConstants';
import { EffectTarget } from './SpellEffectProcessor';
import { DamageEffect } from './effects/DamageEffect';
import { HealingEffect } from './effects/HealingEffect';
import { DebugLogger } from '../../utils/DebugLogger';

export class SpellCaster {
  private static instance: SpellCaster;
  private registry: SpellRegistry;
  private effectRegistry: SpellEffectRegistry;
  private validation: SpellValidation;

  private damageProcessor: DamageEffect;
  private healingProcessor: HealingEffect;

  private constructor() {
    this.registry = SpellRegistry.getInstance();
    this.effectRegistry = SpellEffectRegistry.getInstance();
    this.validation = new SpellValidation();
    this.damageProcessor = new DamageEffect();
    this.healingProcessor = new HealingEffect();
  }

  static getInstance(): SpellCaster {
    if (!SpellCaster.instance) {
      SpellCaster.instance = new SpellCaster();
    }
    return SpellCaster.instance;
  }

  castSpell(
    caster: Character,
    spellId: string,
    context: SpellCastingContext
  ): SpellCastResult {
    const spell = this.registry.getSpellById(spellId as SpellId);
    if (!spell) {
      return {
        success: false,
        messages: ['Spell not found'],
        mpConsumed: 0
      };
    }

    const validation = this.validation.validateCasting(caster, spell, context);
    if (!validation.canCast) {
      return {
        success: false,
        messages: [validation.reason || 'Cannot cast spell'],
        mpConsumed: 0
      };
    }

    const fizzled = this.checkFizzle(caster, spell, context);
    if (fizzled) {
      this.consumeMP(caster, spell.mpCost);
      return {
        success: false,
        fizzled: true,
        messages: [`${caster.name}'s ${spell.name} fizzled!`],
        mpConsumed: spell.mpCost
      };
    }

    this.consumeMP(caster, spell.mpCost);

    const result: SpellCastResult = {
      success: true,
      messages: [`${caster.name} casts ${spell.name}!`],
      mpConsumed: spell.mpCost
    };

    const targets = this.getTargets(spell, context);

    for (const effect of spell.effects) {
      const effectResult = this.effectRegistry.processEffect(
        caster,
        spell,
        effect,
        targets,
        context
      );

      if (effectResult) {
        result.success = result.success && effectResult.success;
        result.messages.push(...effectResult.messages);

        if (effectResult.targets) {
          for (const targetResult of effectResult.targets) {
            if (targetResult.damage) {
              result.damage = (result.damage || 0) + targetResult.damage;
            }
            if (targetResult.healing) {
              result.healing = (result.healing || 0) + targetResult.healing;
            }
            if (targetResult.statusApplied) {
              if (!result.statusesApplied) result.statusesApplied = [];
              result.statusesApplied.push(targetResult.statusApplied as any);
            }
          }
        }
      } else {
        // Fallback for effects without processors yet
        this.processEffectLegacy(caster, spell, effect, targets, context, result);
      }
    }

    return result;
  }

  private processEffectLegacy(
    caster: Character,
    spell: SpellData,
    effect: any,
    targets: EffectTarget[],
    context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    // Temporary fallback for effects without processors
    DebugLogger.warn('SpellCaster', `Using legacy processing for effect type: ${effect.type}`);

    switch (effect.type) {
      case 'damage':
        this.processDamageEffect(caster, spell, effect, targets, context, result);
        break;
      case 'heal':
        this.processHealEffect(caster, spell, effect, targets, context, result);
        break;
      case 'status':
      case 'debuff':
        this.processStatusEffect(caster, effect, context, result);
        break;
      case 'buff':
        this.processBuffEffect(caster, effect, context, result);
        break;
      case 'cure':
        this.processCureEffect(caster, effect, context, result);
        break;
      case 'instant_death':
        this.processInstantDeathEffect(caster, effect, context, result);
        break;
      case 'resurrection':
        this.processResurrectionEffect(caster, effect, context, result);
        break;
      case 'teleport':
        this.processTeleportEffect(caster, effect, context, result);
        break;
      case 'utility':
        this.processUtilityEffect(caster, effect, context, result);
        break;
      case 'dispel':
        this.processDispelEffect(caster, effect, context, result);
        break;
      case 'special':
        this.processSpecialEffect(caster, effect, context, result);
        break;
      default:
        result.messages.push(`Unknown effect type: ${effect.type}`);
    }
  }

  private checkFizzle(
    caster: Character,
    spell: SpellData,
    context: SpellCastingContext
  ): boolean {
    if ((window as any).testMode) {
      return false;
    }

    // Allow tests to disable fizzle for deterministic testing
    if (GAME_CONFIG.MAGIC.TEST_MODE.DISABLE_FIZZLE) {
      return false;
    }

    if (context.antiMagicZone) {
      return Math.random() < 0.75;
    }

    if (context.fizzleField) {
      return Math.random() < 0.5;
    }

    const fizzleChance = this.registry.calculateFizzleChance(caster, spell);
    return Math.random() * 100 < fizzleChance;
  }

  private consumeMP(caster: Character, amount: number): void {
    caster.mp = Math.max(0, caster.mp - amount);
  }

  private processDamageEffect(
    caster: Character,
    spell: SpellData,
    effect: any,
    targets: EffectTarget[],
    context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    const effectResult = this.damageProcessor.processEffect(caster, spell, effect, targets, context);
    result.messages.push(...effectResult.messages);
  }

  private processHealEffect(
    caster: Character,
    spell: SpellData,
    effect: any,
    targets: EffectTarget[],
    context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    const effectResult = this.healingProcessor.processEffect(caster, spell, effect, targets, context);
    result.messages.push(...effectResult.messages);
  }

  private processStatusEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Status effect not yet implemented');
  }

  private processBuffEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Buff effect not yet implemented');
  }

  private processCureEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Cure effect not yet implemented');
  }

  private processInstantDeathEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Instant death effect not yet implemented');
  }

  private processResurrectionEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Resurrection effect not yet implemented');
  }

  private processTeleportEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Teleport effect not yet implemented');
  }

  private processUtilityEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Utility effect not yet implemented');
  }

  private processDispelEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Dispel effect not yet implemented');
  }

  private processSpecialEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Special effect not yet implemented');
  }

  calculateSpellPower(caster: Character, _spell: SpellData): number {
    const basePower = 100;
    const levelBonus = caster.getLevel() * 5;
    const intBonus = Math.max(0, caster.getStats().intelligence - 10) * 3;

    const classBonus = this.getClassSpellPowerBonus(caster.getClass());

    return basePower + levelBonus + intBonus + classBonus;
  }

  private getClassSpellPowerBonus(characterClass: string): number {
    const pureCasters = ['Mage', 'Priest', 'Alchemist', 'Psionic'];
    const hybridCasters = ['Bishop', 'Ranger', 'Bard', 'Lord', 'Valkyrie', 'Monk', 'Samurai'];

    if (pureCasters.includes(characterClass)) {
      return 20;
    } else if (hybridCasters.includes(characterClass)) {
      return 10;
    }
    return 0;
  }

  checkCritical(caster: Character, spell: SpellData): boolean {
    const baseCritChance = spell.criticalChance || 5;
    const luckBonus = Math.max(0, caster.getStats().luck - 10) * 0.5;

    return Math.random() * 100 < (baseCritChance + luckBonus);
  }

  checkResistance(target: Character, saveType: string, saveModifier: number = 0): boolean {
    const { SavingThrowCalculator } = require('../../utils/SavingThrowCalculator');
    return SavingThrowCalculator.checkResistance(target, saveType, saveModifier);
  }

  getTargetIds(context: SpellCastingContext): string[] {
    if (typeof context.targetId === 'string') {
      return [context.targetId];
    } else if (Array.isArray(context.targetId)) {
      return context.targetId;
    }
    return [];
  }

  private getTargets(spell: SpellData, context: SpellCastingContext): EffectTarget[] {
    const targets: EffectTarget[] = [];

    if ((spell.targetType as any) === 'self' || (spell.targetType as any) === 'caster') {
      if (context.caster) {
        targets.push({
          entity: context.caster,
          isAlly: true
        });
      }
    } else if ((spell.targetType as any) === 'party' || spell.targetType === 'allAllies') {
      if (context.party) {
        for (const member of context.party) {
          targets.push({
            entity: member,
            isAlly: true
          });
        }
      }
    } else if ((spell.targetType as any) === 'enemies' || spell.targetType === 'allEnemies') {
      if (context.enemies) {
        for (const enemy of context.enemies) {
          targets.push({
            entity: enemy,
            isAlly: false
          });
        }
      }
    } else if (spell.targetType === 'enemy' || spell.targetType === 'ally') {
      if (context.target) {
        const isAlly = spell.targetType === 'ally' ||
                      (context.party && context.party.includes(context.target as any)) || false;
        targets.push({
          entity: context.target,
          isAlly: isAlly
        });
      }
    } else if ((spell.targetType as any) === 'all' || spell.targetType === 'group') {
      if (context.party) {
        for (const member of context.party) {
          targets.push({
            entity: member,
            isAlly: true
          });
        }
      }
      if (context.enemies) {
        for (const enemy of context.enemies) {
          targets.push({
            entity: enemy,
            isAlly: false
          });
        }
      }
    }

    return targets;
  }
}