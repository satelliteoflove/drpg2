import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { MenuInputHandler } from '../ui/components/MenuInputHandler';
import { GameState } from '../types/GameTypes';
import { Character } from '../entities/Character';

export class TownScene extends Scene {
  private sceneManager: SceneManager;
  private gameState: GameState;
  private selectedOption: number = 0;
  private menuOptions: string[] = ["Boltac's Trading Post", 'Temple', 'Inn', 'Return to Dungeon'];

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
    const menuHeight = 280;

    this.drawPanel(ctx, 100, menuY, 600, menuHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';

    this.menuOptions.forEach((option, index) => {
      const y = menuY + 50 + index * 60;
      const isSelected = index === this.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(120, y - 25, 560, 35);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 18px monospace' : '18px monospace';
      ctx.fillText(option, 140, y);

      if (isSelected) {
        ctx.fillText('>', 125, y);
      }
    });

    // Description panel
    this.drawPanel(ctx, 100, 420, 600, 80);
    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';

    const descriptions = [
      'Buy, sell, and identify items. Pool your gold for better purchases.',
      'Heal your party and remove curses (not yet available)',
      'Rest and recover your party. Apply pending level ups.',
      'Return to the dungeon depths'
    ];

    ctx.fillText(descriptions[this.selectedOption], ctx.canvas.width / 2, 460);

    // Party status panel
    this.renderPartyStatus(ctx);
  }

  private renderPartyStatus(ctx: CanvasRenderingContext2D): void {
    const partyY = 520;
    const partyHeight = 150;

    this.drawPanel(ctx, 100, partyY, 600, partyHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    if (!this.gameState.party.characters || this.gameState.party.characters.length === 0) {
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No party members', ctx.canvas.width / 2, partyY + 75);
      return;
    }

    const characters = this.gameState.party.characters.slice(0, 3);
    characters.forEach((char: Character, index: number) => {
      const x = 130 + index * 190;
      const y = partyY + 30;

      ctx.fillStyle = char.isDead ? '#666' : '#fff';
      ctx.fillText(char.name, x, y);

      ctx.font = '12px monospace';
      ctx.fillStyle = char.isDead ? '#444' : '#aaa';
      ctx.fillText(`${char.class} Lv${char.level}`, x, y + 20);

      if (!char.isDead) {
        ctx.fillStyle = '#4a4';
        ctx.fillText(`HP: ${char.hp}/${char.maxHp}`, x, y + 40);

        if (char.maxMp > 0) {
          ctx.fillStyle = '#44a';
          ctx.fillText(`MP: ${char.mp}/${char.maxMp}`, x, y + 60);
        }

        ctx.fillStyle = '#aa0';
        ctx.fillText(`Gold: ${char.gold}`, x, y + 80);
      } else {
        ctx.fillStyle = '#a44';
        ctx.fillText('DEAD', x, y + 40);
      }

      ctx.font = '14px monospace';
    });
  }

  private renderControls(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to choose, ESC to return to dungeon',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  public handleInput(key: string): boolean {
    // Normalize key to lowercase
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
        onCancel: () => {
          this.sceneManager.switchTo('dungeon');
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
        console.log('Temple not yet implemented');
        break;

      case 2: // Inn
        this.sceneManager.switchTo('inn');
        break;

      case 3: // Return to Dungeon
        this.sceneManager.switchTo('dungeon');
        break;
    }
  }
}
