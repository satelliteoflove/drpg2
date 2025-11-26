import { GameState } from '../../types/GameTypes';
import { TavernStateContext } from '../../types/TavernTypes';
import { Character } from '../../entities/Character';
import { StatusPanel } from '../../ui/StatusPanel';
import { UIRenderingUtils } from '../../utils/UIRenderingUtils';
import { UI_CONSTANTS } from '../../config/UIConstants';
import { KeyBindingHelper } from '../../config/KeyBindings';

export class TavernUIRenderer {
  private gameState: GameState;
  private messageLog: any;
  private statusPanel: StatusPanel | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor(gameState: GameState, messageLog: any) {
    this.gameState = gameState;
    this.messageLog = messageLog;
  }

  public render(ctx: CanvasRenderingContext2D, stateContext: TavernStateContext): void {
    if (!this.canvas) {
      this.canvas = ctx.canvas;
      this.statusPanel = new StatusPanel(
        UI_CONSTANTS.LAYOUT.STATUS_PANEL_X,
        UI_CONSTANTS.LAYOUT.STATUS_PANEL_Y,
        UI_CONSTANTS.LAYOUT.STATUS_PANEL_WIDTH,
        UI_CONSTANTS.LAYOUT.STATUS_PANEL_HEIGHT
      );
    }

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderHeader(ctx);

    if (this.statusPanel) {
      this.statusPanel.render(this.gameState.party, ctx);
    }

    this.renderMainArea(ctx, stateContext);
    this.renderActionMenu(ctx, stateContext);

    if (this.messageLog) {
      this.messageLog.render(ctx);
    }
  }

  private renderHeader(ctx: CanvasRenderingContext2D): void {
    UIRenderingUtils.renderHeader(ctx, {
      title: 'GILGAMESH\'S TAVERN',
      showGold: false
    });
  }

  private renderMainArea(ctx: CanvasRenderingContext2D, stateContext: TavernStateContext): void {
    const mainX = UI_CONSTANTS.LAYOUT.MAIN_CONTENT_X;
    const mainY = UI_CONSTANTS.LAYOUT.MAIN_CONTENT_Y;
    const mainWidth = UI_CONSTANTS.LAYOUT.MAIN_CONTENT_WIDTH;
    const mainHeight = UI_CONSTANTS.LAYOUT.MAIN_CONTENT_HEIGHT;

    UIRenderingUtils.drawPanel(ctx, mainX, mainY, mainWidth, mainHeight);

    switch (stateContext.currentState) {
      case 'main':
        this.renderWelcomeScreen(ctx, mainX, mainY, mainWidth, mainHeight);
        break;
      case 'addCharacter':
        this.renderAddCharacter(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'removeCharacter':
        this.renderRemoveCharacter(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'reorderParty':
        this.renderReorderParty(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'divvyGold':
        this.renderDivvyGold(ctx, mainX, mainY, mainWidth, mainHeight);
        break;
      case 'confirmDivvy':
        this.renderConfirmDivvy(ctx, mainX, mainY, mainWidth, mainHeight);
        break;
      case 'inspectSelectCharacter':
        this.renderInspectSelectCharacter(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
    }
  }

  private renderWelcomeScreen(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome to Gilgamesh\'s Tavern!', x + width / 2, y + 60);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Gather your party and prepare for adventure', x + width / 2, y + 90);

    const roster = this.gameState.characterRoster as Character[];
    const availableCharacters = roster.filter((c: Character) => !c.isDead);
    const partySize = this.gameState.party.characters.length;

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText(`Party: ${partySize}/6 | Available characters: ${availableCharacters.length}`, x + width / 2, y + 320);
  }

  private renderAddCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TavernStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ADD CHARACTER TO PARTY', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(KeyBindingHelper.getSelectConfirmEscDisplay('Cancel'), x + width / 2, y + 70);

    const roster = this.gameState.characterRoster as Character[];
    const party = this.gameState.party.characters;

    if (party.length >= 6) {
      ctx.fillStyle = '#a44';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Party is full! (Maximum 6 characters)', x + width / 2, y + 150);
      return;
    }

    const availableCharacters = roster.filter((char: Character) => {
      if (char.isDead) return false;
      if (party.find((p: Character) => p.id === char.id)) return false;
      return true;
    });

    if (availableCharacters.length === 0) {
      ctx.fillStyle = '#666';
      ctx.fillText('No available characters in roster', x + width / 2, y + 150);
      return;
    }

    ctx.textAlign = 'left';
    let yPos = y + 110;

    availableCharacters.forEach((char: Character, index: number) => {
      const isSelected = index === stateContext.selectedRosterIndex;
      const isCompatible = this.isAlignmentCompatible(char, party);

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 25);
      }

      ctx.fillStyle = !isCompatible ? '#666' : isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';

      if (isSelected) {
        ctx.fillText('>', x + 50, yPos);
      }

      ctx.fillText(`${char.name}`, x + 70, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = !isCompatible ? '#844' : '#aaa';
      ctx.fillText(`${char.class} Lv${char.level} | ${char.alignment}`, x + 200, yPos);

      if (!isCompatible) {
        ctx.fillStyle = '#a44';
        ctx.fillText('INCOMPATIBLE', x + 380, yPos);
      }

      yPos += 30;
    });
  }

  private renderRemoveCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TavernStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('REMOVE CHARACTER FROM PARTY', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(KeyBindingHelper.getSelectConfirmEscDisplay('Cancel'), x + width / 2, y + 70);

    const party = this.gameState.party.characters;

    if (party.length === 0) {
      ctx.fillStyle = '#666';
      ctx.fillText('No characters in party', x + width / 2, y + 150);
      return;
    }

    ctx.textAlign = 'left';
    let yPos = y + 110;

    party.forEach((char: Character, index: number) => {
      const isSelected = index === stateContext.selectedPartyIndex;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 25);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';

      if (isSelected) {
        ctx.fillText('>', x + 50, yPos);
      }

      ctx.fillText(`${char.name}`, x + 70, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${char.class} Lv${char.level} | ${char.gold}g`, x + 200, yPos);

      yPos += 30;
    });
  }

  private renderDivvyGold(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DIVVY GOLD', x + width / 2, y + 40);

    const party = this.gameState.party.characters;

    if (party.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px monospace';
      ctx.fillText('No party members to distribute gold', x + width / 2, y + 150);
      return;
    }

    const totalGold = party.reduce((sum: number, char: Character) => sum + char.gold, 0);
    const sharePerMember = Math.floor(totalGold / party.length);
    const remainder = totalGold % party.length;

    ctx.font = '14px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('Redistribute all party gold evenly?', x + width / 2, y + 100);

    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`Total gold: ${totalGold}g`, x + width / 2, y + 150);
    ctx.fillText(`Each member gets: ${sharePerMember}g`, x + width / 2, y + 180);

    if (remainder > 0) {
      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`(${party[0].name} receives ${remainder}g extra remainder)`, x + width / 2, y + 210);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('Y: Confirm | N: Cancel', x + width / 2, y + 280);
  }

  private renderConfirmDivvy(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): void {
    ctx.fillStyle = '#4a4';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Gold Distributed!', x + width / 2, y + 150);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText('Press ENTER to continue', x + width / 2, y + 200);
  }

  private renderReorderParty(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TavernStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('REORDER PARTY', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(KeyBindingHelper.buildControlLine('LEFT/RIGHT: Move', `${KeyBindingHelper.getMenuNavigationDisplay()}: Select`, `${KeyBindingHelper.getConfirmKeyDisplay()}/${KeyBindingHelper.getCancelKeyDisplay()}: Finish`), x + width / 2, y + 70);

    const party = this.gameState.party.characters;

    if (party.length <= 1) {
      ctx.fillStyle = '#666';
      ctx.fillText('Need at least 2 characters to reorder', x + width / 2, y + 150);
      return;
    }

    ctx.textAlign = 'left';
    let yPos = y + 110;

    party.forEach((char: Character, index: number) => {
      const isSelected = index === stateContext.selectedPartyIndex;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 25);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';

      ctx.fillText(`${index + 1}.`, x + 50, yPos);

      if (isSelected) {
        ctx.fillText('>', x + 80, yPos);
      }

      ctx.fillText(`${char.name}`, x + 100, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${char.class} Lv${char.level}`, x + 250, yPos);

      yPos += 30;
    });
  }

  private renderInspectSelectCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TavernStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CHARACTER TO INSPECT', x + width / 2, y + 45);

    const party = this.gameState.party.characters;

    if (party.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px monospace';
      ctx.fillText('No characters in party', x + width / 2, y + 150);
      return;
    }

    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    const charStartY = y + 100;
    const lineHeight = 35;

    party.forEach((character: Character, index: number) => {
      const yPos = charStartY + index * lineHeight;
      const isSelected = index === stateContext.selectedPartyIndex;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 20, yPos - 20, width - 40, 30);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';

      const prefix = isSelected ? '>' : ' ';
      ctx.fillText(`${prefix} ${index + 1}. ${character.name}`, x + 30, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`(${character.class})`, x + 200, yPos);

      const hpColor = character.hp > character.maxHp * 0.5 ? '#00ff00' : character.hp > character.maxHp * 0.25 ? '#ffaa00' : '#ff0000';
      ctx.fillStyle = hpColor;
      ctx.fillText(`HP: ${character.hp}/${character.maxHp}`, x + 330, yPos);
    });

    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(KeyBindingHelper.getSelectConfirmEscDisplay('Cancel'), x + width / 2, y + 450);
  }

  private renderActionMenu(ctx: CanvasRenderingContext2D, stateContext: TavernStateContext): void {
    const menuX = UI_CONSTANTS.LAYOUT.ACTION_MENU_X;
    const menuY = UI_CONSTANTS.LAYOUT.ACTION_MENU_Y;
    const menuWidth = UI_CONSTANTS.LAYOUT.ACTION_MENU_WIDTH;
    const menuHeight = UI_CONSTANTS.LAYOUT.ACTION_MENU_HEIGHT;

    UIRenderingUtils.drawPanel(ctx, menuX, menuY, menuWidth, menuHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TAVERN SERVICES', menuX + menuWidth / 2, menuY + 25);

    if (stateContext.currentState === 'main') {
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';

      const options = [
        'Add Character to Party',
        'Remove Character from Party',
        'Reorder Party',
        'Divvy Gold',
        'Inspect Character',
        'Leave'
      ];

      const startY = menuY + 60;
      options.forEach((option, index) => {
        const y = startY + index * 35;
        const isSelected = index === stateContext.selectedMenuOption;

        if (isSelected) {
          ctx.fillStyle = '#333';
          ctx.fillRect(menuX + 10, y - 15, menuWidth - 20, 25);
        }

        ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
        ctx.font = isSelected ? 'bold 12px monospace' : '12px monospace';
        ctx.fillText(`${index + 1}. ${option}`, menuX + 20, y);
      });

      ctx.fillStyle = '#666';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(KeyBindingHelper.getMenuControlsDisplay(), menuX + menuWidth / 2, menuY + menuHeight - 15);
    } else {
      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';

      if (stateContext.currentState === 'addCharacter' || stateContext.currentState === 'removeCharacter' || stateContext.currentState === 'inspectSelectCharacter') {
        ctx.fillText('1-9: Select | ENTER: Confirm', menuX + menuWidth / 2, menuY + menuHeight - 30);
        ctx.fillText('ESC: Back to Main', menuX + menuWidth / 2, menuY + menuHeight - 15);
      } else if (stateContext.currentState === 'reorderParty') {
        ctx.fillText('LEFT/RIGHT: Move Position', menuX + menuWidth / 2, menuY + menuHeight - 30);
        ctx.fillText('ENTER/ESC: Done', menuX + menuWidth / 2, menuY + menuHeight - 15);
      } else if (stateContext.currentState === 'divvyGold') {
        ctx.fillText('Y: Confirm | N: Cancel', menuX + menuWidth / 2, menuY + menuHeight - 15);
      } else if (stateContext.currentState === 'confirmDivvy') {
        ctx.fillText('ENTER: Continue', menuX + menuWidth / 2, menuY + menuHeight - 15);
      }
    }
  }

  private isAlignmentCompatible(character: Character, party: Character[]): boolean {
    if (party.length === 0) return true;

    const newAlign = character.alignment;

    for (const member of party) {
      const memberAlign = member.alignment;

      if (newAlign === 'Good' && memberAlign === 'Evil') {
        return false;
      }
      if (newAlign === 'Evil' && memberAlign === 'Good') {
        return false;
      }
    }

    return true;
  }
}
