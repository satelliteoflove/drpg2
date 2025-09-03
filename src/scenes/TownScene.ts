import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';

export class TownScene extends Scene {
  private sceneManager: SceneManager;
  private selectedOption: number = 0;
  private menuOptions: string[] = [
    'Boltac\'s Trading Post',
    'Temple',
    'Inn',
    'Return to Dungeon'
  ];

  constructor(_gameState: GameState, sceneManager: SceneManager) {
    super('Town');
    this.sceneManager = sceneManager;
  }

  public enter(): void {
    this.selectedOption = 0;
  }

  public exit(): void {}

  public update(_deltaTime: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TOWN OF LLYLGAMYN', ctx.canvas.width / 2, 80);

    ctx.font = '16px monospace';
    ctx.fillText('Welcome to the castle town!', ctx.canvas.width / 2, 120);

    const startY = 200;
    const lineHeight = 50;

    this.menuOptions.forEach((option, index) => {
      const y = startY + index * lineHeight;

      if (index === this.selectedOption) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('> ' + option + ' <', ctx.canvas.width / 2, y);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillText(option, ctx.canvas.width / 2, y);
      }
    });

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    if (this.selectedOption === 0) {
      ctx.fillText('Buy, sell, and identify items. Pool your gold for better purchases.', 50, 420);
    } else if (this.selectedOption === 1) {
      ctx.fillText('Heal your party and remove curses (not yet available)', 50, 420);
    } else if (this.selectedOption === 2) {
      ctx.fillText('Rest and recover your party (not yet available)', 50, 420);
    } else {
      ctx.fillText('Return to the dungeon depths', 50, 420);
    }

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to choose, ESC to return to dungeon',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      ctx.fillStyle = '#fff';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TOWN OF LLYLGAMYN', ctx.canvas.width / 2, 80);

      ctx.font = '16px monospace';
      ctx.fillText('Welcome to the castle town!', ctx.canvas.width / 2, 120);

      const startY = 200;
      const lineHeight = 50;

      this.menuOptions.forEach((option, index) => {
        const y = startY + index * lineHeight;

        if (index === this.selectedOption) {
          ctx.fillStyle = '#ffaa00';
          ctx.fillText('> ' + option + ' <', ctx.canvas.width / 2, y);
        } else {
          ctx.fillStyle = '#fff';
          ctx.fillText(option, ctx.canvas.width / 2, y);
        }
      });

      ctx.fillStyle = '#aaa';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';

      if (this.selectedOption === 0) {
        ctx.fillText('Buy, sell, and identify items. Pool your gold for better purchases.', 50, 420);
      } else if (this.selectedOption === 1) {
        ctx.fillText('Heal your party and remove curses (not yet available)', 50, 420);
      } else if (this.selectedOption === 2) {
        ctx.fillText('Rest and recover your party (not yet available)', 50, 420);
      } else {
        ctx.fillText('Return to the dungeon depths', 50, 420);
      }

      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        'UP/DOWN to select, ENTER to choose, ESC to return to dungeon',
        ctx.canvas.width / 2,
        ctx.canvas.height - 20
      );
    });
  }

  public handleInput(key: string): boolean {
    switch (key) {
      case 'arrowup':
      case 'w':
        this.selectedOption = Math.max(0, this.selectedOption - 1);
        return true;

      case 'arrowdown':
      case 's':
        this.selectedOption = Math.min(this.menuOptions.length - 1, this.selectedOption + 1);
        return true;

      case 'enter':
      case ' ':
        this.selectCurrentOption();
        return true;

      case 'escape':
        this.sceneManager.switchTo('dungeon');
        return true;
    }
    return false;
  }

  private selectCurrentOption(): void {
    switch (this.selectedOption) {
      case 0: // Boltac's Trading Post
        this.sceneManager.switchTo('shop');
        break;
        
      case 1: // Temple
        console.log('Temple not yet implemented');
        break;
        
      case 2: // Inn
        console.log('Inn not yet implemented');
        break;
        
      case 3: // Return to Dungeon
        this.sceneManager.switchTo('dungeon');
        break;
    }
  }
}