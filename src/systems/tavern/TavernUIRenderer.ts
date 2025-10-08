import { GameState } from '../../types/GameTypes';
import { TavernStateContext } from '../../types/TavernTypes';
import { Character } from '../../entities/Character';
import { StatusPanel } from '../../ui/StatusPanel';

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
      this.statusPanel = new StatusPanel(ctx.canvas, 10, 80, 240, 480);
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
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(10, 10, ctx.canvas.width - 20, 60);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, ctx.canvas.width - 20, 60);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GILGAMESH\'S TAVERN', ctx.canvas.width / 2, 45);
  }

  private renderMainArea(ctx: CanvasRenderingContext2D, stateContext: TavernStateContext): void {
    const mainX = 260;
    const mainY = 80;
    const mainWidth = 500;
    const mainHeight = 400;

    this.drawPanel(ctx, mainX, mainY, mainWidth, mainHeight);

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
      case 'divvyGold':
        this.renderDivvyGold(ctx, mainX, mainY, mainWidth, mainHeight);
        break;
      case 'confirmDivvy':
        this.renderConfirmDivvy(ctx, mainX, mainY, mainWidth, mainHeight);
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

    ctx.fillStyle = '#4a4';
    ctx.font = '16px monospace';
    ctx.fillText('Services Available:', x + width / 2, y + 140);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    const services = [
      'Add characters to your active party',
      'Remove characters from your party',
      'Distribute gold evenly among party members'
    ];

    services.forEach((service, index) => {
      ctx.fillText(`• ${service}`, x + width / 2, y + 170 + index * 25);
    });

    ctx.fillStyle = '#ffa500';
    ctx.font = '12px monospace';
    ctx.fillText('All services are free of charge!', x + width / 2, y + 280);

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
    ctx.fillText('UP/DOWN to select, ENTER to confirm, ESC to cancel', x + width / 2, y + 70);

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
    ctx.fillText('UP/DOWN to select, ENTER to confirm, ESC to cancel', x + width / 2, y + 70);

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

  private renderActionMenu(ctx: CanvasRenderingContext2D, stateContext: TavernStateContext): void {
    const menuX = 770;
    const menuY = 80;
    const menuWidth = 240;
    const menuHeight = 300;

    this.drawPanel(ctx, menuX, menuY, menuWidth, menuHeight);

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
        'Divvy Gold',
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
      ctx.fillText('UP/DOWN: Select | ENTER: Choose', menuX + menuWidth / 2, menuY + menuHeight - 15);
    } else {
      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';

      if (stateContext.currentState === 'addCharacter' || stateContext.currentState === 'removeCharacter') {
        ctx.fillText('1-9: Select | ENTER: Confirm', menuX + menuWidth / 2, menuY + menuHeight - 30);
        ctx.fillText('ESC: Back to Main', menuX + menuWidth / 2, menuY + menuHeight - 15);
      } else if (stateContext.currentState === 'divvyGold') {
        ctx.fillText('Y: Confirm | N: Cancel', menuX + menuWidth / 2, menuY + menuHeight - 15);
      } else if (stateContext.currentState === 'confirmDivvy') {
        ctx.fillText('ENTER: Continue', menuX + menuWidth / 2, menuY + menuHeight - 15);
      }
    }
  }

  private drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
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
