import { Character } from '../../entities/Character';
import {
  SpellData,
  SpellCastingContext,
  SpellCastResult
} from '../../types/SpellTypes';
import { SpellRegistry } from './SpellRegistry';
import { SpellValidation } from './SpellValidation';

export class SpellCaster {
  private static instance: SpellCaster;
  private registry: SpellRegistry;
  private validation: SpellValidation;

  private constructor() {
    this.registry = SpellRegistry.getInstance();
    this.validation = new SpellValidation();
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
    const spell = this.registry.getSpellById(spellId);
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

    for (const effect of spell.effects) {
      switch (effect.type) {
        case 'damage':
          this.processDamageEffect(caster, effect, context, result);
          break;
        case 'heal':
          this.processHealEffect(caster, effect, context, result);
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

    return result;
  }

  private checkFizzle(
    caster: Character,
    spell: SpellData,
    context: SpellCastingContext
  ): boolean {
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
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Damage effect not yet implemented');
  }

  private processHealEffect(
    _caster: Character,
    _effect: any,
    _context: SpellCastingContext,
    result: SpellCastResult
  ): void {
    result.messages.push('Heal effect not yet implemented');
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
    let saveChance = 50;

    switch (saveType) {
      case 'physical':
        saveChance -= Math.max(0, target.getStats().vitality - 10) * 3;
        break;
      case 'mental':
        saveChance -= Math.max(0, target.getStats().intelligence - 10) * 3;
        break;
      case 'magical':
        saveChance -= Math.max(0, target.getStats().piety - 10) * 3;
        break;
      case 'death':
        saveChance -= Math.max(0, target.getStats().vitality - 10) * 2;
        saveChance -= Math.max(0, target.getStats().luck - 10) * 2;
        break;
    }

    saveChance += saveModifier;

    return Math.random() * 100 >= saveChance;
  }

  getTargetIds(context: SpellCastingContext): string[] {
    if (typeof context.targetId === 'string') {
      return [context.targetId];
    } else if (Array.isArray(context.targetId)) {
      return context.targetId;
    }
    return [];
  }
}