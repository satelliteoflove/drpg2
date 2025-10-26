import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';

export class NewGameScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private seedInput: string;
  private cursorPosition: number;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('New Game');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.seedInput = GAME_CONFIG.DUNGEON.DEFAULT_SEED;
    this.cursorPosition = this.seedInput.length;
  }

  public enter(): void {
    this.seedInput = GAME_CONFIG.DUNGEON.DEFAULT_SEED;
    this.cursorPosition = this.seedInput.length;
  }

  public exit(): void {}

  public update(_deltaTime: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENTER DUNGEON SEED', ctx.canvas.width / 2, 150);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('The seed determines the dungeon layout', ctx.canvas.width / 2, 200);
    ctx.fillText('Same seed = same dungeon', ctx.canvas.width / 2, 225);

    const inputBoxX = ctx.canvas.width / 2 - 200;
    const inputBoxY = 280;
    const inputBoxWidth = 400;
    const inputBoxHeight = 50;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight);
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.strokeRect(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(this.seedInput, inputBoxX + 10, inputBoxY + 33);

    const textWidth = ctx.measureText(this.seedInput.substring(0, this.cursorPosition)).width;
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(inputBoxX + 10 + textWidth, inputBoxY + 10, 2, 30);

    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Type to edit seed', ctx.canvas.width / 2, 400);
    ctx.fillText('ENTER to start game | ESC to go back', ctx.canvas.width / 2, 425);
    ctx.fillText('Use LEFT/RIGHT arrows to move cursor | BACKSPACE to delete', ctx.canvas.width / 2, 450);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      ctx.save();
      this.renderContent(ctx);
      ctx.restore();
    });
  }

  private renderContent(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENTER DUNGEON SEED', ctx.canvas.width / 2, 150);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('The seed determines the dungeon layout', ctx.canvas.width / 2, 200);
    ctx.fillText('Same seed = same dungeon', ctx.canvas.width / 2, 225);

    const inputBoxX = ctx.canvas.width / 2 - 200;
    const inputBoxY = 280;
    const inputBoxWidth = 400;
    const inputBoxHeight = 50;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight);
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.strokeRect(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(this.seedInput, inputBoxX + 10, inputBoxY + 33);

    const textWidth = ctx.measureText(this.seedInput.substring(0, this.cursorPosition)).width;
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(inputBoxX + 10 + textWidth, inputBoxY + 10, 2, 30);

    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Type to edit seed', ctx.canvas.width / 2, 400);
    ctx.fillText('ENTER to start game | ESC to go back', ctx.canvas.width / 2, 425);
    ctx.fillText('Use LEFT/RIGHT arrows to move cursor | BACKSPACE to delete', ctx.canvas.width / 2, 450);
  }

  public handleInput(key: string): boolean {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey === 'enter') {
      this.confirmSeed();
      return true;
    }

    if (normalizedKey === 'escape') {
      this.sceneManager.switchTo('main_menu');
      return true;
    }

    if (normalizedKey === 'backspace') {
      if (this.cursorPosition > 0) {
        this.seedInput =
          this.seedInput.substring(0, this.cursorPosition - 1) +
          this.seedInput.substring(this.cursorPosition);
        this.cursorPosition--;
      }
      return true;
    }

    if (normalizedKey === 'arrowleft' || normalizedKey === 'left') {
      if (this.cursorPosition > 0) {
        this.cursorPosition--;
      }
      return true;
    }

    if (normalizedKey === 'arrowright' || normalizedKey === 'right') {
      if (this.cursorPosition < this.seedInput.length) {
        this.cursorPosition++;
      }
      return true;
    }

    if (normalizedKey === 'home') {
      this.cursorPosition = 0;
      return true;
    }

    if (normalizedKey === 'end') {
      this.cursorPosition = this.seedInput.length;
      return true;
    }

    if (key.length === 1 && this.isValidSeedCharacter(key)) {
      this.seedInput =
        this.seedInput.substring(0, this.cursorPosition) +
        key +
        this.seedInput.substring(this.cursorPosition);
      this.cursorPosition++;
      return true;
    }

    return false;
  }

  private isValidSeedCharacter(char: string): boolean {
    return /^[a-zA-Z0-9\-_]$/.test(char);
  }

  private confirmSeed(): void {
    this.gameState.dungeonSeed = this.seedInput;

    if ((window as any).game?.instance?.resetGame) {
      (window as any).game.instance.resetGame();
    }

    this.sceneManager.switchTo('town');
  }
}
