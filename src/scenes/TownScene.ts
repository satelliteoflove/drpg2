import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { MenuInputHandler } from '../ui/components/MenuInputHandler';
import { GameState } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { StatusPanel } from '../ui/StatusPanel';

export class TownScene extends Scene {
  private sceneManager: SceneManager;
  private gameState: GameState;
  private selectedOption: number = 0;
  private menuOptions: string[] = ["Boltac's Trading Post", 'Temple', 'Inn', "Gilgamesh's Tavern", 'Training Grounds', 'Explore the Dungeon'];
  private statusPanel: StatusPanel | null = null;
  private messageLog: any;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Town');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = this.gameState.messageLog;
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
    if (!this.statusPanel) {
      this.statusPanel = new StatusPanel(ctx.canvas, 10, 80, 240, 480);
    }

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderHeader(ctx);

    if (this.statusPanel) {
      this.statusPanel.render(this.gameState.party, ctx);
    }

    this.renderMainArea(ctx);
    this.renderActionMenu(ctx);

    if (this.messageLog) {
      this.messageLog.render(ctx);
    }
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager, mainContext } = renderContext;

    if (!this.statusPanel) {
      this.statusPanel = new StatusPanel(mainContext.canvas, 10, 80, 240, 480);
    }

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      this.renderHeader(ctx);

      if (this.statusPanel) {
        this.statusPanel.render(this.gameState.party, ctx);
      }

      this.renderMainArea(ctx);
      this.renderActionMenu(ctx);

      if (this.messageLog) {
        this.messageLog.render(ctx);
      }
    });
  }

  private renderHeader(ctx: CanvasRenderingContext2D): void {
    this.drawPanel(ctx, 10, 10, ctx.canvas.width - 20, 60);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TOWN OF LLYLGAMYN', ctx.canvas.width / 2, 45);

    const pooledGold = this.gameState.party.pooledGold || 0;
    const partyGold = this.gameState.party.characters?.reduce((sum: number, char: Character) => sum + char.gold, 0) || 0;

    ctx.fillStyle = '#ffa500';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Pooled: ${pooledGold}g | Party: ${partyGold}g`, ctx.canvas.width - 30, 45);
  }

  private renderMainArea(ctx: CanvasRenderingContext2D): void {
    const mainX = 260;
    const mainY = 80;
    const mainWidth = 500;
    const mainHeight = 480;

    this.drawPanel(ctx, mainX, mainY, mainWidth, mainHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome to Llylgamyn', mainX + mainWidth / 2, mainY + 60);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('The town offers various services for adventurers', mainX + mainWidth / 2, mainY + 100);
    ctx.fillText('Select a destination from the menu', mainX + mainWidth / 2, mainY + 130);

    const party = this.gameState.party.characters;
    const roster = this.gameState.characterRoster || [];
    const livingParty = party.filter((c: Character) => !c.isDead);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText(`Active Party: ${livingParty.length}/${party.length} alive`, mainX + mainWidth / 2, mainY + 300);
    ctx.fillText(`Character Roster: ${roster.length} total`, mainX + mainWidth / 2, mainY + 320);
  }

  private renderActionMenu(ctx: CanvasRenderingContext2D): void {
    const menuX = 770;
    const menuY = 80;
    const menuWidth = 240;
    const menuHeight = 480;

    this.drawPanel(ctx, menuX, menuY, menuWidth, menuHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TOWN SERVICES', menuX + menuWidth / 2, menuY + 25);

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    const startY = menuY + 60;
    this.menuOptions.forEach((option, index) => {
      const y = startY + index * 50;
      const isSelected = index === this.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(menuX + 10, y - 15, menuWidth - 20, 35);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 12px monospace' : '12px monospace';
      ctx.fillText(`${index + 1}. ${option}`, menuX + 20, y);
    });

    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UP/DOWN: Select | ENTER: Choose', menuX + menuWidth / 2, menuY + menuHeight - 15);
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
          (c: Character) => !c.isDead && c.statuses.length === 0
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
