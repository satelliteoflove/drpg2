import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { SaveManager } from '../utils/SaveManager';
import { MenuInputHandler } from '../ui/components/MenuInputHandler';
import { DebugLogger } from '../utils/DebugLogger';
import { GameServices } from '../services/GameServices';
import { SCENE_AUDIO } from '../config/AudioConstants';

export class MainMenuScene extends Scene {
  private sceneManager: SceneManager;
  private selectedOption: number = 0;
  private menuOptions: string[] = [];

  constructor(_gameState: GameState, sceneManager: SceneManager) {
    super('MainMenu');
    this.sceneManager = sceneManager;
    this.updateMenuOptions();
  }

  public enter(): void {
    this.updateMenuOptions();
    this.selectedOption = 0;
    const config = SCENE_AUDIO['mainMenu'];
    if (config?.music) {
      GameServices.getInstance().getAudioManager().playMusic(config.music, {
        volumeMultiplier: config.musicVolume
      });
    }
  }

  public exit(): void {}

  public update(_deltaTime: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderTitle(ctx);
    this.renderMenu(ctx);
    this.renderFooter(ctx);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      // Save and restore context to ensure clean state
      ctx.save();
      this.renderTitle(ctx);
      ctx.restore();

      ctx.save();
      this.renderMenu(ctx);
      ctx.restore();

      ctx.save();
      this.renderFooter(ctx);
      ctx.restore();
    });
  }

  private renderTitle(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DRPG2', ctx.canvas.width / 2, 150);

    ctx.fillStyle = '#aaa';
    ctx.font = '20px monospace';
    ctx.fillText('A Wizardry-like Dungeon Crawler', ctx.canvas.width / 2, 180);
  }

  private renderMenu(ctx: CanvasRenderingContext2D): void {
    const startY = 280;
    const lineHeight = 50;

    if (this.menuOptions.length === 0) {
      DebugLogger.warn('MainMenuScene', 'No menu options available');
      this.updateMenuOptions();
    }

    ctx.textAlign = 'center';
    ctx.font = '24px monospace';

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
  }

  private renderFooter(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Use UP/DOWN arrows to navigate, ENTER to select',
      ctx.canvas.width / 2,
      ctx.canvas.height - 50
    );
    ctx.fillText('ESC to quit game', ctx.canvas.width / 2, ctx.canvas.height - 30);
  }

  private updateMenuOptions(): void {
    this.menuOptions = ['New Game'];

    if (SaveManager.hasSave()) {
      this.menuOptions.push('Continue Game');
    }

    this.menuOptions.push('Exit');
  }

  public handleInput(key: string): boolean {
    // Handle both 'enter' and 'Enter' key formats
    const normalizedKey = key.toLowerCase();

    // Use MenuInputHandler for navigation
    const action = MenuInputHandler.handleMenuInput(
      normalizedKey,
      {
        selectedIndex: this.selectedOption,
        maxIndex: this.menuOptions.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.selectCurrentOption();
        },
        onCancel: () => {
          if (window.confirm('Are you sure you want to quit?')) {
            window.close();
          }
        },
      }
    );

    return action.type !== 'none';
  }

  private selectCurrentOption(): void {
    const selectedText = this.menuOptions[this.selectedOption];

    switch (selectedText) {
      case 'New Game':
        SaveManager.deleteSave();
        this.sceneManager.switchTo('new_game');
        break;

      case 'Continue Game':
        this.sceneManager.switchTo('town');
        break;

      case 'Exit':
        if (window.confirm('Are you sure you want to quit?')) {
          window.close();
        }
        break;
    }
  }
}
