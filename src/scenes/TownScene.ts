import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { MenuInputHandler } from '../ui/components/MenuInputHandler';
import { GameState } from '../types/GameTypes';
import { Character } from '../entities/Character';

export class TownScene extends Scene {
  private sceneManager: SceneManager;
  private gameState: GameState;
  private selectedOption: number = 0;
  private menuOptions: string[] = ["Boltac's Trading Post", 'Temple', 'Inn', "Gilgamesh's Tavern", 'Training Grounds', 'Explore the Dungeon'];

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Town');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
  }

  private drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }

  public enter(): void {
    this.selectedOption = 0;
  }

  public exit(): void {
  }

  public update(_deltaTime: number): void {
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderTownHeader(ctx);
    this.renderGoldDisplay(ctx);
    this.renderMainMenu(ctx);
    this.renderControls(ctx);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      this.renderTownHeader(ctx);
      this.renderGoldDisplay(ctx);
      this.renderMainMenu(ctx);
      this.renderControls(ctx);
    });
  }

  private renderTownHeader(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TOWN OF LLYLGAMYN', ctx.canvas.width / 2, 40);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, ctx.canvas.width - 20, 50);
  }

  private renderGoldDisplay(ctx: CanvasRenderingContext2D): void {
    const pooledGold = this.gameState.party.pooledGold || 0;
    const partyGold = this.gameState.party.characters?.reduce((sum: number, char: Character) => sum + char.gold, 0) || 0;

    ctx.fillStyle = '#ffa500';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Pooled: ${pooledGold}g | Party: ${partyGold}g`, ctx.canvas.width - 20, 40);
  }

  private renderMainMenu(ctx: CanvasRenderingContext2D): void {
    const menuY = 120;
    const menuHeight = 450;

    this.drawPanel(ctx, 100, menuY, 600, menuHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';

    this.menuOptions.forEach((option, index) => {
      const y = menuY + 60 + index * 60;
      const isSelected = index === this.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(120, y - 25, 560, 40);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 18px monospace' : '18px monospace';
      ctx.fillText(option, 140, y);

      if (isSelected) {
        ctx.fillText('>', 125, y);
      }
    });
  }


  private renderControls(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to choose',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  public handleInput(key: string): boolean {
    const normalizedKey = key.toLowerCase();

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
      }
    );

    return action.type !== 'none';
  }

  private selectCurrentOption(): void {
    switch (this.selectedOption) {
      case 0: // Boltac's Trading Post
        this.sceneManager.switchTo('shop');
        break;

      case 1: // Temple
        this.sceneManager.switchTo('temple');
        break;

      case 2: // Inn
        this.sceneManager.switchTo('inn');
        break;

      case 3: // Gilgamesh's Tavern
        this.sceneManager.switchTo('tavern');
        break;

      case 4: // Training Grounds
        this.sceneManager.switchTo('training_grounds');
        break;

      case 5:
        const livingCharacters = this.gameState.party.characters.filter(
          (c: Character) => !c.isDead && c.status === 'OK'
        );

        if (livingCharacters.length === 0) {
          if (this.gameState.messageLog?.add) {
            this.gameState.messageLog.add('You need at least one living party member to enter the dungeon!');
          }
        } else {
          this.sceneManager.switchTo('dungeon');
        }
        break;
    }
  }
}
