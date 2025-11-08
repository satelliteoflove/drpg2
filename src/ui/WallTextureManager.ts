import { DebugLogger } from '../utils/DebugLogger';

export type WallTextureType = 'brick' | 'stone' | 'dark' | 'door';

export class WallTextureManager {
  private textures: Map<WallTextureType, HTMLCanvasElement> = new Map();
  private textureWidth: number = 64;
  private textureHeight: number = 64;

  constructor(textureWidth: number = 64, textureHeight: number = 64) {
    this.textureWidth = textureWidth;
    this.textureHeight = textureHeight;
    this.generateTextures();
  }

  private generateTextures(): void {
    this.generateBrickTexture();
    this.generateStoneTexture();
    this.generateDarkTexture();
    this.generateDoorTexture();
    DebugLogger.info('WallTextureManager', `Generated ${this.textures.size} wall textures`);
  }

  private generateBrickTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.textureWidth;
    canvas.height = this.textureHeight;
    const ctx = canvas.getContext('2d')!;

    const brickWidth = 16;
    const brickHeight = 8;
    const mortarSize = 1;

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, this.textureWidth, this.textureHeight);

    ctx.fillStyle = '#A0522D';

    for (let y = 0; y < this.textureHeight; y += brickHeight) {
      const offset = ((y / brickHeight) % 2) * (brickWidth / 2);
      for (let x = -brickWidth; x < this.textureWidth + brickWidth; x += brickWidth) {
        const brickX = x + offset;
        ctx.fillRect(
          brickX + mortarSize,
          y + mortarSize,
          brickWidth - mortarSize * 2,
          brickHeight - mortarSize * 2
        );

        const variation = (Math.sin(brickX * 0.1) * Math.cos(y * 0.1)) * 0.1 + 1;
        ctx.fillStyle = `rgb(${Math.floor(160 * variation)}, ${Math.floor(82 * variation)}, ${Math.floor(45 * variation)})`;
      }
    }

    this.textures.set('brick', canvas);
  }

  private generateStoneTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.textureWidth;
    canvas.height = this.textureHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#696969';
    ctx.fillRect(0, 0, this.textureWidth, this.textureHeight);

    for (let i = 0; i < 200; i++) {
      const x = Math.random() * this.textureWidth;
      const y = Math.random() * this.textureHeight;
      const brightness = 0.5 + Math.random() * 0.5;
      const gray = Math.floor(105 * brightness);
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fillRect(x, y, 2, 2);
    }

    this.textures.set('stone', canvas);
  }

  private generateDarkTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.textureWidth;
    canvas.height = this.textureHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(0, 0, this.textureWidth, this.textureHeight);

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.textureWidth;
      const y = Math.random() * this.textureHeight;
      const brightness = 0.3 + Math.random() * 0.3;
      const gray = Math.floor(47 * brightness);
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fillRect(x, y, 1, 1);
    }

    this.textures.set('dark', canvas);
  }

  private generateDoorTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.textureWidth;
    canvas.height = this.textureHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#654321';
    ctx.fillRect(0, 0, this.textureWidth, this.textureHeight);

    const plankWidth = this.textureWidth / 6;
    ctx.fillStyle = '#5C3A1E';
    for (let i = 0; i < 6; i++) {
      const x = i * plankWidth;
      ctx.fillRect(x, 0, plankWidth - 2, this.textureHeight);

      for (let y = 0; y < this.textureHeight; y += 4) {
        const brightness = 0.8 + Math.random() * 0.4;
        const r = Math.floor(92 * brightness);
        const g = Math.floor(58 * brightness);
        const b = Math.floor(30 * brightness);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x + 1, y, plankWidth - 4, 2);
      }
    }

    ctx.fillStyle = '#2F2F2F';
    const bandPositions = [this.textureHeight * 0.2, this.textureHeight * 0.5, this.textureHeight * 0.8];
    bandPositions.forEach(y => {
      ctx.fillRect(0, y - 2, this.textureWidth, 4);
    });

    const centerX = this.textureWidth * 0.75;
    const centerY = this.textureHeight * 0.5;
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    this.textures.set('door', canvas);
  }

  public getTexture(type: WallTextureType): HTMLCanvasElement | undefined {
    return this.textures.get(type);
  }

  public getTextureColumn(
    type: WallTextureType,
    column: number
  ): ImageData | null {
    const texture = this.textures.get(type);
    if (!texture) {
      DebugLogger.warn('WallTextureManager', `Texture not found: ${type}`);
      return null;
    }

    const ctx = texture.getContext('2d')!;
    const textureColumn = Math.floor(column % this.textureWidth);

    return ctx.getImageData(textureColumn, 0, 1, this.textureHeight);
  }

  public getTextureWidth(): number {
    return this.textureWidth;
  }

  public getTextureHeight(): number {
    return this.textureHeight;
  }
}
