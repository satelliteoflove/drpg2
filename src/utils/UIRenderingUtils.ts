import { UI_CONSTANTS } from '../config/UIConstants';

export interface HeaderConfig {
  title: string;
  showGold?: boolean;
  pooledGold?: number;
  partyGold?: number;
}

export class UIRenderingUtils {
  static drawPanel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = UI_CONSTANTS.COLORS.PANEL_BACKGROUND;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = UI_CONSTANTS.COLORS.PANEL_BORDER;
    ctx.lineWidth = UI_CONSTANTS.WINDOWS.BORDER_WIDTH;
    ctx.strokeRect(x, y, width, height);
  }

  static renderHeader(ctx: CanvasRenderingContext2D, config: HeaderConfig): void {
    this.drawPanel(
      ctx,
      UI_CONSTANTS.LAYOUT.PANEL_PADDING,
      UI_CONSTANTS.LAYOUT.PANEL_PADDING,
      ctx.canvas.width - UI_CONSTANTS.LAYOUT.WINDOW_PADDING,
      UI_CONSTANTS.LAYOUT.HEADER_HEIGHT
    );

    ctx.fillStyle = UI_CONSTANTS.COLORS.TEXT_PRIMARY;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(config.title, ctx.canvas.width / 2, UI_CONSTANTS.LAYOUT.HEADER_TITLE_Y);

    if (config.showGold) {
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      const goldText = config.pooledGold !== undefined
        ? `Pooled: ${config.pooledGold}g | Party: ${config.partyGold}g`
        : `Party Gold: ${config.partyGold}g`;
      ctx.fillText(goldText, ctx.canvas.width - UI_CONSTANTS.LAYOUT.HEADER_GOLD_OFFSET, UI_CONSTANTS.LAYOUT.HEADER_TITLE_Y);
    }
  }
}
