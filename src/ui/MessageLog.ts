import { GAME_CONFIG } from '../config/GameConstants';
import { BanterResponse } from '../types/BanterTypes';
import { Party } from '../entities/Party';

export class MessageLog {
  private ctx: CanvasRenderingContext2D;
  private currentRenderCtx: CanvasRenderingContext2D;
  private messages: { text: string; timestamp: number; color?: string }[] = [];
  private maxMessages: number = 20;
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
    this.ctx = canvas.getContext('2d')!;
    this.currentRenderCtx = this.ctx;
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

  public add(text: string, color?: string): void {
    this.addMessage(text, color);
  }

  public getMessageCount(): number {
    return this.messages.length;
  }

  public clear(): void {
    this.messages = [];
  }

  public hasMessages(): boolean {
    return this.messages.length > 0;
  }

  public render(ctx?: CanvasRenderingContext2D): void {
    this.currentRenderCtx = ctx || this.ctx;

    // Panel background with consistent style
    this.currentRenderCtx.fillStyle = '#2a2a2a';
    this.currentRenderCtx.fillRect(this.x, this.y, this.width, this.height);

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(this.x, this.y, this.width, this.height);

    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = 'bold 12px monospace';
    this.currentRenderCtx.textAlign = 'left';
    this.currentRenderCtx.fillText('MESSAGE LOG', this.x + 10, this.y + 15);

    const lineHeight = 14;
    const startY = this.y + 30;
    const visibleLines = Math.floor((this.height - 35) / lineHeight);

    const recentMessages = this.messages.slice(-visibleLines);

    recentMessages.forEach((message, index) => {
      const messageY = startY + index * lineHeight;
      let alpha = 1;

      if (GAME_CONFIG.UI.MESSAGE_FADE_ENABLED) {
        const age = Date.now() - message.timestamp;
        alpha = Math.max(0.3, 1 - age / GAME_CONFIG.UI.MESSAGE_FADE_TIME);
      }

      this.currentRenderCtx.save();
      this.currentRenderCtx.globalAlpha = alpha;
      this.currentRenderCtx.fillStyle = message.color || '#fff';
      this.currentRenderCtx.font = '11px monospace';
      this.currentRenderCtx.textAlign = 'left';

      const wrappedLines = this.wrapText(message.text, this.width - 20);
      wrappedLines.forEach((line, lineIndex) => {
        this.currentRenderCtx.fillText(line, this.x + 10, messageY + lineIndex * lineHeight);
      });

      this.currentRenderCtx.restore();
    });

    this.renderScrollIndicator();
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.currentRenderCtx.measureText(testLine);

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
      this.currentRenderCtx.fillStyle = '#666';
      this.currentRenderCtx.fillRect(this.x + this.width - 15, this.y + 20, 5, this.height - 25);

      const scrollPercent = Math.min(1, Math.floor((this.height - 35) / 14) / this.messages.length);
      const indicatorHeight = Math.max(10, (this.height - 25) * scrollPercent);
      const indicatorY = this.y + 20 + (this.height - 25 - indicatorHeight);

      this.currentRenderCtx.fillStyle = '#aaa';
      this.currentRenderCtx.fillRect(this.x + this.width - 15, indicatorY, 5, indicatorHeight);
    }
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

  public addBanterExchange(exchange: BanterResponse, party: Party): void {
    this.addMessage('');

    for (const line of exchange.lines) {
      const character = party.characters.find((c) => c.name === line.characterName);
      const color = character?.dialogueColor || '#ffffff';
      const formattedText = `${line.characterName}: ${line.text}`;
      this.addMessage(formattedText, color);
    }

    this.addMessage('');
  }
}
