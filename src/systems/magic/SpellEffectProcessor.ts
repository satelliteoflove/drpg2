import { Character } from '../../entities/Character';
import { Monster } from '../../types/GameTypes';
import { SpellData, SpellCastingContext, SpellEffect } from '../../types/SpellTypes';
import { SpellEffectConfig } from '../../data/spells/SpellEffectTypes';
import { DiceRoller } from '../../utils/DiceRoller';
import { EntityUtils, CombatEntity } from '../../utils/EntityUtils';
import { SavingThrowCalculator } from '../../utils/SavingThrowCalculator';

export interface EffectTarget {
  entity: Character | Monster;
  isAlly: boolean;
}

export interface EffectResult {
  success: boolean;
  targets: Array<{
    target: EffectTarget;
    damage?: number;
    healing?: number;
    statusApplied?: string;
    buffApplied?: string;
    saved?: boolean;
    immune?: boolean;
    message?: string;
  }>;
  messages: string[];
}

export abstract class SpellEffectProcessor {
  abstract processEffect(
    caster: Character,
    spell: SpellData,
    effect: SpellEffect | SpellEffectConfig,
    targets: EffectTarget[],
    context: SpellCastingContext
  ): EffectResult;

  protected rollDice(formula: string): number {
    return DiceRoller.roll(formula);
  }

  protected evaluateFormula(formula: string, level: number): number {
    return DiceRoller.evaluateFormula(formula, level);
  }

  protected isMonster(entity: CombatEntity): entity is Monster {
    return EntityUtils.isMonster(entity);
  }

  protected isCharacter(entity: CombatEntity): entity is Character {
    return EntityUtils.isCharacter(entity);
  }

  protected getEntityName(entity: CombatEntity): string {
    return EntityUtils.getName(entity);
  }

  protected getEntityHP(entity: CombatEntity): number {
    return EntityUtils.getHP(entity);
  }

  protected getEntityMaxHP(entity: CombatEntity): number {
    return EntityUtils.getMaxHP(entity);
  }

  protected applyDamage(entity: CombatEntity, damage: number): number {
    return EntityUtils.applyDamage(entity, damage);
  }

  protected applyHealing(entity: CombatEntity, healing: number): number {
    return EntityUtils.applyHealing(entity, healing);
  }

  protected getEntityLevel(entity: CombatEntity): number {
    return EntityUtils.getLevel(entity);
  }

  protected getEntityResistance(entity: CombatEntity, element: string): number {
    return EntityUtils.getResistance(entity, element);
  }

  protected checkSavingThrow(entity: CombatEntity, saveType: string, modifier: number = 0): boolean {
    return SavingThrowCalculator.makeSavingThrow(entity, saveType as any, modifier);
  }

  protected calculateSpellPower(caster: Character, spell: SpellData): number {
    const { SpellCaster } = require('../magic/SpellCaster');
    return SpellCaster.getInstance().calculateSpellPower(caster, spell);
  }
}