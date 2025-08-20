export class MessageLog {
  private ctx: CanvasRenderingContext2D;
  private messages: { text: string; timestamp: number; color?: string }[] = [];
  private maxMessages: number = 20;
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
    this.ctx = canvas.getContext('2d')!;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public addMessage(text: string, color: string = '#fff'): void {
    this.messages.push({
      text,
      timestamp: Date.now(),
      color,
    });

    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
  }

  public render(): void {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(this.x, this.y, this.width, this.height);

    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.x, this.y, this.width, this.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('MESSAGE LOG', this.x + 5, this.y + 15);

    const lineHeight = 14;
    const startY = this.y + 30;
    const visibleLines = Math.floor((this.height - 35) / lineHeight);

    const recentMessages = this.messages.slice(-visibleLines);

    recentMessages.forEach((message, index) => {
      const messageY = startY + index * lineHeight;
      const age = Date.now() - message.timestamp;
      const alpha = Math.max(0.3, 1 - age / 10000); // Fade over 10 seconds

      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = message.color || '#fff';
      this.ctx.font = '11px monospace';

      const wrappedLines = this.wrapText(message.text, this.width - 10);
      wrappedLines.forEach((line, lineIndex) => {
        this.ctx.fillText(line, this.x + 5, messageY + lineIndex * lineHeight);
      });

      this.ctx.restore();
    });

    this.renderScrollIndicator();
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private renderScrollIndicator(): void {
    if (this.messages.length > Math.floor((this.height - 35) / 14)) {
      this.ctx.fillStyle = '#666';
      this.ctx.fillRect(this.x + this.width - 10, this.y + 20, 5, this.height - 25);

      const scrollPercent = Math.min(1, Math.floor((this.height - 35) / 14) / this.messages.length);
      const indicatorHeight = Math.max(10, (this.height - 25) * scrollPercent);
      const indicatorY = this.y + 20 + (this.height - 25 - indicatorHeight);

      this.ctx.fillStyle = '#aaa';
      this.ctx.fillRect(this.x + this.width - 10, indicatorY, 5, indicatorHeight);
    }
  }

  public clear(): void {
    this.messages = [];
  }

  public addCombatMessage(message: string): void {
    this.addMessage(message, '#ff6666');
  }

  public addSystemMessage(message: string): void {
    this.addMessage(message, '#66ff66');
  }

  public addWarningMessage(message: string): void {
    this.addMessage(message, '#ffff66');
  }

  public addDeathMessage(message: string): void {
    this.addMessage(message, '#ff0000');
  }

  public addLevelUpMessage(message: string): void {
    this.addMessage(message, '#00ffff');
  }

  public addItemMessage(message: string): void {
    this.addMessage(message, '#ffaa00');
  }

  public addMagicMessage(message: string): void {
    this.addMessage(message, '#aa00ff');
  }
}
