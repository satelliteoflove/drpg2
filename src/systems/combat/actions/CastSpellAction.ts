import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { Monster } from '../../../types/GameTypes';
import { Character } from '../../../entities/Character';
import { EntityUtils } from '../../../utils/EntityUtils';
import { SpellCastingContext, SpellId, SpellData, SpellEffectType, SpellTargetType } from '../../../types/SpellTypes';
import { GameServices } from '../../../services/GameServices';
import { SFX_CATALOG } from '../../../config/AudioConstants';
import { calculateSpellDelay, INITIATIVE } from '../../../config/InitiativeConstants';
import { SpellEffectCategory, SpellTargetScope } from '../../../types/InitiativeTypes';

export class CastSpellAction implements CombatAction {
  readonly name = 'Cast Spell';

  canExecute(context: CombatActionContext, params: CombatActionParams): boolean {
    if (!params.spellId) return false;

    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) return false;

    const spell = currentUnit.getKnownSpells().find(s => s === params.spellId);
    return spell !== undefined;
  }

  execute(context: CombatActionContext, params: CombatActionParams): CombatActionResult {
    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return { success: false, message: 'Invalid caster', delay: 0 };
    }

    if (!params.spellId) {
      return { success: false, message: 'Invalid spell', delay: 0 };
    }

    const aliveMonsters = context.encounter.monsters.filter((m) => !m.isDead && m.hp > 0);
    const aliveParty = context.party.filter(c => !c.isDead);

    const spell = currentUnit.getKnownSpells().find(s => s === params.spellId);
    if (!spell) {
      return { success: false, message: 'Spell not found', delay: 0 };
    }

    const spellData = context.spellCaster['registry'].getSpellById(params.spellId as SpellId);
    if (!spellData) {
      return { success: false, message: 'Invalid spell', delay: 0 };
    }

    let target: Character | Monster | undefined;

    if (params.target) {
      target = params.target;
    } else if (spellData.targetType === 'self') {
      target = currentUnit;
    } else {
      if (spellData.targetType === 'enemy' && aliveMonsters.length > 0) {
        target = aliveMonsters[0];
      } else if (spellData.targetType === 'ally') {
        target = currentUnit;
      }
    }

    const castingContext: SpellCastingContext = {
      casterId: currentUnit.id,
      caster: currentUnit,
      target: target,
      party: aliveParty,
      enemies: aliveMonsters,
      inCombat: true
    };

    const result = context.spellCaster.castSpell(currentUnit, params.spellId, castingContext);

    context.cleanupDeadUnits();

    const delay = this.calculateSpellDelayFromData(spellData);

    if (result.success) {
      GameServices.getInstance().getAudioManager().playSfx(SFX_CATALOG.COMBAT.SPELL_CAST);
      return {
        success: true,
        message: result.messages.join(' '),
        delay
      };
    } else {
      return {
        success: false,
        message: result.messages[0] || 'Spell failed',
        delay
      };
    }
  }

  getDelay(context: CombatActionContext, params: CombatActionParams): number {
    if (!params.spellId) {
      return INITIATIVE.SPELL_EFFECT_DELAYS.utility;
    }

    const spellData = context.spellCaster['registry'].getSpellById(params.spellId as SpellId);
    if (!spellData) {
      return INITIATIVE.SPELL_EFFECT_DELAYS.utility;
    }

    return this.calculateSpellDelayFromData(spellData);
  }

  private calculateSpellDelayFromData(spellData: SpellData): number {
    const effectCategory = this.mapEffectTypeToCategory(spellData.effects[0]?.type);
    const targetScope = this.mapTargetTypeToScope(spellData.targetType);
    return calculateSpellDelay(effectCategory, targetScope);
  }

  private mapEffectTypeToCategory(effectType: SpellEffectType | undefined): SpellEffectCategory {
    if (!effectType) return 'utility';

    const mapping: Record<SpellEffectType, SpellEffectCategory> = {
      damage: 'damage',
      heal: 'healing',
      buff: 'buff',
      debuff: 'debuff',
      cure: 'status_cure',
      status: 'status_inflict',
      modifier: 'buff',
      instant_death: 'instant_death',
      resurrection: 'resurrection',
      teleport: 'utility',
      utility: 'utility',
      summon: 'utility',
      dispel: 'status_cure',
      special: 'utility'
    };

    return mapping[effectType] ?? 'utility';
  }

  private mapTargetTypeToScope(targetType: SpellTargetType): SpellTargetScope {
    const mapping: Record<SpellTargetType, SpellTargetScope> = {
      self: 'self',
      ally: 'single_ally',
      enemy: 'single_enemy',
      row: 'row',
      group: 'group',
      allAllies: 'all_allies',
      allEnemies: 'all_enemies',
      any: 'single_ally',
      location: 'single_ally',
      dead: 'single_ally'
    };

    return mapping[targetType] ?? 'single_ally';
  }
}
