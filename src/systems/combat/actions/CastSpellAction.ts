import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { Monster } from '../../../types/GameTypes';
import { Character } from '../../../entities/Character';
import { EntityUtils } from '../../../utils/EntityUtils';
import { SpellCastingContext, SpellId, SpellData } from '../../../types/SpellTypes';
import { GameServices } from '../../../services/GameServices';
import { SFX_CATALOG } from '../../../config/AudioConstants';
import { calculateSpellChargeTime, INITIATIVE, EFFECT_TYPE_TO_CATEGORY, TARGET_TYPE_TO_SCOPE } from '../../../config/InitiativeConstants';

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

    const delay = this.calculateSpellChargeTimeFromData(spellData);

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
      return INITIATIVE.SPELL_CHARGE_TIMES.utility;
    }

    const spellData = context.spellCaster['registry'].getSpellById(params.spellId as SpellId);
    if (!spellData) {
      return INITIATIVE.SPELL_CHARGE_TIMES.utility;
    }

    return this.calculateSpellChargeTimeFromData(spellData);
  }

  private calculateSpellChargeTimeFromData(spellData: SpellData): number {
    const effectType = spellData.effects[0]?.type;
    const effectCategory = effectType ? EFFECT_TYPE_TO_CATEGORY[effectType] ?? 'utility' : 'utility';
    const targetScope = TARGET_TYPE_TO_SCOPE[spellData.targetType] ?? 'single_ally';
    return calculateSpellChargeTime(effectCategory, targetScope);
  }
}
