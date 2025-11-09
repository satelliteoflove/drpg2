import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { MenuInputHandler } from '../ui/components/MenuInputHandler';
import { DungeonMovementHandler } from '../systems/dungeon/DungeonMovementHandler';
import { UIRenderingUtils } from '../utils/UIRenderingUtils';

type CampState = 'menu' | 'selectCharacter';

export class CampMenuScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private messageLog: any;
  private state: CampState = 'menu';
  private selectedMenuOption: number = 0;
  private selectedCharacterIndex: number = 0;

  private menuOptions: string[] = [
    'Inspect Character',
    'Rest',
    'Cast Spells',
    'Return to Exploration',
  ];

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Camp');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = this.gameState.messageLog;
  }

  public enter(): void {
    this.state = 'menu';
    this.selectedMenuOption = 0;
    this.selectedCharacterIndex = 0;
  }

  public exit(): void {
  }

  public update(_deltaTime: number): void {
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (this.state === 'menu') {
      this.renderCampMenu(ctx);
    } else if (this.state === 'selectCharacter') {
      this.renderCharacterSelection(ctx);
    }
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      if (this.state === 'menu') {
        this.renderCampMenu(ctx);
      } else if (this.state === 'selectCharacter') {
        this.renderCharacterSelection(ctx);
      }
    });
  }

  private renderCampMenu(ctx: CanvasRenderingContext2D): void {
    const panelX = (ctx.canvas.width - 500) / 2;
    const panelY = (ctx.canvas.height - 350) / 2;
    const panelWidth = 500;
    const panelHeight = 350;

    UIRenderingUtils.drawPanel(ctx, panelX, panelY, panelWidth, panelHeight);

    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CAMP MENU', panelX + panelWidth / 2, panelY + 45);

    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    const menuStartY = panelY + 100;
    const lineHeight = 50;

    this.menuOptions.forEach((option, index) => {
      const y = menuStartY + index * lineHeight;
      const isSelected = index === this.selectedMenuOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(panelX + 20, y - 20, panelWidth - 40, 40);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';

      const prefix = isSelected ? '>' : ' ';
      ctx.fillText(`${prefix} ${index + 1}. ${option}`, panelX + 30, y);

      if (option === 'Cast Spells') {
        ctx.fillStyle = '#666';
        ctx.font = '11px monospace';
        ctx.fillText('(Not yet implemented)', panelX + 220, y);
      }
    });

    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Arrow Keys: Navigate | Enter: Select | ESC: Return to Dungeon', panelX + panelWidth / 2, panelY + panelHeight - 20);
  }

  private renderCharacterSelection(ctx: CanvasRenderingContext2D): void {
    const panelX = (ctx.canvas.width - 600) / 2;
    const panelY = (ctx.canvas.height - 400) / 2;
    const panelWidth = 600;
    const panelHeight = 400;

    UIRenderingUtils.drawPanel(ctx, panelX, panelY, panelWidth, panelHeight);

    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CHARACTER TO INSPECT', panelX + panelWidth / 2, panelY + 45);

    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    const characters = this.gameState.party.characters;
    if (characters.length === 0) {
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No characters in party', panelX + panelWidth / 2, panelY + 150);
      return;
    }

    const charStartY = panelY + 100;
    const lineHeight = 40;

    characters.forEach((character: Character, index: number) => {
      const y = charStartY + index * lineHeight;
      const isSelected = index === this.selectedCharacterIndex;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(panelX + 20, y - 20, panelWidth - 40, 35);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';

      const prefix = isSelected ? '>' : ' ';
      const status = character.isDead ? '(DEAD)' : '';
      ctx.fillText(`${prefix} ${index + 1}. ${character.name}`, panelX + 30, y);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`(${character.class})`, panelX + 200, y);

      const hpColor = character.hp > character.maxHp * 0.5 ? '#00ff00' : character.hp > character.maxHp * 0.25 ? '#ffaa00' : '#ff0000';
      ctx.fillStyle = hpColor;
      ctx.fillText(`HP: ${character.hp}/${character.maxHp} ${status}`, panelX + 350, y);
    });

    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Arrow Keys: Select | Enter: Confirm | ESC: Cancel', panelX + panelWidth / 2, panelY + panelHeight - 20);
  }

  public handleInput(key: string): boolean {
    const normalizedKey = key.toLowerCase();

    if (this.state === 'menu') {
      return this.handleMenuInput(normalizedKey);
    } else if (this.state === 'selectCharacter') {
      return this.handleCharacterSelectionInput(normalizedKey);
    }

    return false;
  }

  private handleMenuInput(key: string): boolean {
    if (key === 'escape') {
      this.sceneManager.switchTo('dungeon');
      return true;
    }

    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.selectedMenuOption,
        maxIndex: this.menuOptions.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.selectedMenuOption = newIndex;
        },
        onConfirm: () => {
          this.selectMenuOption();
        },
      }
    );

    return action.type !== 'none';
  }

  private handleCharacterSelectionInput(key: string): boolean {
    if (key === 'escape') {
      this.state = 'menu';
      return true;
    }

    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.selectedCharacterIndex,
        maxIndex: this.gameState.party.characters.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.selectedCharacterIndex = newIndex;
        },
        onConfirm: () => {
          this.confirmCharacterSelection();
        },
      }
    );

    return action.type !== 'none';
  }

  private selectMenuOption(): void {
    switch (this.selectedMenuOption) {
      case 0:
        if (this.gameState.party.characters.length > 0) {
          this.state = 'selectCharacter';
          this.selectedCharacterIndex = 0;
        } else {
          this.messageLog?.add('No characters in party');
        }
        break;

      case 1:
        this.handleRest();
        break;

      case 2:
        this.messageLog?.add('Cast Spells feature not yet implemented');
        break;

      case 3:
        this.sceneManager.switchTo('dungeon');
        break;
    }
  }

  private confirmCharacterSelection(): void {
    const characterSheetScene = this.sceneManager.getScene('characterSheet') as any;
    if (characterSheetScene) {
      if (characterSheetScene.setCharacterIndex) {
        characterSheetScene.setCharacterIndex(this.selectedCharacterIndex);
      }
      if (characterSheetScene.setReturnScene) {
        characterSheetScene.setReturnScene('camp');
      }
    }
    this.sceneManager.switchTo('characterSheet');
  }

  private handleRest(): void {
    this.gameState.party.rest();
    this.messageLog?.add('Party rests and recovers some health and mana');

    const currentDungeon = this.gameState.dungeon[this.gameState.currentFloor - 1];
    if (currentDungeon) {
      const movementHandler = new DungeonMovementHandler(this.gameState, this.messageLog, this.sceneManager);
      const result = movementHandler.handleMovement('forward');

      if (result.triggered === 'combat') {
        this.messageLog?.add('Encounter!');
        this.sceneManager.switchTo('combat');
      } else {
        this.sceneManager.switchTo('dungeon');
      }
    } else {
      this.sceneManager.switchTo('dungeon');
    }
  }
}
