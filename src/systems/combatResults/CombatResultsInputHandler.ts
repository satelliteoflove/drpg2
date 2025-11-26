import { SceneManager } from '../../core/Scene';
import { CombatResultsStateManager } from './CombatResultsStateManager';
import { GameServices } from '../../services/GameServices';
import { SFX_CATALOG } from '../../config/AudioConstants';

export class CombatResultsInputHandler {
  private sceneManager: SceneManager;
  private stateManager: CombatResultsStateManager;

  constructor(sceneManager: SceneManager, stateManager: CombatResultsStateManager) {
    this.sceneManager = sceneManager;
    this.stateManager = stateManager;
  }

  public handleInput(key: string): boolean {
    const audioManager = GameServices.getInstance().getAudioManager();

    switch (this.stateManager.currentState) {
      case 'summary':
        return this.handleSummaryInput(key, audioManager);
      case 'loot':
        return this.handleLootInput(key, audioManager);
    }

    return false;
  }

  private handleSummaryInput(key: string, audioManager: any): boolean {
    switch (key) {
      case 'enter':
        audioManager.playSfx(SFX_CATALOG.MENU.CONFIRM);
        if (this.stateManager.hasLoot()) {
          this.stateManager.setState('loot');
        } else {
          this.returnToDungeon();
        }
        return true;

      case 'escape':
        audioManager.playSfx(SFX_CATALOG.MENU.CANCEL);
        this.returnToDungeon();
        return true;
    }

    return false;
  }

  private handleLootInput(key: string, audioManager: any): boolean {
    const items = this.stateManager.rewards?.items || [];

    switch (key) {
      case 'arrowup':
      case 'w':
        if (items.length > 0) {
          audioManager.playSfx(SFX_CATALOG.MENU.CURSOR);
          this.stateManager.selectedOption = Math.max(0, this.stateManager.selectedOption - 1);
        }
        return true;

      case 'arrowdown':
      case 's':
        if (items.length > 0) {
          audioManager.playSfx(SFX_CATALOG.MENU.CURSOR);
          this.stateManager.selectedOption = Math.min(items.length - 1, this.stateManager.selectedOption + 1);
        }
        return true;

      case 'escape':
      case 'enter':
        audioManager.playSfx(SFX_CATALOG.MENU.CONFIRM);
        this.returnToDungeon();
        return true;
    }

    return false;
  }

  private returnToDungeon(): void {
    this.sceneManager.switchTo('dungeon');
  }
}
