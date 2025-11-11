import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import type { CombatSystem } from '../systems/CombatSystem';
import { CombatStateManager } from './combat/CombatStateManager';
import { CombatUIManager } from './combat/CombatUIManager';
import { CombatInputController } from './combat/CombatInputController';
import { GameServices } from '../services/GameServices';
import { EntityUtils } from '../utils/EntityUtils';

export class CombatScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private combatSystem: CombatSystem;
  private stateManager: CombatStateManager;
  private uiManager: CombatUIManager;
  private inputController: CombatInputController;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Combat');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.combatSystem = GameServices.getInstance().getCombatSystem();

    this.stateManager = new CombatStateManager(this.gameState, this.combatSystem);
    this.uiManager = new CombatUIManager(this.gameState, this.combatSystem, this.stateManager);
    this.inputController = new CombatInputController(
      this.gameState,
      this.combatSystem,
      this.stateManager,
      this.uiManager,
      this.sceneManager
    );

    this.stateManager.setOnCombatEnd((_victory, _rewards, _escaped) => {
      this.sceneManager.switchTo('dungeon');
    });
  }

  public enter(): void {
    this.uiManager.setDebugOverlayScene('Combat');

    this.stateManager.initializeCombat();
    this.stateManager.resetState();

    this.uiManager.getSpellMenu().close();

    this.stateManager.processInitialMonsterTurns();
  }

  public exit(): void {
    this.gameState.inCombat = false;
  }

  public update(_deltaTime: number): void {
    if (this.stateManager.checkPartyWiped()) {
      return;
    }

    if (this.stateManager.updateMonsterTurns()) {
      return;
    }

    this.stateManager.updateForPlayerTurn();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.uiManager.render(ctx);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    this.uiManager.renderLayered(renderContext);
  }

  public handleInput(key: string): boolean {
    return this.inputController.handleInput(key);
  }

  public getTestState(): any {
    const baseState = this.stateManager.getTestState();
    return {
      ...baseState,
      spellMenuOpen: baseState.actionState === 'select_spell',
      spellMenuState: this.uiManager.getSpellMenu().getState(),
      spellTargetSelectorState: this.uiManager.getSpellTargetSelector().getState(),
      availableSpells: baseState.actionState === 'select_spell' ? this.getAvailableSpells() : []
    };
  }

  private getAvailableSpells(): string[] {
    const currentUnit = this.combatSystem.getCurrentUnit();
    if (currentUnit && EntityUtils.isCharacter(currentUnit)) {
      return currentUnit.knownSpells || [];
    }
    return [];
  }
}
