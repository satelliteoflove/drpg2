import { CombatAction, CombatActionContext, CombatActionParams } from './CombatAction';
import { AttackAction } from './AttackAction';
import { CastSpellAction } from './CastSpellAction';
import { DefendAction } from './DefendAction';
import { UseItemAction } from './UseItemAction';
import { EscapeAction } from './EscapeAction';

export class CombatActionRegistry {
  private actions = new Map<string, CombatAction>();

  constructor() {
    this.registerDefaultActions();
  }

  private registerDefaultActions(): void {
    this.register(new AttackAction());
    this.register(new CastSpellAction());
    this.register(new DefendAction());
    this.register(new UseItemAction());
    this.register(new EscapeAction());
  }

  register(action: CombatAction): void {
    this.actions.set(action.name, action);
  }

  get(actionName: string): CombatAction | undefined {
    return this.actions.get(actionName);
  }

  getAvailableActions(context: CombatActionContext, params: CombatActionParams = {}): CombatAction[] {
    return Array.from(this.actions.values()).filter(action =>
      action.canExecute(context, params)
    );
  }

  getAllActionNames(): string[] {
    return Array.from(this.actions.keys());
  }
}
