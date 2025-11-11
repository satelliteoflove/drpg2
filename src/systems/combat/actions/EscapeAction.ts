import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { EntityUtils } from '../../../utils/EntityUtils';
import { DebugLogger } from '../../../utils/DebugLogger';

export class EscapeAction implements CombatAction {
  readonly name = 'Escape';

  canExecute(context: CombatActionContext, _params: CombatActionParams): boolean {
    return context.encounter !== null;
  }

  execute(context: CombatActionContext, _params: CombatActionParams): CombatActionResult {
    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return { success: false, message: 'Invalid escaper' };
    }

    let escapeChance = 0.5;

    const agilityBonus = (currentUnit.stats.agility - 10) * 0.02;
    escapeChance = Math.max(0.1, Math.min(0.9, escapeChance + agilityBonus));

    const success = Math.random() < escapeChance;

    DebugLogger.info(
      'EscapeAction',
      `${currentUnit.name} attempts escape: ${Math.round(escapeChance * 100)}% chance, ${success ? 'SUCCESS' : 'FAILED'}`
    );

    if (success) {
      return {
        success: true,
        message: `${currentUnit.name} successfully leads the party to safety!`,
        shouldEndCombat: {
          victory: false,
          escaped: true
        }
      };
    } else {
      return {
        success: false,
        message: `${currentUnit.name} could not escape!`
      };
    }
  }
}
