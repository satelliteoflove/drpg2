import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { Monster } from '../../../types/GameTypes';
import { Character } from '../../../entities/Character';
import { EntityUtils } from '../../../utils/EntityUtils';
import { SpellCastingContext, SpellId } from '../../../types/SpellTypes';

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
      return { success: false, message: 'Invalid caster' };
    }

    if (!params.spellId) {
      return { success: false, message: 'Invalid spell' };
    }

    const aliveMonsters = context.encounter.monsters.filter((m) => !m.isDead && m.hp > 0);
    const aliveParty = context.party.filter(c => !c.isDead);

    const spell = currentUnit.getKnownSpells().find(s => s === params.spellId);
    if (!spell) {
      return { success: false, message: 'Spell not found' };
    }

    const spellData = context.spellCaster['registry'].getSpellById(params.spellId as SpellId);
    if (!spellData) {
      return { success: false, message: 'Invalid spell' };
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

    if (result.success) {
      return {
        success: true,
        message: result.messages.join(' ')
      };
    } else {
      return {
        success: false,
        message: result.messages[0] || 'Spell failed'
      };
    }
  }
}
