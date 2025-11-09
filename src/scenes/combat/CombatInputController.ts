import { GameState, Monster } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { CombatSystem } from '../../systems/CombatSystem';
import { CombatStateManager } from './CombatStateManager';
import { CombatUIManager } from './CombatUIManager';
import { SceneManager } from '../../core/Scene';
import { KEY_BINDINGS } from '../../config/KeyBindings';
import { DebugLogger } from '../../utils/DebugLogger';
import { EntityUtils } from '../../utils/EntityUtils';
import { SpellRegistry } from '../../systems/magic/SpellRegistry';
import { SpellId } from '../../types/SpellTypes';

export class CombatInputController {
  private gameState: GameState;
  private combatSystem: CombatSystem;
  private stateManager: CombatStateManager;
  private uiManager: CombatUIManager;
  private sceneManager: SceneManager;
  private messageLog: any;

  constructor(
    gameState: GameState,
    combatSystem: CombatSystem,
    stateManager: CombatStateManager,
    uiManager: CombatUIManager,
    sceneManager: SceneManager
  ) {
    this.gameState = gameState;
    this.combatSystem = combatSystem;
    this.stateManager = stateManager;
    this.uiManager = uiManager;
    this.sceneManager = sceneManager;
    this.messageLog = gameState.messageLog;
  }

  public handleInput(key: string): boolean {
    if (key === KEY_BINDINGS.dungeonActions.debugOverlay) {
      DebugLogger.debug('CombatInputController', 'Switching to debug scene from combat');
      const debugScene = this.sceneManager.getScene('debug') as any;
      if (debugScene && debugScene.setPreviousScene) {
        debugScene.setPreviousScene('combat');
      }
      this.sceneManager.switchTo('debug');
      return true;
    }

    if (key === 'ctrl+k') {
      this.executeInstantKill();
      return true;
    }

    if (!this.combatSystem.canPlayerAct()) {
      return true;
    }

    if (this.stateManager.isProcessing() || this.stateManager.getActionState() === 'waiting') {
      return true;
    }

    const actionState = this.stateManager.getActionState();
    if (actionState === 'select_action') {
      return this.handleActionSelection(key);
    } else if (actionState === 'select_target') {
      return this.handleTargetSelection(key);
    } else if (actionState === 'select_spell') {
      return this.handleSpellSelection(key);
    } else if (actionState === 'spell_target') {
      return this.handleSpellTargetSelection(key);
    }

    return false;
  }

  private handleActionSelection(key: string): boolean {
    const actions = this.combatSystem.getPlayerOptions();
    const currentSelection = this.stateManager.getSelectedAction();

    if (key === KEY_BINDINGS.combat.selectUp) {
      this.stateManager.setSelectedAction(Math.max(0, currentSelection - 1));
      return true;
    } else if (key === KEY_BINDINGS.combat.selectDown) {
      this.stateManager.setSelectedAction(Math.min(actions.length - 1, currentSelection + 1));
      return true;
    } else if (key === KEY_BINDINGS.combat.confirm) {
      const selectedActionText = actions[currentSelection];

      if (selectedActionText === 'Attack') {
        this.stateManager.setActionState('select_target');
        this.stateManager.setSelectedTarget(0);
      } else if (selectedActionText === 'Cast Spell') {
        const currentUnit = this.combatSystem.getCurrentUnit();
        if (currentUnit && EntityUtils.isCharacter(currentUnit)) {
          this.openSpellMenu(currentUnit);
        }
      } else {
        this.executeAction(selectedActionText);
      }
      return true;
    }

    return false;
  }

  private handleTargetSelection(key: string): boolean {
    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return false;

    const aliveMonsters = encounter.monsters.filter((m) => m.hp > 0);
    const currentTarget = this.stateManager.getSelectedTarget();

    if (key === KEY_BINDINGS.combat.selectLeft) {
      this.stateManager.setSelectedTarget(Math.max(0, currentTarget - 1));
      return true;
    } else if (key === KEY_BINDINGS.combat.selectRight) {
      this.stateManager.setSelectedTarget(Math.min(aliveMonsters.length - 1, currentTarget + 1));
      return true;
    } else if (key === KEY_BINDINGS.combat.confirm) {
      const pendingSpellId = this.stateManager.getPendingSpellId();
      if (pendingSpellId) {
        this.executeAction('Cast Spell', currentTarget, pendingSpellId);
        this.stateManager.setPendingSpellId(null);
      } else {
        this.executeAction('Attack', currentTarget);
      }
      return true;
    } else if (key === KEY_BINDINGS.combat.cancel) {
      this.stateManager.setActionState('select_action');
      return true;
    }

    return false;
  }

  private handleSpellSelection(key: string): boolean {
    return this.uiManager.getSpellMenu().handleInput(key);
  }

  private handleSpellTargetSelection(key: string): boolean {
    const handled = this.uiManager.getSpellTargetSelector().handleInput(key);
    if (!this.uiManager.getSpellTargetSelector().isActive()) {
      this.stateManager.setActionState('select_action');
    }
    return handled;
  }

  private openSpellMenu(caster: Character): void {
    const knownSpells = caster.getKnownSpells();
    if (knownSpells.length === 0) {
      this.messageLog.addCombatMessage(`${caster.name} doesn't know any spells!`);
      return;
    }

    this.stateManager.setActionState('select_spell');
    this.uiManager.getSpellMenu().open(
      caster,
      (spellId: string) => {
        this.handleSpellSelected(spellId);
      },
      () => {
        this.stateManager.setActionState('select_action');
      }
    );
  }

  private handleSpellSelected(spellId: string): void {
    const registry = SpellRegistry.getInstance();
    const spell = registry.getSpellById(spellId as SpellId);
    if (!spell) {
      this.messageLog.addCombatMessage('Unknown spell!');
      this.stateManager.setActionState('select_action');
      return;
    }

    const currentUnit = this.combatSystem.getCurrentUnit();
    if (!currentUnit || !EntityUtils.isCharacter(currentUnit)) {
      this.stateManager.setActionState('select_action');
      return;
    }

    const encounter = this.combatSystem.getEncounter();
    if (!encounter) {
      this.stateManager.setActionState('select_action');
      return;
    }

    this.stateManager.setPendingSpellId(spellId);

    this.uiManager.getSpellTargetSelector().setupForSpell(
      spell,
      encounter.monsters,
      this.gameState.party.getAliveCharacters(),
      (target: Character | Monster | null) => {
        this.executeSpellWithTarget(spellId, target);
      },
      () => {
        this.stateManager.setActionState('select_action');
        this.stateManager.setPendingSpellId(null);
      }
    );

    if (this.uiManager.getSpellTargetSelector().isActive()) {
      this.stateManager.setActionState('spell_target');
    }
  }

  private executeSpellWithTarget(spellId: string, target: Character | Monster | null): void {
    this.executeAction('Cast Spell', undefined, spellId, target ?? undefined);
    this.stateManager.setPendingSpellId(null);
  }

  private executeAction(action: string, targetIndex?: number, spellId?: string, target?: Character | Monster): void {
    if (this.stateManager.shouldDebounce()) {
      DebugLogger.debug('CombatInputController', 'Action debounced - pressed too quickly');
      return;
    }
    this.stateManager.updateLastActionTime();

    if (this.stateManager.isProcessing()) {
      DebugLogger.debug('CombatInputController', 'Action blocked - already processing');
      return;
    }

    this.stateManager.setProcessing(true);
    this.stateManager.setActionState('waiting');

    let result = '';
    const currentTarget = targetIndex ?? this.stateManager.getSelectedTarget();

    if (action === 'Attack') {
      result = this.combatSystem.executePlayerAction(action, currentTarget);
    } else if (action === 'Cast Spell') {
      const spellToUse = this.stateManager.getPendingSpellId() || spellId;
      result = this.combatSystem.executePlayerAction(action, currentTarget, spellToUse, target);
      this.stateManager.setPendingSpellId(null);
    } else {
      result = this.combatSystem.executePlayerAction(action);
    }

    DebugLogger.debug('CombatInputController', `Action result: "${result}"`);

    if (result === 'Action already in progress') {
      DebugLogger.debug('CombatInputController', 'CombatSystem busy - resetting UI');
      this.stateManager.setProcessing(false);
      this.stateManager.setActionState('select_action');
      return;
    } else if (result === 'Combat state invalid') {
      DebugLogger.debug('CombatInputController', 'Combat state invalid - resetting UI');
      this.stateManager.setProcessing(false);
      this.stateManager.setActionState('select_action');
      return;
    } else if (result && result.length > 0) {
      this.messageLog.addCombatMessage(result);
    }

    const canAct = this.combatSystem.canPlayerAct();
    this.stateManager.setActionState(canAct ? 'select_action' : 'waiting');
    this.stateManager.setSelectedAction(0);
    this.stateManager.setProcessing(false);
    DebugLogger.debug(
      'CombatInputController',
      `UI state reset - canPlayerAct: ${canAct}, actionState: ${this.stateManager.getActionState()}`
    );
  }

  private executeInstantKill(): void {
    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return;

    this.messageLog.addSystemMessage(
      '[DEBUG] Instant Kill activated! Dealing 999 damage to all enemies.'
    );

    encounter.monsters.forEach((monster) => {
      if (monster.hp > 0) {
        monster.hp = 0;
        this.messageLog.addCombatMessage(`${monster.name} takes 999 damage and is defeated!`);
      }
    });

    this.combatSystem.forceCheckCombatEnd();
  }
}
