export class RenderingUtils {
  // Color constants
  static readonly COLORS = {
    // Background colors
    BLACK: '#000',
    DARK_GRAY: '#222',
    
    // Text colors
    WHITE: '#fff',
    GRAY: '#aaa',
    MUTED: '#666',
    DARK_MUTED: '#333',
    
    // Highlight colors
    GOLD: '#ffaa00',
    GREEN: '#00ff00',
    RED: '#ff6666',
    BLUE: '#6666ff',
    YELLOW: '#ffff00',
    
    // UI colors
    BORDER: '#444',
    WINDOW_BG: 'rgba(0, 0, 0, 0.9)',
    SELECTED: '#ffaa00',
    HEALTH: '#00ff00',
    MANA: '#00aaff'
  } as const;

  // Font constants
  static readonly FONTS = {
    TITLE_LARGE: '24px monospace',
    TITLE: '20px monospace',
    HEADING: '18px monospace',
    NORMAL: '16px monospace',
    SMALL: '14px monospace',
    TINY: '12px monospace'
  } as const;

  /**
   * Clears the canvas with a background color
   */
  static clearCanvas(ctx: CanvasRenderingContext2D, color: string = this.COLORS.BLACK): void {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  /**
   * Renders text with consistent styling
   */
  static renderText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options: {
      color?: string;
      font?: string;
      align?: CanvasTextAlign;
      baseline?: CanvasTextBaseline;
    } = {}
  ): void {
    const {
      color = this.COLORS.WHITE,
      font = this.FONTS.NORMAL,
      align = 'left',
      baseline = 'alphabetic'
    } = options;

    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
  }

  /**
   * Renders centered text
   */
  static renderCenteredText(
    ctx: CanvasRenderingContext2D,
    text: string,
    y: number,
    options: {
      color?: string;
      font?: string;
    } = {}
  ): void {
    this.renderText(ctx, text, ctx.canvas.width / 2, y, {
      ...options,
      align: 'center'
    });
  }

  /**
   * Renders a menu option with selection highlight
   */
  static renderMenuOption(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    isSelected: boolean,
    options: {
      selectedColor?: string;
      unselectedColor?: string;
      font?: string;
      align?: CanvasTextAlign;
      prefix?: string;
      suffix?: string;
    } = {}
  ): void {
    const {
      selectedColor = this.COLORS.GOLD,
      unselectedColor = this.COLORS.WHITE,
      font = this.FONTS.NORMAL,
      align = 'left',
      prefix = isSelected ? '> ' : '  ',
      suffix = isSelected ? ' <' : ''
    } = options;

    const displayText = align === 'center' && isSelected 
      ? `${prefix}${text}${suffix}`
      : `${prefix}${text}`;

    this.renderText(ctx, displayText, x, y, {
      color: isSelected ? selectedColor : unselectedColor,
      font,
      align
    });
  }

  /**
   * Renders a list of menu options
   */
  static renderMenu(
    ctx: CanvasRenderingContext2D,
    options: string[],
    selectedIndex: number,
    startX: number,
    startY: number,
    lineHeight: number = 40,
    menuOptions: {
      centered?: boolean;
      selectedColor?: string;
      unselectedColor?: string;
      font?: string;
    } = {}
  ): void {
    const { centered = false } = menuOptions;
    const x = centered ? ctx.canvas.width / 2 : startX;
    const align = centered ? 'center' : 'left';

    options.forEach((option, index) => {
      const y = startY + index * lineHeight;
      this.renderMenuOption(
        ctx,
        option,
        x,
        y,
        index === selectedIndex,
        { ...menuOptions, align }
      );
    });
  }

  /**
   * Renders a window/panel with border
   */
  static renderWindow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    options: {
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
      title?: string;
      titleColor?: string;
      titleFont?: string;
    } = {}
  ): void {
    const {
      backgroundColor = this.COLORS.WINDOW_BG,
      borderColor = this.COLORS.BORDER,
      borderWidth = 2,
      title,
      titleColor = this.COLORS.WHITE,
      titleFont = this.FONTS.SMALL
    } = options;

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x, y, width, height);

    // Draw border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(x, y, width, height);

    // Draw title if provided
    if (title) {
      this.renderText(ctx, title, x + width / 2, y + 20, {
        color: titleColor,
        font: titleFont,
        align: 'center'
      });
    }
  }

  /**
   * Renders a progress bar (HP, MP, etc.)
   */
  static renderProgressBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    current: number,
    max: number,
    options: {
      backgroundColor?: string;
      fillColor?: string;
      borderColor?: string;
      showText?: boolean;
      textColor?: string;
      textFont?: string;
    } = {}
  ): void {
    const {
      backgroundColor = this.COLORS.DARK_GRAY,
      fillColor = this.COLORS.HEALTH,
      borderColor = this.COLORS.BORDER,
      showText = false,
      textColor = this.COLORS.WHITE,
      textFont = this.FONTS.TINY
    } = options;

    const percentage = Math.max(0, Math.min(1, current / max));

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x, y, width, height);

    // Draw filled portion
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width * percentage, height);

    // Draw border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Draw text if requested
    if (showText) {
      this.renderText(
        ctx,
        `${current}/${max}`,
        x + width / 2,
        y + height / 2 + 4,
        {
          color: textColor,
          font: textFont,
          align: 'center'
        }
      );
    }
  }

  /**
   * Sets up canvas for pixel-perfect rendering
   */
  static setupPixelPerfectRendering(ctx: CanvasRenderingContext2D): void {
    ctx.imageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;
  }

  /**
   * Saves the current canvas context state
   */
  static saveContext(ctx: CanvasRenderingContext2D): void {
    ctx.save();
  }

  /**
   * Restores the canvas context state
   */
  static restoreContext(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  /**
   * Helper to draw multiline text
   */
  static renderMultilineText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    lineHeight: number = 20,
    options: {
      color?: string;
      font?: string;
      align?: CanvasTextAlign;
      maxWidth?: number;
    } = {}
  ): void {
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      this.renderText(ctx, line, x, y + index * lineHeight, options);
    });
  }
}