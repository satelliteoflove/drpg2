import { GameState } from '../../types/GameTypes';
import { InnStateContext, LevelUpResult } from './InnStateManager';
import { Character } from '../../entities/Character';
import { StatusPanel } from '../../ui/StatusPanel';

export class InnUIRenderer {
  private gameState: GameState;
  private messageLog: any;
  private statusPanel: StatusPanel | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor(gameState: GameState, messageLog: any) {
    this.gameState = gameState;
    this.messageLog = messageLog;
  }

  public render(ctx: CanvasRenderingContext2D, stateContext: InnStateContext): void {
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
    ctx.fillText('THE ADVENTURER\'S INN', ctx.canvas.width / 2, 45);

    const pooledGold = this.gameState.party.pooledGold || 0;
    const partyGold = this.gameState.party.characters?.reduce(
      (sum: number, char: Character) => sum + char.gold, 0
    ) || 0;

    ctx.fillStyle = '#ffa500';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Pooled: ${pooledGold}g | Party: ${partyGold}g`, ctx.canvas.width - 30, 45);
  }


  private renderMainArea(ctx: CanvasRenderingContext2D, stateContext: InnStateContext): void {
    const mainX = 260;
    const mainY = 80;
    const mainWidth = 500;
    const mainHeight = 480;

    this.drawPanel(ctx, mainX, mainY, mainWidth, mainHeight);

    switch (stateContext.currentState) {
      case 'main':
        this.renderWelcomeScreen(ctx, mainX, mainY, mainWidth, mainHeight);
        break;
      case 'selectCharacter':
        this.renderCharacterSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'selectRoom':
        this.renderRoomSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'confirmRest':
        this.renderConfirmation(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'levelupResult':
        this.renderLevelUpAnimation(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'poolGold':
        this.renderPoolGoldConfirmation(ctx, mainX, mainY, mainWidth, mainHeight);
        break;
      case 'selectPoolTarget':
        this.renderPoolTargetSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
    }
  }

  private renderWelcomeScreen(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome, weary travelers!', x + width / 2, y + 60);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Rest your bodies and spirits here', x + width / 2, y + 90);
    ctx.fillText('at the Adventurer\'s Inn', x + width / 2, y + 110);

    const pendingLevelUps = (this.gameState.party.characters || []).filter(
      (char: Character) => !char.isDead && char.pendingLevelUp
    );

    if (pendingLevelUps.length > 0) {
      ctx.fillStyle = '#fa0';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`${pendingLevelUps.length} character(s) ready to level up!`, x + width / 2, y + 320);
    }
  }

  private renderCharacterSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: InnStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CHARACTER', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Choose who needs rest', x + width / 2, y + 70);

    const characters = this.gameState.party.characters || [];
    if (characters.length === 0) {
      ctx.fillStyle = '#666';
      ctx.fillText('No party members', x + width / 2, y + 150);
      return;
    }

    ctx.textAlign = 'left';
    let yPos = y + 110;

    characters.forEach((char: Character, index: number) => {
      const isSelected = index === stateContext.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 25);
      }

      ctx.fillStyle = char.isDead ? '#a44' : isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(`${index + 1}. ${char.name}`, x + 60, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = char.isDead ? '#844' : '#aaa';
      const status = char.isDead ? 'DEAD' : `HP: ${char.hp}/${char.maxHp}  MP: ${char.mp}/${char.maxMp}`;
      ctx.fillText(status, x + 200, yPos);

      if (char.pendingLevelUp && !char.isDead) {
        ctx.fillStyle = '#fa0';
        ctx.fillText('LEVEL UP!', x + 400, yPos);
      }

      yPos += 35;
    });
  }

  private renderRoomSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: InnStateContext): void {
    const character = this.gameState.party.characters?.[stateContext.selectedCharacterIndex];
    if (!character) return;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT ROOM TYPE', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`For ${character.name}`, x + width / 2, y + 70);

    const roomTypes: Array<{ type: 'stables' | 'cots' | 'economy' | 'merchant' | 'royal', name: string, cost: number, description: string }> = [
      { type: 'stables', name: 'Stables', cost: 0, description: 'Free - MP only, ages 1 day' },
      { type: 'cots', name: 'Cots', cost: 10, description: '10g/week - 1 HP per week' },
      { type: 'economy', name: 'Economy', cost: 50, description: '50g/week - 3 HP per week' },
      { type: 'merchant', name: 'Merchant', cost: 200, description: '200g/week - 7 HP per week' },
      { type: 'royal', name: 'Royal Suite', cost: 500, description: '500g/week - 10 HP per week' }
    ];

    ctx.textAlign = 'left';
    let yPos = y + 110;

    roomTypes.forEach((room, index) => {
      const isSelected = index === stateContext.selectedOption;
      const isDead = character.isDead;

      // Calculate actual cost based on weeks needed
      let displayCost = room.cost;
      let weeksNeeded = 1;

      if (!isDead && room.type !== 'stables') {
        const hpPerWeek = room.type === 'cots' ? 1 :
                         room.type === 'economy' ? 3 :
                         room.type === 'merchant' ? 7 : 10;
        const hpNeeded = character.maxHp - character.hp;
        weeksNeeded = hpNeeded > 0 ? Math.ceil(hpNeeded / hpPerWeek) : 1;
        displayCost = room.cost * weeksNeeded;
      }

      // Check both gold sources
      const pooledGold = this.gameState.party.pooledGold || 0;
      const characterGold = character.gold || 0;

      // Check if can afford - use pooled gold OR individual character gold
      const canAfford = room.type === 'stables' || pooledGold >= displayCost || characterGold >= displayCost;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 40);
      }

      ctx.fillStyle = isDead ? '#666' : !canAfford ? '#666' : isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';

      const costText = room.type === 'stables' ? 'FREE' : weeksNeeded > 1 ? `${displayCost}g (${weeksNeeded} weeks)` : `${displayCost}g`;
      ctx.fillText(`${room.name} - ${costText}`, x + 60, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';

      if (isDead) {
        ctx.fillStyle = '#a44';
        ctx.fillText('Dead - Visit Temple for resurrection', x + 60, yPos + 18);
      } else {
        ctx.fillText(room.description, x + 60, yPos + 18);
      }

      yPos += 50;
    });
  }

  private renderConfirmation(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: InnStateContext): void {
    const character = this.gameState.party.characters?.[stateContext.selectedCharacterIndex];
    if (!character || !stateContext.selectedRoomType) return;

    const roomTypes: Record<string, string> = {
      'stables': 'Stables',
      'economy': 'Economy Room',
      'standard': 'Standard Room',
      'royal': 'Royal Suite'
    };

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CONFIRM REST', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${character.name} will rest in the ${roomTypes[stateContext.selectedRoomType]}`, x + width / 2, y + 100);

    if (stateContext.confirmationPrompt) {
      ctx.fillStyle = '#fa0';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(stateContext.confirmationPrompt, x + width / 2, y + 150);
    }
  }


  private renderLevelUpAnimation(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, stateContext: InnStateContext): void {
    ctx.fillStyle = '#4a4';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', x + width / 2, y + 50);

    ctx.font = '14px monospace';
    let yPos = y + 90;

    stateContext.levelUpResults.forEach((result: LevelUpResult) => {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(
        `${result.character.name} reached Level ${result.newLevel}!`,
        x + width / 2, yPos
      );
      yPos += 35;

      ctx.font = '14px monospace';

      if (result.hpGained > 0) {
        ctx.fillStyle = '#4a4';
        ctx.fillText(`HP +${result.hpGained}`, x + width / 2, yPos);
        yPos += 20;
      }

      if (result.mpGained > 0) {
        ctx.fillStyle = '#44a';
        ctx.fillText(`MP +${result.mpGained}`, x + width / 2, yPos);
        yPos += 20;
      }

      if (result.spellsLearned.length > 0) {
        ctx.fillStyle = '#a4a';
        ctx.fillText('Spells learned:', x + width / 2, yPos);
        yPos += 20;
        result.spellsLearned.forEach(spell => {
          ctx.fillText(`• ${spell}`, x + width / 2, yPos);
          yPos += 18;
        });
      }

      yPos += 30;
    });

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('Press ENTER to continue', x + width / 2, height - 30);
  }

  private renderPoolGoldConfirmation(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POOL PARTY GOLD', x + width / 2, y + 40);

    // Calculate total gold available
    const characters = this.gameState.party.characters || [];
    let totalGold = 0;
    characters.forEach((char: Character) => {
      totalGold += char.gold || 0;
    });

    ctx.font = '14px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('Pool all party gold to one character?', x + width / 2, y + 100);

    ctx.fillStyle = '#ffa500';
    ctx.fillText(`Total gold to pool: ${totalGold}g`, x + width / 2, y + 140);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('This will collect gold from all party members', x + width / 2, y + 180);
    ctx.fillText('and give it to a character of your choice.', x + width / 2, y + 200);
  }

  private renderPoolTargetSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, stateContext: InnStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT RECIPIENT', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Who should receive the pooled gold?', x + width / 2, y + 70);

    const characters = this.gameState.party.characters || [];
    if (characters.length === 0) return;

    // Calculate total gold to be pooled
    let totalToPool = 0;
    characters.forEach((char: Character) => {
      totalToPool += char.gold || 0;
    });

    ctx.textAlign = 'left';
    let yPos = y + 110;

    characters.forEach((char: Character, index: number) => {
      const isSelected = index === stateContext.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 30);
      }

      ctx.fillStyle = char.isDead ? '#666' : isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(`${index + 1}. ${char.name}`, x + 60, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      const currentGold = char.gold || 0;
      const afterPooling = totalToPool;
      ctx.fillText(`Current: ${currentGold}g → After: ${afterPooling}g`, x + 250, yPos);

      yPos += 35;
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`Total gold to pool: ${totalToPool}g`, x + width / 2, y + height - 40);
  }

  private renderActionMenu(ctx: CanvasRenderingContext2D, stateContext: InnStateContext): void {
    const menuX = 770;
    const menuY = 80;
    const menuWidth = 240;
    const menuHeight = 480;

    this.drawPanel(ctx, menuX, menuY, menuWidth, menuHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INN SERVICES', menuX + menuWidth / 2, menuY + 25);

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    let options: string[] = [];
    if (stateContext.currentState === 'main') {
      options = [
        'Rest Character',
        'Pool Gold',
        'Leave Inn'
      ];
    } else if (stateContext.currentState === 'selectCharacter') {
      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('UP/DOWN: Select | ENTER: Choose', menuX + menuWidth / 2, menuY + menuHeight - 15);
      ctx.fillText('ESC: Back to Main', menuX + menuWidth / 2, menuY + menuHeight - 30);
      return;
    } else if (stateContext.currentState === 'selectRoom') {
      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('UP/DOWN: Select | ENTER: Choose', menuX + menuWidth / 2, menuY + menuHeight - 15);
      ctx.fillText('ESC: Back to Character', menuX + menuWidth / 2, menuY + menuHeight - 30);
      return;
    } else if (stateContext.currentState === 'poolGold') {
      const options = ['Proceed', 'Cancel'];
      const startY = menuY + 60;
      options.forEach((option, index) => {
        const y = startY + index * 35;
        const isSelected = index === stateContext.selectedOption;

        if (isSelected) {
          ctx.fillStyle = '#333';
          ctx.fillRect(menuX + 10, y - 15, menuWidth - 20, 25);
        }

        ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
        ctx.font = isSelected ? 'bold 12px monospace' : '12px monospace';
        ctx.fillText(option, menuX + 20, y);
      });

      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('UP/DOWN: Select | ENTER: Choose', menuX + menuWidth / 2, menuY + menuHeight - 15);
      ctx.fillText('ESC: Cancel', menuX + menuWidth / 2, menuY + menuHeight - 30);
      return;
    } else if (stateContext.currentState === 'selectPoolTarget') {
      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('UP/DOWN: Select Character', menuX + menuWidth / 2, menuY + menuHeight - 15);
      ctx.fillText('ENTER: Confirm | ESC: Back', menuX + menuWidth / 2, menuY + menuHeight - 30);
      return;
    }

    const startY = menuY + 60;
    options.forEach((option, index) => {
      const y = startY + index * 35;
      const isSelected = index === stateContext.selectedOption;

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
    let controlText = 'UP/DOWN: Select | ENTER: Choose';
    if (stateContext.currentState === 'confirmRest') {
      controlText = 'Y: Confirm | N: Cancel';
    } else if (stateContext.currentState === 'levelupResult') {
      controlText = 'ENTER: Continue';
    } else if (stateContext.currentState !== 'main') {
      controlText = 'ESC: Back';
    }
    ctx.fillText(controlText, menuX + menuWidth / 2, menuY + menuHeight - 15);
  }


  private drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }
}