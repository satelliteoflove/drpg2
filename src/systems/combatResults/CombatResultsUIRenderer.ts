import { CombatResultsStateContext } from './CombatResultsStateManager';
import { UIRenderingUtils } from '../../utils/UIRenderingUtils';
import { UI_CONSTANTS } from '../../config/UIConstants';

export class CombatResultsUIRenderer {
  constructor() {
  }

  public render(ctx: CanvasRenderingContext2D, stateContext: CombatResultsStateContext): void {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderHeader(ctx);
    this.renderMainContent(ctx, stateContext);
    this.renderFooter(ctx, stateContext);
  }

  private renderHeader(ctx: CanvasRenderingContext2D): void {
    UIRenderingUtils.drawPanel(
      ctx,
      UI_CONSTANTS.LAYOUT.PANEL_PADDING,
      UI_CONSTANTS.LAYOUT.PANEL_PADDING,
      ctx.canvas.width - UI_CONSTANTS.LAYOUT.WINDOW_PADDING,
      UI_CONSTANTS.LAYOUT.HEADER_HEIGHT
    );

    ctx.fillStyle = '#4a4';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', ctx.canvas.width / 2, UI_CONSTANTS.LAYOUT.HEADER_TITLE_Y);
  }

  private renderMainContent(ctx: CanvasRenderingContext2D, stateContext: CombatResultsStateContext): void {
    const contentX = 50;
    const contentY = 100;
    const contentWidth = ctx.canvas.width - 100;
    const contentHeight = 420;

    UIRenderingUtils.drawPanel(ctx, contentX, contentY, contentWidth, contentHeight);

    switch (stateContext.currentState) {
      case 'summary':
        this.renderSummary(ctx, contentX, contentY, contentWidth, contentHeight, stateContext);
        break;
      case 'loot':
        this.renderLoot(ctx, contentX, contentY, contentWidth, contentHeight, stateContext);
        break;
    }
  }

  private renderSummary(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    _height: number,
    stateContext: CombatResultsStateContext
  ): void {
    let yPos = y + 40;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Battle Complete', x + width / 2, yPos);
    yPos += 50;

    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Enemies Defeated:', x + 40, yPos);
    yPos += 30;

    ctx.font = '14px monospace';
    stateContext.defeatedMonsters.forEach(monster => {
      ctx.fillStyle = '#fff';
      const countText = monster.count > 1 ? `${monster.count}x ` : '';
      ctx.fillText(`  ${countText}${monster.name}`, x + 50, yPos);

      ctx.fillStyle = '#888';
      ctx.fillText(`(${monster.totalXp} XP, ${monster.totalGold}g)`, x + 350, yPos);
      yPos += 25;
    });

    yPos += 20;

    ctx.strokeStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(x + 40, yPos);
    ctx.lineTo(x + width - 40, yPos);
    ctx.stroke();
    yPos += 30;

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#4a4';
    ctx.textAlign = 'left';
    ctx.fillText('Total Rewards:', x + 40, yPos);
    yPos += 35;

    ctx.font = '16px monospace';
    ctx.fillStyle = '#4af';
    ctx.fillText(`Experience: +${stateContext.totalXp} XP`, x + 60, yPos);
    yPos += 30;

    ctx.fillStyle = '#fa4';
    ctx.fillText(`Gold: +${stateContext.totalGold}g`, x + 60, yPos);
    yPos += 30;

    if (stateContext.items.length > 0) {
      ctx.fillStyle = '#a4f';
      ctx.fillText(`Items Found: ${stateContext.items.length}`, x + 60, yPos);
      yPos += 30;
    }

    if (stateContext.levelUpCharacters.length > 0) {
      yPos += 20;
      ctx.fillStyle = '#fa0';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Level Up Pending!', x + 40, yPos);
      yPos += 25;

      ctx.font = '14px monospace';
      stateContext.levelUpCharacters.forEach(name => {
        ctx.fillText(`  ${name} is ready to level up!`, x + 60, yPos);
        yPos += 22;
      });
    }
  }

  private renderLoot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    _height: number,
    stateContext: CombatResultsStateContext
  ): void {
    let yPos = y + 40;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Items Acquired', x + width / 2, yPos);
    yPos += 50;

    if (stateContext.items.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '14px monospace';
      ctx.fillText('No items found', x + width / 2, yPos);
      return;
    }

    ctx.textAlign = 'left';
    ctx.font = '14px monospace';

    stateContext.items.forEach((item, index) => {
      const isSelected = index === stateContext.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 30, yPos - 18, width - 60, 28);
      }

      ctx.fillStyle = this.getRarityColor(item.rarity);
      const displayName = item.identified ? item.name : (item.unidentifiedName || '?Item');
      ctx.fillText(`  ${displayName}`, x + 50, yPos);

      ctx.fillStyle = '#888';
      ctx.fillText(`${item.value}g`, x + width - 120, yPos);

      yPos += 32;
    });
  }

  private getRarityColor(rarity?: string): string {
    switch (rarity) {
      case 'legendary': return '#ff8800';
      case 'rare': return '#8888ff';
      case 'uncommon': return '#44ff44';
      default: return '#ffffff';
    }
  }

  private renderFooter(ctx: CanvasRenderingContext2D, stateContext: CombatResultsStateContext): void {
    const footerY = ctx.canvas.height - 50;

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';

    if (stateContext.currentState === 'summary') {
      if (stateContext.items.length > 0) {
        ctx.fillText('Press ENTER to view loot, or ESC to return to dungeon', ctx.canvas.width / 2, footerY);
      } else {
        ctx.fillText('Press ENTER or ESC to return to dungeon', ctx.canvas.width / 2, footerY);
      }
    } else {
      ctx.fillText('Press ESC to return to dungeon', ctx.canvas.width / 2, footerY);
    }
  }
}
