import { GameState, Monster } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { CombatSystem } from '../../systems/CombatSystem';
import { CombatStateManager } from './CombatStateManager';
import { StatusPanel } from '../../ui/StatusPanel';
import { DebugOverlay } from '../../ui/DebugOverlay';
import { SpellMenu } from '../../ui/SpellMenu';
import { SpellTargetSelector } from '../../ui/SpellTargetSelector';
import { SpellRegistry } from '../../systems/magic/SpellRegistry';
import { UI_CONSTANTS } from '../../config/UIConstants';
import { calculateSpellDelay, INITIATIVE } from '../../config/InitiativeConstants';
import { SpellEffectCategory, SpellTargetScope } from '../../types/InitiativeTypes';
import { SceneRenderContext } from '../../core/Scene';
import { KeyBindingHelper } from '../../config/KeyBindings';

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
    this.renderTurnOrderList(ctx);

    const CO = UI_CONSTANTS.COMBAT_OPTIONS;

    const spellMenuX = 280;
    const spellMenuY = 150;
    const spellMenuWidth = 600;
    const spellMenuHeight = 400;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(CO.X, CO.Y, CO.WIDTH, CO.HEIGHT);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(CO.X, CO.Y, CO.WIDTH, CO.HEIGHT);

    const actionState = this.stateManager.getActionState();
    const selectedAction = this.stateManager.getSelectedAction();

    if (actionState === 'select_action') {
      const actions = this.combatSystem.getPlayerOptions();

      const col1X = CO.X + 15;
      const col2X = CO.X + CO.COLUMN_WIDTH + CO.COLUMN_GAP;
      const startY = CO.Y + 20;
      const lineHeight = 18;

      actions.forEach((action, index) => {
        const column = index < 3 ? 0 : 1;
        const row = index < 3 ? index : index - 3;
        const x = column === 0 ? col1X : col2X;
        const y = startY + row * lineHeight;

        if (enabled) {
          ctx.fillStyle = index === selectedAction ? '#ffff00' : '#fff';
        } else {
          ctx.fillStyle = '#555';
        }

        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        const actionText = `${index + 1}. ${action}`;
        ctx.fillText(actionText, x, y);
      });
    } else if (actionState === 'select_target') {
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Select Target: LEFT/RIGHT to select, ENTER to confirm', CO.X + 15, CO.Y + 30);
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
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Processing turn...', CO.X + 15, CO.Y + 30);
    }
  }

  private renderTurnOrderList(ctx: CanvasRenderingContext2D): void {
    const TOL = UI_CONSTANTS.TURN_ORDER_LIST;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(TOL.X, TOL.Y, TOL.WIDTH, TOL.HEIGHT);

    ctx.strokeStyle = TOL.BORDER_COLOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(TOL.X, TOL.Y, TOL.WIDTH, TOL.HEIGHT);

    ctx.fillStyle = TOL.TEXT_COLOR;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TURN ORDER', TOL.X + TOL.WIDTH / 2, TOL.Y + 20);

    const snapshot = this.combatSystem.getInitiativeSnapshot();
    if (!snapshot || snapshot.queue.length === 0) return;

    const actionState = this.stateManager.getActionState();
    const selectedDelay = this.getPreviewDelay(actionState);
    const showPreview = actionState === 'select_action' || actionState === 'select_spell' || actionState === 'spell_target';

    let ghostPosition = -1;
    if (showPreview && selectedDelay > 0) {
      ghostPosition = this.combatSystem.simulateGhostPosition(selectedDelay);
    }

    const listStartY = TOL.Y + TOL.TITLE_HEIGHT + 5;
    const maxVisibleEntries = Math.min(snapshot.queue.length, TOL.MAX_ENTRIES);

    let renderIndex = 0;
    for (let i = 0; i < maxVisibleEntries && renderIndex < TOL.MAX_ENTRIES; i++) {
      const entry = snapshot.queue[i];
      const entryY = listStartY + renderIndex * TOL.ENTRY_HEIGHT;

      if (showPreview && ghostPosition === i && !entry.isCurrentActor) {
        this.renderGhostEntry(ctx, TOL.X, entryY, TOL.WIDTH, TOL.ENTRY_HEIGHT, snapshot, selectedDelay);
        renderIndex++;

        if (renderIndex >= TOL.MAX_ENTRIES) break;
        const nextEntryY = listStartY + renderIndex * TOL.ENTRY_HEIGHT;
        this.renderTurnEntry(ctx, TOL.X, nextEntryY, TOL.WIDTH, TOL.ENTRY_HEIGHT, entry, false);
        renderIndex++;
      } else {
        this.renderTurnEntry(ctx, TOL.X, entryY, TOL.WIDTH, TOL.ENTRY_HEIGHT, entry, entry.isCurrentActor);
        renderIndex++;
      }
    }

    if (showPreview && ghostPosition >= maxVisibleEntries && renderIndex < TOL.MAX_ENTRIES) {
      const entryY = listStartY + renderIndex * TOL.ENTRY_HEIGHT;
      this.renderGhostEntry(ctx, TOL.X, entryY, TOL.WIDTH, TOL.ENTRY_HEIGHT, snapshot, selectedDelay);
    }
  }

  private renderTurnEntry(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    entry: { entityId: string; entityName: string; isPlayer: boolean; isCurrentActor: boolean },
    isCurrentActor: boolean
  ): void {
    const TOL = UI_CONSTANTS.TURN_ORDER_LIST;
    const padding = TOL.PADDING;

    if (isCurrentActor) {
      ctx.fillStyle = TOL.CURRENT_ACTOR_BG;
      ctx.fillRect(x + 2, y, width - 4, height - 2);
    }

    let color: string;
    if (entry.isPlayer) {
      const character = this.gameState.party.characters.find((c: Character) => c.id === entry.entityId);
      color = character?.dialogueColor || TOL.PLAYER_COLOR;
    } else {
      color = TOL.ENEMY_COLOR;
    }

    ctx.fillStyle = color;
    ctx.font = isCurrentActor ? 'bold 12px monospace' : '12px monospace';
    ctx.textAlign = 'left';

    const indicator = isCurrentActor ? '>' : ' ';
    const displayName = entry.entityName.length > 18 ? entry.entityName.substring(0, 16) + '..' : entry.entityName;
    ctx.fillText(`${indicator} ${displayName}`, x + padding, y + height / 2 + 4);

    if (!entry.isPlayer) {
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('(enemy)', x + width - padding, y + height / 2 + 3);
    }
  }

  private renderGhostEntry(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    snapshot: { queue: Array<{ entityId: string; entityName: string; isPlayer: boolean; isCurrentActor: boolean }>; activeEntityId: string | null },
    delay: number
  ): void {
    const TOL = UI_CONSTANTS.TURN_ORDER_LIST;
    const padding = TOL.PADDING;

    const currentActor = snapshot.queue.find(e => e.isCurrentActor);
    if (!currentActor) return;

    ctx.save();
    ctx.globalAlpha = TOL.GHOST_OPACITY;

    ctx.fillStyle = TOL.GHOST_BG;
    ctx.fillRect(x + 2, y, width - 4, height - 2);

    let color: string;
    if (currentActor.isPlayer) {
      const character = this.gameState.party.characters.find((c: Character) => c.id === currentActor.entityId);
      color = character?.dialogueColor || TOL.PLAYER_COLOR;
    } else {
      color = TOL.ENEMY_COLOR;
    }

    ctx.fillStyle = color;
    ctx.font = 'italic 12px monospace';
    ctx.textAlign = 'left';

    const displayName = currentActor.entityName.length > 14 ? currentActor.entityName.substring(0, 12) + '..' : currentActor.entityName;
    ctx.fillText(`  [${displayName}]`, x + padding, y + height / 2 + 4);

    ctx.fillStyle = '#aaa';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`d:${delay}`, x + width - padding, y + height / 2 + 3);

    ctx.restore();
  }

  private getPreviewDelay(actionState: string): number {
    if (actionState === 'select_action') {
      return this.stateManager.getSelectedActionDelay();
    }
    if (actionState === 'select_spell' || actionState === 'spell_target') {
      const pendingSpellId = this.stateManager.getPendingSpellId();
      if (pendingSpellId) {
        return this.getSpellDelay(pendingSpellId);
      }
      return INITIATIVE.SPELL_EFFECT_DELAYS.utility;
    }
    return 0;
  }

  private getSpellDelay(spellId: string): number {
    const spellRegistry = SpellRegistry.getInstance();
    const spellData = spellRegistry.getSpellById(spellId as any);
    if (!spellData) return INITIATIVE.SPELL_EFFECT_DELAYS.utility;

    const firstEffect = spellData.effects?.[0];
    const effectType = firstEffect?.type || 'utility';

    const effectMapping: Record<string, SpellEffectCategory> = {
      damage: 'damage',
      heal: 'healing',
      buff: 'buff',
      debuff: 'debuff',
      cure: 'status_cure',
      inflict: 'status_inflict',
      summon: 'utility',
      teleport: 'utility',
      identify: 'utility',
      special: 'utility'
    };
    const effectCategory = effectMapping[effectType] || 'utility';

    const targetType = spellData.targetType || 'single_enemy';
    const scopeMapping: Record<string, SpellTargetScope> = {
      self: 'self',
      single_ally: 'single_ally',
      all_allies: 'all_allies',
      single_enemy: 'single_enemy',
      all_enemies: 'all_enemies',
      group: 'group',
      row: 'row'
    };
    const targetScope = scopeMapping[targetType] || 'single_enemy';

    return calculateSpellDelay(effectCategory, targetScope);
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
      const parts = [`${KeyBindingHelper.getMenuNavigationDisplay()}: Select Action`, `${KeyBindingHelper.getConfirmKeyDisplay()}: Confirm`];
      if (selectedAction === 0) {
        parts.push('LEFT/RIGHT: Select Target');
      }
      ctx.fillText(KeyBindingHelper.buildControlLine(...parts), 10, y);
      ctx.fillText('1: Attack | 2: Defend | 3: Run | K: Instant Kill (debug)', 10, y + 12);
    } else {
      ctx.fillText('Processing turn... please wait', 10, y);
    }
  }
}
