import { Character } from '../../entities/Character';
import {
  SpellData,
  SpellValidationResult,
  SpellCastingContext
} from '../../types/SpellTypes';
import { SpellRegistry } from './SpellRegistry';

export class SpellValidation {
  private registry: SpellRegistry;

  constructor() {
    this.registry = SpellRegistry.getInstance();
  }

  validateCasting(
    caster: Character,
    spell: SpellData,
    context: SpellCastingContext
  ): SpellValidationResult {
    const basicValidation = this.registry.validateSpellCasting(
      caster,
      spell,
      context.inCombat
    );

    if (!basicValidation.canCast) {
      return basicValidation;
    }

    if (context.antiMagicZone) {
      return {
        canCast: false,
        reason: 'Cannot cast spells in an anti-magic zone'
      };
    }

    const targetValidation = this.validateTarget(spell, context);
    if (!targetValidation.canCast) {
      return targetValidation;
    }

    const rangeValidation = this.validateRange(caster, spell, context);
    if (!rangeValidation.canCast) {
      return rangeValidation;
    }

    const restrictionValidation = this.validateRestrictions(caster, spell, context);
    if (!restrictionValidation.canCast) {
      return restrictionValidation;
    }

    return {
      canCast: true,
      mpRequired: spell.mpCost,
      mpAvailable: caster.getCurrentMP(),
      targetValid: true,
      rangeValid: true
    };
  }

  private validateTarget(
    spell: SpellData,
    context: SpellCastingContext
  ): SpellValidationResult {
    const targetType = spell.targetType;

    switch (targetType) {
      case 'self':
        if (context.targetId && context.targetId !== context.casterId) {
          return {
            canCast: false,
            reason: 'This spell can only target yourself',
            targetValid: false
          };
        }
        break;

      case 'ally':
      case 'enemy':
      case 'dead':
        if (!context.targetId) {
          return {
            canCast: false,
            reason: 'This spell requires a target',
            targetValid: false
          };
        }
        break;

      case 'group':
      case 'allAllies':
      case 'allEnemies':
      case 'row':
        break;

      case 'location':
        if (!context.targetPosition) {
          return {
            canCast: false,
            reason: 'This spell requires a location target',
            targetValid: false
          };
        }
        break;

      case 'any':
        break;

      default:
        return {
          canCast: false,
          reason: `Unknown target type: ${targetType}`,
          targetValid: false
        };
    }

    return { canCast: true, targetValid: true };
  }

  private validateRange(
    _caster: Character,
    spell: SpellData,
    context: SpellCastingContext
  ): SpellValidationResult {
    if (!spell.range) {
      return { canCast: true, rangeValid: true };
    }

    if (spell.range.special === 'self') {
      if (context.targetId && context.targetId !== context.casterId) {
        return {
          canCast: false,
          reason: 'This spell has no range',
          rangeValid: false
        };
      }
      return { canCast: true, rangeValid: true };
    }

    if (spell.range.special === 'unlimited') {
      return { canCast: true, rangeValid: true };
    }

    if (spell.range.special === 'melee') {
      if (!this.isInMeleeRange(context)) {
        return {
          canCast: false,
          reason: 'Target is not in melee range',
          rangeValid: false
        };
      }
      return { canCast: true, rangeValid: true };
    }

    if (spell.range.special === 'touch') {
      if (!this.isAdjacentTarget(context)) {
        return {
          canCast: false,
          reason: 'Target must be adjacent for touch spells',
          rangeValid: false
        };
      }
      return { canCast: true, rangeValid: true };
    }

    if (spell.range.min !== undefined || spell.range.max !== undefined) {
      const distance = this.calculateDistance(context);
      if (distance === null) {
        return { canCast: true, rangeValid: true };
      }

      if (spell.range.min !== undefined && distance < spell.range.min) {
        return {
          canCast: false,
          reason: `Target is too close (minimum range: ${spell.range.min})`,
          rangeValid: false
        };
      }

      if (spell.range.max !== undefined && distance > spell.range.max) {
        return {
          canCast: false,
          reason: `Target is out of range (maximum range: ${spell.range.max})`,
          rangeValid: false
        };
      }
    }

    return { canCast: true, rangeValid: true };
  }

  private validateRestrictions(
    caster: Character,
    spell: SpellData,
    _context: SpellCastingContext
  ): SpellValidationResult {
    if (caster.hasStatusEffect('paralyzed')) {
      return {
        canCast: false,
        reason: 'Cannot cast while paralyzed'
      };
    }

    if (caster.hasStatusEffect('asleep')) {
      return {
        canCast: false,
        reason: 'Cannot cast while asleep'
      };
    }

    if (caster.hasStatusEffect('confused')) {
      const confusedCastChance = 0.25;
      if (Math.random() > confusedCastChance) {
        return {
          canCast: false,
          reason: 'Too confused to cast spells'
        };
      }
    }

    if (caster.hasStatusEffect('afraid')) {
      const afraidCastChance = 0.5;
      if (Math.random() > afraidCastChance) {
        return {
          canCast: false,
          reason: 'Too afraid to cast spells'
        };
      }
    }

    const hasPrerequisites = this.registry.checkPrerequisites(caster, spell);
    if (!hasPrerequisites) {
      return {
        canCast: false,
        reason: 'Missing prerequisite spells'
      };
    }

    return { canCast: true };
  }

  private isInMeleeRange(context: SpellCastingContext): boolean {
    if (!context.inCombat) {
      return true;
    }

    return context.combatRound === undefined || context.combatRound < 2;
  }

  private isAdjacentTarget(context: SpellCastingContext): boolean {
    if (!context.targetPosition) {
      return true;
    }

    const distance = this.calculateDistance(context);
    return distance !== null && distance <= 1;
  }

  private calculateDistance(context: SpellCastingContext): number | null {
    if (!context.targetPosition) {
      return null;
    }

    return Math.abs(context.targetPosition.x) + Math.abs(context.targetPosition.y);
  }

  canTargetDead(spell: SpellData): boolean {
    return spell.targetType === 'dead' ||
           spell.targetType === 'any' ||
           spell.effects.some(e => e.type === 'resurrection');
  }

  canTargetMultiple(spell: SpellData): boolean {
    return ['group', 'allAllies', 'allEnemies', 'row'].includes(spell.targetType);
  }

  needsLineOfSight(spell: SpellData): boolean {
    if (!spell.range) return false;

    if (spell.range.special === 'self' || spell.range.special === 'touch') {
      return false;
    }

    return !spell.tags?.includes('no_los');
  }

  getValidTargets(
    spell: SpellData,
    context: SpellCastingContext,
    availableTargets: Character[]
  ): Character[] {
    const validTargets: Character[] = [];

    for (const target of availableTargets) {
      const mockContext = {
        ...context,
        targetId: target.id
      };

      const validation = this.validateTarget(spell, mockContext);
      const caster = availableTargets.find(c => c.id === context.casterId);
      if (!caster) continue;

      const rangeValidation = this.validateRange(
        caster,
        spell,
        mockContext
      );

      if (validation.canCast && rangeValidation.canCast) {
        if (spell.targetType === 'dead' && !target.isDead) {
          continue;
        }
        if (spell.targetType !== 'dead' && spell.targetType !== 'any' && target.isDead) {
          continue;
        }
        validTargets.push(target);
      }
    }

    return validTargets;
  }

  getTargetingRequirements(spell: SpellData): {
    requiresTarget: boolean;
    multipleTargets: boolean;
    targetsDead: boolean;
    selfOnly: boolean;
  } {
    return {
      requiresTarget: !['self', 'allAllies', 'allEnemies'].includes(spell.targetType),
      multipleTargets: this.canTargetMultiple(spell),
      targetsDead: this.canTargetDead(spell),
      selfOnly: spell.targetType === 'self'
    };
  }
}