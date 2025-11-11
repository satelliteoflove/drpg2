import { GameState } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { StatusPanel } from '../../ui/StatusPanel';
import { TempleStateContext, TempleService } from '../../types/TempleTypes';
import { TempleStateManager } from './TempleStateManager';
import { UIRenderingUtils } from '../../utils/UIRenderingUtils';
import { UI_CONSTANTS } from '../../config/UIConstants';

export class TempleUIRenderer {
  private gameState: GameState;
  private messageLog: any;
  private stateManager: TempleStateManager;
  private statusPanel: StatusPanel | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor(gameState: GameState, messageLog: any, stateManager: TempleStateManager) {
    this.gameState = gameState;
    this.messageLog = messageLog;
    this.stateManager = stateManager;
  }

  public render(ctx: CanvasRenderingContext2D, stateContext: TempleStateContext): void {
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
    this.renderServiceInfo(ctx, stateContext);

    if (this.messageLog) {
      this.messageLog.render(ctx);
    }
  }

  private renderHeader(ctx: CanvasRenderingContext2D): void {
    const partyGold = this.gameState.party.characters?.reduce((sum: number, char: Character) => sum + char.gold, 0) || 0;

    UIRenderingUtils.renderHeader(ctx, {
      title: 'TEMPLE OF DIVINE RESTORATION',
      showGold: true,
      partyGold
    });
  }

  private renderMainArea(ctx: CanvasRenderingContext2D, stateContext: TempleStateContext): void {
    const mainX = UI_CONSTANTS.LAYOUT.MAIN_CONTENT_X;
    const mainY = UI_CONSTANTS.LAYOUT.MAIN_CONTENT_Y;
    const mainWidth = UI_CONSTANTS.LAYOUT.MAIN_CONTENT_WIDTH;
    const mainHeight = UI_CONSTANTS.LAYOUT.MAIN_CONTENT_HEIGHT;

    UIRenderingUtils.drawPanel(ctx, mainX, mainY, mainWidth, mainHeight);

    switch (stateContext.currentState) {
      case 'main':
        this.renderWelcomeScreen(ctx, mainX, mainY, mainWidth, mainHeight);
        break;
      case 'selectService':
        this.renderServiceSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'selectCharacter':
        this.renderCharacterSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'selectPayer':
        this.renderPayerSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'confirmService':
        this.renderConfirmation(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'serviceResult':
        this.renderServiceResult(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
    }
  }

  private renderWelcomeScreen(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome to the Temple', x + width / 2, y + 60);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Divine power can heal what mortal means cannot', x + width / 2, y + 90);

    const charactersNeedingService = (this.gameState.party.characters || []).filter(
      (char: Character) => {
        return char.statuses.length > 0 || this.hasEquippedCursedItems(char);
      }
    );

    if (charactersNeedingService.length > 0) {
      ctx.fillStyle = '#fa0';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(
        `${charactersNeedingService.length} character(s) need temple services!`,
        x + width / 2,
        y + 380
      );
    }
  }

  private renderServiceSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TempleStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT SERVICE', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Choose the divine service you seek', x + width / 2, y + 70);

    const services: Array<{service: TempleService, name: string}> = [
      { service: 'cure_paralyzed', name: 'Cure Paralysis' },
      { service: 'cure_stoned', name: 'Cure Petrification' },
      { service: 'resurrect_dead', name: 'Resurrect from Dead' },
      { service: 'resurrect_ashes', name: 'Resurrect from Ashes' }
    ];

    ctx.textAlign = 'left';
    let yPos = y + 110;

    services.forEach((service, index) => {
      const isSelected = index === stateContext.selectedOption;
      const baseCost = this.stateManager.getBaseCost(service.service);
      const eligibleCharacters = this.stateManager.getCharactersNeedingService(service.service);
      const hasEligible = eligibleCharacters.length > 0;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 30);
      }

      ctx.fillStyle = !hasEligible ? '#666' : isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(`${service.name} - ${baseCost}g × Level`, x + 60, yPos);

      if (!hasEligible) {
        ctx.font = '12px monospace';
        ctx.fillStyle = '#666';
        ctx.fillText('(No one needs this)', x + 350, yPos);
      } else {
        ctx.font = '12px monospace';
        ctx.fillStyle = '#4a4';
        ctx.fillText(`(${eligibleCharacters.length} need${eligibleCharacters.length === 1 ? 's' : ''})`, x + 350, yPos);
      }

      yPos += 45;
    });
  }

  private renderCharacterSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TempleStateContext): void {
    if (!stateContext.selectedService) return;

    const serviceNames: Record<TempleService, string> = {
      'cure_paralyzed': 'Cure Paralysis',
      'cure_stoned': 'Cure Petrification',
      'resurrect_dead': 'Resurrect from Dead',
      'resurrect_ashes': 'Resurrect from Ashes'
    };

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CHARACTER', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`For: ${serviceNames[stateContext.selectedService]}`, x + width / 2, y + 70);

    const eligibleCharacters = this.stateManager.getCharactersNeedingService(stateContext.selectedService);

    if (eligibleCharacters.length === 0) {
      ctx.fillStyle = '#666';
      ctx.fillText('No characters need this service', x + width / 2, y + 150);
      return;
    }

    ctx.textAlign = 'left';
    let yPos = y + 110;

    eligibleCharacters.forEach((char: Character, index: number) => {
      const isSelected = index === stateContext.selectedOption;
      const cost = this.stateManager.getServiceCost(stateContext.selectedService!, char);
      const canAfford = this.stateManager.canPartyAffordService(stateContext.selectedService!, char);

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 35);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(`${index + 1}. ${char.name} (Lv.${char.level})`, x + 60, yPos);

      ctx.font = '12px monospace';
      const statusText = char.statuses.length > 0 ? char.statuses[0].type : 'OK';
      const statusColor = this.getStatusColor(statusText);
      ctx.fillStyle = statusColor;
      ctx.fillText(statusText, x + 250, yPos);

      ctx.fillStyle = canAfford ? '#4a4' : '#a44';
      ctx.fillText(`${cost}g`, x + 350, yPos);
      if (!canAfford) {
        ctx.fillText('(Insufficient)', x + 400, yPos);
      }

      yPos += 45;
    });
  }

  private renderPayerSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TempleStateContext): void {
    if (!stateContext.selectedService) return;

    const characters = this.gameState.party.characters || [];
    if (characters.length === 0 || stateContext.selectedCharacterIndex >= characters.length) return;

    const character = characters[stateContext.selectedCharacterIndex];
    const cost = this.stateManager.getServiceCost(stateContext.selectedService, character);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WHO WILL PAY?', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`Service cost: ${cost}g`, x + width / 2, y + 70);

    if (characters.length === 0) {
      ctx.fillStyle = '#666';
      ctx.fillText('No party members', x + width / 2, y + 150);
      return;
    }

    ctx.textAlign = 'left';
    let yPos = y + 110;

    characters.forEach((char: Character, index: number) => {
      const isSelected = index === stateContext.selectedOption;
      const canAfford = char.gold >= cost;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 35);
      }

      ctx.fillStyle = !canAfford ? '#666' : isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(`${index + 1}. ${char.name}`, x + 60, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = canAfford ? '#4a4' : '#a44';
      ctx.fillText(`${char.gold}g`, x + 250, yPos);

      if (!canAfford) {
        ctx.fillStyle = '#666';
        ctx.fillText('(Insufficient gold)', x + 60, yPos + 15);
      }

      yPos += 45;
    });
  }

  private renderConfirmation(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TempleStateContext): void {
    if (!stateContext.selectedService) return;

    const character = this.gameState.party.characters?.[stateContext.selectedCharacterIndex];
    if (!character) return;

    const serviceNames: Record<TempleService, string> = {
      'cure_paralyzed': 'Cure Paralysis',
      'cure_stoned': 'Cure Petrification',
      'resurrect_dead': 'Resurrect from Dead',
      'resurrect_ashes': 'Resurrect from Ashes'
    };

    const cost = this.stateManager.getServiceCost(stateContext.selectedService, character);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CONFIRM SERVICE', x + width / 2, y + 60);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(
      `Perform ${serviceNames[stateContext.selectedService]} on ${character.name}?`,
      x + width / 2,
      y + 120
    );

    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(
      `Cost: ${cost}g`,
      x + width / 2,
      y + 160
    );

    if (stateContext.selectedService === 'resurrect_dead' || stateContext.selectedService === 'resurrect_ashes') {
      ctx.fillStyle = '#a44';
      ctx.font = '14px monospace';
      ctx.fillText('Warning: Resurrection can fail!', x + width / 2, y + 200);

      if (stateContext.selectedService === 'resurrect_dead') {
        ctx.fillStyle = '#aaa';
        ctx.font = '12px monospace';
        ctx.fillText('Failure will turn the character to ashes', x + width / 2, y + 225);
      } else {
        ctx.fillStyle = '#aaa';
        ctx.font = '12px monospace';
        ctx.fillText('Failure will lose the character forever', x + width / 2, y + 225);
      }
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('Press Y to confirm, N to cancel', x + width / 2, y + 380);
  }

  private renderServiceResult(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TempleStateContext): void {
    if (!stateContext.serviceResult) return;

    const result = stateContext.serviceResult;

    ctx.fillStyle = result.success ? '#4a4' : '#a44';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(result.success ? 'SUCCESS!' : 'FAILED', x + width / 2, y + 80);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(result.message, x + width / 2, y + 140);

    if (result.resurrectionResult) {
      const resResult = result.resurrectionResult;

      ctx.font = '14px monospace';
      ctx.fillStyle = '#aaa';

      if (resResult.outcome === 'success') {
        ctx.fillStyle = '#4a4';
        ctx.fillText(`HP restored: ${resResult.hpRestored}`, x + width / 2, y + 180);
        ctx.fillStyle = '#a44';
        ctx.fillText(`Vitality lost: ${resResult.vitalityLost}`, x + width / 2, y + 205);
      } else if (resResult.outcome === 'turned_to_ashes') {
        ctx.fillStyle = '#a44';
        ctx.fillText('The character has turned to ashes!', x + width / 2, y + 180);
        ctx.fillText(`Vitality lost: ${resResult.vitalityLost}`, x + width / 2, y + 205);
      } else if (resResult.outcome === 'lost') {
        ctx.fillStyle = '#a44';
        ctx.fillText('The character is lost forever...', x + width / 2, y + 180);
      }
    }

    ctx.fillStyle = '#ffa500';
    ctx.font = '14px monospace';
    ctx.fillText(`Gold spent: ${result.goldSpent}g`, x + width / 2, y + 260);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('Press ENTER to continue', x + width / 2, y + 380);
  }

  private renderServiceInfo(ctx: CanvasRenderingContext2D, stateContext: TempleStateContext): void {
    const infoX = 770;
    const infoY = 80;
    const infoWidth = 240;
    const infoHeight = 480;

    UIRenderingUtils.drawPanel(ctx, infoX, infoY, infoWidth, infoHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TEMPLE SERVICES', infoX + infoWidth / 2, infoY + 25);

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    if (stateContext.currentState === 'main') {
      const options = ['Request Service', 'Leave Temple'];
      const startY = infoY + 60;

      options.forEach((option, index) => {
        const y = startY + index * 35;
        const isSelected = index === stateContext.selectedOption;

        if (isSelected) {
          ctx.fillStyle = '#333';
          ctx.fillRect(infoX + 10, y - 15, infoWidth - 20, 25);
        }

        ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
        ctx.font = isSelected ? 'bold 12px monospace' : '12px monospace';
        ctx.fillText(`${index + 1}. ${option}`, infoX + 20, y);
      });

      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('UP/DOWN: Select', infoX + infoWidth / 2, infoY + infoHeight - 30);
      ctx.fillText('ENTER: Choose', infoX + infoWidth / 2, infoY + infoHeight - 15);
    } else {
      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';

      if (stateContext.currentState === 'selectService') {
        ctx.fillText('UP/DOWN: Select', infoX + infoWidth / 2, infoY + infoHeight - 45);
        ctx.fillText('ENTER: Choose', infoX + infoWidth / 2, infoY + infoHeight - 30);
        ctx.fillText('ESC: Back to Main', infoX + infoWidth / 2, infoY + infoHeight - 15);
      } else if (stateContext.currentState === 'selectCharacter') {
        ctx.fillText('UP/DOWN: Select', infoX + infoWidth / 2, infoY + infoHeight - 45);
        ctx.fillText('ENTER: Choose', infoX + infoWidth / 2, infoY + infoHeight - 30);
        ctx.fillText('ESC: Back to Services', infoX + infoWidth / 2, infoY + infoHeight - 15);
      } else if (stateContext.currentState === 'confirmService') {
        ctx.fillText('Y: Confirm', infoX + infoWidth / 2, infoY + infoHeight - 30);
        ctx.fillText('N: Cancel', infoX + infoWidth / 2, infoY + infoHeight - 15);
      } else if (stateContext.currentState === 'serviceResult') {
        ctx.fillText('ENTER: Continue', infoX + infoWidth / 2, infoY + infoHeight - 15);
      }
    }

    const summaryY = infoY + 140;
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    ctx.fillText('Party Status Summary:', infoX + 10, summaryY);

    const counts = {
      paralyzed: 0,
      stoned: 0,
      dead: 0,
      ashed: 0,
      cursed: 0
    };

    (this.gameState.party.characters || []).forEach((char: Character) => {
      if (char.hasStatus('Paralyzed')) counts.paralyzed++;
      if (char.hasStatus('Stoned')) counts.stoned++;
      if (char.hasStatus('Dead')) counts.dead++;
      if (char.hasStatus('Ashed')) counts.ashed++;
      if (this.hasEquippedCursedItems(char)) counts.cursed++;
    });

    ctx.font = '10px monospace';
    let statusY = summaryY + 20;

    if (counts.paralyzed > 0) {
      ctx.fillStyle = '#fa0';
      ctx.fillText(`Paralyzed: ${counts.paralyzed}`, infoX + 15, statusY);
      statusY += 15;
    }
    if (counts.stoned > 0) {
      ctx.fillStyle = '#999';
      ctx.fillText(`Stoned: ${counts.stoned}`, infoX + 15, statusY);
      statusY += 15;
    }
    if (counts.dead > 0) {
      ctx.fillStyle = '#a44';
      ctx.fillText(`Dead: ${counts.dead}`, infoX + 15, statusY);
      statusY += 15;
    }
    if (counts.ashed > 0) {
      ctx.fillStyle = '#844';
      ctx.fillText(`Ashed: ${counts.ashed}`, infoX + 15, statusY);
      statusY += 15;
    }
    if (counts.cursed > 0) {
      ctx.fillStyle = '#a4a';
      ctx.fillText(`Cursed Items: ${counts.cursed}`, infoX + 15, statusY);
      statusY += 15;
    }

    if (counts.paralyzed === 0 && counts.stoned === 0 && counts.dead === 0 && counts.ashed === 0 && counts.cursed === 0) {
      ctx.fillStyle = '#4a4';
      ctx.fillText('All party members OK', infoX + 15, statusY);
    }
  }

  private hasEquippedCursedItems(character: Character): boolean {
    if (!character.equipment) return false;
    for (const slot in character.equipment) {
      const item = character.equipment[slot as keyof typeof character.equipment];
      if (item && item.cursed) {
        return true;
      }
    }
    return false;
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'OK':
        return '#4a4';
      case 'Paralyzed':
        return '#fa0';
      case 'Stoned':
        return '#999';
      case 'Dead':
        return '#a44';
      case 'Ashed':
        return '#844';
      case 'Lost':
        return '#666';
      default:
        return '#aaa';
    }
  }
}