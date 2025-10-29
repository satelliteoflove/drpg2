import { DebugLogger } from '../utils/DebugLogger';

export type SpriteType = 'stairs_up' | 'stairs_down' | 'chest' | 'chest_open';

export class SpriteManager {
  private sprites: Map<SpriteType, HTMLCanvasElement> = new Map();
  private spriteSize: number = 64;

  constructor(spriteSize: number = 64) {
    this.spriteSize = spriteSize;
    this.generateSprites();
  }

  private generateSprites(): void {
    this.generateStairsUpSprite();
    this.generateStairsDownSprite();
    this.generateChestSprite();
    this.generateChestOpenSprite();
    DebugLogger.info('SpriteManager', `Generated ${this.sprites.size} sprites`);
  }

  private generateStairsUpSprite(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.spriteSize;
    canvas.height = this.spriteSize;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, this.spriteSize, this.spriteSize);

    const centerX = this.spriteSize / 2;
    const baseY = this.spriteSize * 0.85;
    const topY = this.spriteSize * 0.25;
    const width = this.spriteSize * 0.6;

    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(centerX, topY);
    ctx.lineTo(centerX - width / 2, baseY);
    ctx.lineTo(centerX + width / 2, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#1a6b1a';
    ctx.lineWidth = 2;
    ctx.stroke();

    const stepCount = 5;
    const stepHeight = (baseY - topY) / stepCount;
    ctx.strokeStyle = '#1a6b1a';
    ctx.lineWidth = 1.5;
    for (let i = 1; i < stepCount; i++) {
      const y = topY + i * stepHeight;
      const stepWidth = (width / 2) * (i / stepCount);
      ctx.beginPath();
      ctx.moveTo(centerX - stepWidth, y);
      ctx.lineTo(centerX + stepWidth, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#32CD32';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↑', centerX, topY + 15);

    this.sprites.set('stairs_up', canvas);
  }

  private generateStairsDownSprite(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.spriteSize;
    canvas.height = this.spriteSize;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, this.spriteSize, this.spriteSize);

    const centerX = this.spriteSize / 2;
    const baseY = this.spriteSize * 0.85;
    const topY = this.spriteSize * 0.25;
    const width = this.spriteSize * 0.6;

    ctx.fillStyle = '#CD5C5C';
    ctx.beginPath();
    ctx.moveTo(centerX - width / 2, topY);
    ctx.lineTo(centerX + width / 2, topY);
    ctx.lineTo(centerX, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#8B3A3A';
    ctx.lineWidth = 2;
    ctx.stroke();

    const stepCount = 5;
    const stepHeight = (baseY - topY) / stepCount;
    ctx.strokeStyle = '#8B3A3A';
    ctx.lineWidth = 1.5;
    for (let i = 1; i < stepCount; i++) {
      const y = topY + i * stepHeight;
      const stepWidth = (width / 2) * (1 - i / stepCount);
      ctx.beginPath();
      ctx.moveTo(centerX - stepWidth, y);
      ctx.lineTo(centerX + stepWidth, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#FF6347';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↓', centerX, baseY - 15);

    this.sprites.set('stairs_down', canvas);
  }

  private generateChestSprite(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.spriteSize;
    canvas.height = this.spriteSize;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, this.spriteSize, this.spriteSize);

    const centerX = this.spriteSize / 2;
    const baseY = this.spriteSize * 0.8;
    const topY = this.spriteSize * 0.35;
    const chestWidth = this.spriteSize * 0.5;
    const chestHeight = baseY - topY;

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - chestWidth / 2, topY, chestWidth, chestHeight);

    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - chestWidth / 2, topY, chestWidth, chestHeight);

    const plankCount = 4;
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 1; i < plankCount; i++) {
      const y = topY + (chestHeight / plankCount) * i;
      ctx.beginPath();
      ctx.moveTo(centerX - chestWidth / 2, y);
      ctx.lineTo(centerX + chestWidth / 2, y);
      ctx.stroke();
    }

    const lidHeight = chestHeight * 0.3;
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(centerX - chestWidth / 2, topY, chestWidth, lidHeight);
    ctx.strokeRect(centerX - chestWidth / 2, topY, chestWidth, lidHeight);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, topY + lidHeight / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - chestWidth / 2 - 2, topY + lidHeight * 0.3, chestWidth + 4, lidHeight * 0.4);

    this.sprites.set('chest', canvas);
  }

  private generateChestOpenSprite(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.spriteSize;
    canvas.height = this.spriteSize;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, this.spriteSize, this.spriteSize);

    const centerX = this.spriteSize / 2;
    const baseY = this.spriteSize * 0.8;
    const topY = this.spriteSize * 0.35;
    const chestWidth = this.spriteSize * 0.5;
    const chestHeight = baseY - topY;

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - chestWidth / 2, topY, chestWidth, chestHeight);

    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - chestWidth / 2, topY, chestWidth, chestHeight);

    const plankCount = 4;
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 1; i < plankCount; i++) {
      const y = topY + (chestHeight / plankCount) * i;
      ctx.beginPath();
      ctx.moveTo(centerX - chestWidth / 2, y);
      ctx.lineTo(centerX + chestWidth / 2, y);
      ctx.stroke();
    }

    const lidHeight = chestHeight * 0.3;
    const lidOpenY = topY - lidHeight * 0.8;
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(centerX - chestWidth / 2, lidOpenY, chestWidth, lidHeight);
    ctx.strokeRect(centerX - chestWidth / 2, lidOpenY, chestWidth, lidHeight);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, lidOpenY + lidHeight / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(centerX, topY + chestHeight * 0.3, chestWidth * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    this.sprites.set('chest_open', canvas);
  }

  public getSprite(type: SpriteType): HTMLCanvasElement | undefined {
    return this.sprites.get(type);
  }

  public getSpriteSize(): number {
    return this.spriteSize;
  }
}
