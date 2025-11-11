import { CombatAction, CombatActionContext, CombatActionParams, CombatActionResult } from './CombatAction';
import { EntityUtils } from '../../../utils/EntityUtils';

export class UseItemAction implements CombatAction {
  readonly name = 'Use Item';

  canExecute(context: CombatActionContext, _params: CombatActionParams): boolean {
    const currentUnit = context.getCurrentUnit();
    return currentUnit !== null && EntityUtils.isCharacter(currentUnit);
  }

  execute(context: CombatActionContext, _params: CombatActionParams): CombatActionResult {
    const currentUnit = context.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      return { success: false, message: 'Invalid item user' };
    }

    return {
      success: true,
      message: `${currentUnit.name} uses an item!`
    };
  }
}
