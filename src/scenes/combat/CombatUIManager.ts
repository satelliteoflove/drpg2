import { GameState, Monster } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { CombatSystem } from '../../systems/CombatSystem';
import { CombatStateManager } from './CombatStateManager';
import { StatusPanel } from '../../ui/StatusPanel';
import { DebugOverlay } from '../../ui/DebugOverlay';
import { SpellMenu } from '../../ui/SpellMenu';
import { SpellTargetSelector } from '../../ui/SpellTargetSelector';
import { EntityUtils } from '../../utils/EntityUtils';
import { UI_CONSTANTS } from '../../config/UIConstants';
import { SceneRenderContext } from '../../core/Scene';

export class CombatUIManager {
  private gameState: GameState;
  private combatSystem: CombatSystem;
  private stateManager: CombatStateManager;
  private messageLog: any;

  private statusPanel!: StatusPanel;
  private debugOverlay!: DebugOverlay;
  private spellMenu: SpellMenu;
  private spellTargetSelector: SpellTargetSelector;

  constructor(
    gameState: GameState,
    combatSystem: CombatSystem,
    stateManager: CombatStateManager
  ) {
    this.gameState = gameState;
    this.combatSystem = combatSystem;
    this.stateManager = stateManager;
    this.messageLog = gameState.messageLog;
    this.spellMenu = new SpellMenu();
    this.spellTargetSelector = new SpellTargetSelector();
  }

  public initializeUI(canvas: HTMLCanvasElement): void {
    this.statusPanel = new StatusPanel(
      canvas,
      UI_CONSTANTS.LAYOUT.STATUS_PANEL_X,
      UI_CONSTANTS.LAYOUT.STATUS_PANEL_Y,
      UI_CONSTANTS.LAYOUT.STATUS_PANEL_WIDTH,
      UI_CONSTANTS.LAYOUT.STATUS_PANEL_HEIGHT
    );
    this.debugOverlay = new DebugOverlay(canvas);
    this.messageLog.addCombatMessage('Combat begins!');
  }

  public getSpellMenu(): SpellMenu {
    return this.spellMenu;
  }

  public getSpellTargetSelector(): SpellTargetSelector {
    return this.spellTargetSelector;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.statusPanel) {
      this.initializeUI(ctx.canvas);
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderCombatHeader(ctx);
    this.renderCombatArea(ctx);
    this.renderUI(ctx);
    this.renderCombatInfo(ctx);

    const debugData = this.stateManager.getDebugData();
    this.debugOverlay.updateDebugData(debugData);
    this.debugOverlay.render(this.gameState);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    if (!this.statusPanel) {
      this.initializeUI(renderContext.mainContext.canvas);
    }

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.renderCombatHeader(ctx);
    });

    renderManager.renderEntities((ctx) => {
      this.renderCombatArea(ctx);
    });

    renderManager.renderUI((ctx) => {
      this.renderUI(ctx);
      this.renderCombatInfo(ctx);
      this.renderCombatControls(ctx);

      const debugData = this.stateManager.getDebugData();
      this.debugOverlay.updateDebugData(debugData);
      this.debugOverlay.render(this.gameState);
    });
  }

  public setDebugOverlayScene(sceneName: string): void {
    this.debugOverlay?.setCurrentScene(sceneName);
  }

  private renderCombatHeader(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(10, 10, ctx.canvas.width - 20, 60);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, ctx.canvas.width - 20, 60);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('COMBAT', ctx.canvas.width / 2, 45);

    const currentUnit = this.combatSystem.getCurrentUnit();
    if (currentUnit) {
      ctx.fillStyle = '#ffa500';
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      const unitName = currentUnit.name;
      ctx.fillText(`Current Turn: ${unitName}`, ctx.canvas.width - 30, 45);
    }
  }

  private renderCombatArea(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(260, 80, 500, 400);

    ctx.strokeStyle = '#600000';
    ctx.lineWidth = 2;
    ctx.strokeRect(260, 80, 500, 400);

    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return;

    this.renderMonsters(ctx, encounter.monsters);
  }

  private renderMonsters(ctx: CanvasRenderingContext2D, monsters: Monster[]): void {
    const actionState = this.stateManager.getActionState();
    const selectedTarget = this.stateManager.getSelectedTarget();

    monsters.forEach((monster, index) => {
      if (monster.hp <= 0) return;

      const x = 320 + (index % 3) * 140;
      const y = 160 + Math.floor(index / 3) * 100;

      if (actionState === 'select_target' && index === selectedTarget) {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x - 5, y - 5, 110, 110);
      }

      ctx.fillStyle = '#800000';
      ctx.fillRect(x, y, 100, 100);

      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 100, 100);

      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(monster.name, x + 50, y + 20);

      const hpPercent = monster.hp / monster.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 10, y + 30, 80, 8);

      ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
      ctx.fillRect(x + 10, y + 30, 80 * hpPercent, 8);

      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`${monster.hp}/${monster.maxHp}`, x + 50, y + 50);

      if (monster.statuses && monster.statuses.length > 0) {
        ctx.fillStyle = '#ffaa00';
        ctx.font = '9px monospace';
        const statusText = monster.statuses.map(s => this.getStatusIcon(s.type)).join(' ');
        ctx.fillText(statusText, x + 50, y + 62);
      }
    });
  }

  private getStatusIcon(statusType: string): string {
    const icons: Record<string, string> = {
      'Sleeping': 'SLP',
      'Paralyzed': 'PAR',
      'Poisoned': 'PSN',
      'Stoned': 'STN',
      'Silenced': 'SIL',
      'Blinded': 'BLD',
      'Confused': 'CNF',
      'Afraid': 'FER',
      'Charmed': 'CHM',
      'Berserk': 'BRK',
      'Blessed': 'BLS',
      'Cursed': 'CRS'
    };
    return icons[statusType] || statusType.substring(0, 3).toUpperCase();
  }

  private renderUI(ctx: CanvasRenderingContext2D): void {
    this.statusPanel.render(this.gameState.party, ctx);
    this.messageLog.render(ctx);

    this.renderActionMenu(ctx, this.combatSystem.canPlayerAct());
  }

  private renderActionMenu(ctx: CanvasRenderingContext2D, enabled: boolean): void {
    this.renderTurnOrder(ctx);

    const menuX = 770;
    const menuY = 290;
    const menuWidth = 240;
    const menuHeight = 270;

    const spellMenuX = 280;
    const spellMenuY = 150;
    const spellMenuWidth = 600;
    const spellMenuHeight = 400;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);

    const titleColor = enabled ? '#fff' : '#666';
    ctx.fillStyle = titleColor;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('COMBAT OPTIONS', menuX + menuWidth / 2, menuY + 20);
    ctx.textAlign = 'left';
    ctx.font = '12px monospace';

    const actionsStartY = menuY + 45;
    const actionState = this.stateManager.getActionState();
    const selectedAction = this.stateManager.getSelectedAction();

    if (actionState === 'select_action') {
      const actions = this.combatSystem.getPlayerOptions();

      ctx.fillStyle = enabled ? '#fff' : '#666';
      ctx.font = '12px monospace';
      ctx.fillText('Select Action:', menuX + 10, actionsStartY);

      actions.forEach((action, index) => {
        const y = actionsStartY + 20 + index * 18;

        if (enabled) {
          ctx.fillStyle = index === selectedAction ? '#ffff00' : '#fff';
        } else {
          ctx.fillStyle = '#555';
        }
        ctx.fillText(`${index + 1}. ${action}`, menuX + 20, y);
      });
    } else if (actionState === 'select_target') {
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText('Select Target:', menuX + 10, actionsStartY);
      ctx.fillText('LEFT/RIGHT: Select', menuX + 10, actionsStartY + 20);
      ctx.fillText('ENTER: Confirm', menuX + 10, actionsStartY + 40);
    } else if (actionState === 'select_spell') {
      this.spellMenu.render(ctx, spellMenuX, spellMenuY, spellMenuWidth, spellMenuHeight);
    } else if (actionState === 'spell_target') {
      const encounter = this.combatSystem.getEncounter();
      if (encounter) {
        const selectorWidth = 350;
        const selectorHeight = 80;
        const selectorX = 510 - (selectorWidth / 2);
        const selectorY = 560 - selectorHeight;
        this.spellTargetSelector.render(ctx, selectorX, selectorY);
      }
    } else if (actionState === 'waiting') {
      ctx.fillText('Processing turn...', menuX + 10, menuY + 25);
    }
  }

  private renderTurnOrder(ctx: CanvasRenderingContext2D): void {
    const orderX = 770;
    const orderY = 80;
    const orderWidth = 240;
    const orderHeight = 200;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(orderX, orderY, orderWidth, orderHeight);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(orderX, orderY, orderWidth, orderHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TURN ORDER', orderX + orderWidth / 2, orderY + 20);
    ctx.textAlign = 'left';

    const encounter = this.combatSystem.getEncounter();
    if (encounter) {
      const currentTurnIndex = encounter.currentTurn;
      const totalUnits = encounter.turnOrder.length;
      const currentUnit = this.combatSystem.getCurrentUnit();
      ctx.font = '12px monospace';

      const displayCount = Math.min(6, totalUnits);
      for (let i = 0; i < displayCount; i++) {
        const turnIndex = (currentTurnIndex + i) % totalUnits;
        const unit = encounter.turnOrder[turnIndex];
        const unitName = EntityUtils.getName(unit as Character | Monster);
        const isCurrent = unit === currentUnit;
        ctx.fillStyle = isCurrent ? '#ffff00' : '#aaa';
        ctx.fillText(`${i + 1}. ${unitName}`, orderX + 10, orderY + 45 + i * 18);
      }
    }
  }

  private renderCombatInfo(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    ctx.fillText(
      '[DEBUG: Press Ctrl+K for instant kill]',
      ctx.canvas.width - 200,
      ctx.canvas.height - 10
    );
  }

  private renderCombatControls(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    const y = ctx.canvas.height - 30;
    const actionState = this.stateManager.getActionState();
    const selectedAction = this.stateManager.getSelectedAction();

    if (actionState === 'select_action' && this.combatSystem.canPlayerAct()) {
      let controls = 'UP/DOWN: Select Action | ENTER: Confirm';
      if (selectedAction === 0) {
        controls += ' | LEFT/RIGHT: Select Target';
      }
      ctx.fillText(controls, 10, y);
      ctx.fillText('1: Attack | 2: Defend | 3: Run | K: Instant Kill (debug)', 10, y + 12);
    } else {
      ctx.fillText('Processing turn... please wait', 10, y);
    }
  }
}
