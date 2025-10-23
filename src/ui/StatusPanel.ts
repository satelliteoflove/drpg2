import { Character } from '../entities/Character';
import { Party } from '../entities/Party';
import { StatusEffectSystem } from '../systems/StatusEffectSystem';
import { CharacterStatus } from '../types/GameTypes';

export class StatusPanel {
  private ctx: CanvasRenderingContext2D;
  private currentRenderCtx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private statusEffectSystem: StatusEffectSystem;

  constructor(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
    this.ctx = canvas.getContext('2d')!;
    this.currentRenderCtx = this.ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.statusEffectSystem = StatusEffectSystem.getInstance();
  }

  public render(party: Party, ctx?: CanvasRenderingContext2D): void {
    this.currentRenderCtx = ctx || this.ctx;

    // Panel background with consistent style
    this.currentRenderCtx.fillStyle = '#2a2a2a';
    this.currentRenderCtx.fillRect(this.x, this.y, this.width, this.height);

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(this.x, this.y, this.width, this.height);

    const charHeight = 75;
    const startY = this.y + 15;
    const availableHeight = this.height - 25;
    const maxChars = Math.floor(availableHeight / charHeight);

    party.characters.slice(0, maxChars).forEach((char, index) => {
      const charY = startY + index * charHeight;
      this.renderCharacterStatus(char, this.x + 10, charY, this.width - 20, charHeight - 5);
    });
  }

  private renderCharacterStatus(
    char: Character,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const statusColor = char.isDead ? '#ff0000' : char.statuses.length > 0 ? '#ffaa00' : '#00ff00';

    this.currentRenderCtx.strokeStyle = statusColor;
    this.currentRenderCtx.lineWidth = 1;
    this.currentRenderCtx.strokeRect(x, y, width, height);

    this.currentRenderCtx.textAlign = 'left';
    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '12px monospace';
    this.currentRenderCtx.fillText(`${char.name} (${char.class})`, x + 5, y + 14);

    // Level and status on second line
    this.currentRenderCtx.font = '11px monospace';
    this.currentRenderCtx.fillText(`Lv.${char.level}`, x + 5, y + 28);

    this.renderStatusIcons(char, x + 50, y + 20);

    // AC and Gold on the right
    this.currentRenderCtx.fillStyle = '#aaa';
    this.currentRenderCtx.font = '10px monospace';
    this.currentRenderCtx.textAlign = 'right';
    this.currentRenderCtx.fillText(`AC: ${char.ac}`, x + width - 5, y + 14);
    this.currentRenderCtx.fillText(`Gold: ${char.gold}`, x + width - 5, y + 28);
    this.currentRenderCtx.textAlign = 'left';

    // HP, MP and XP bars
    const barY = y + 35;
    const barWidth = Math.floor((width - 20) / 2 - 5);
    const hpPercent = char.maxHp > 0 ? char.hp / char.maxHp : 0;
    const mpPercent = char.maxMp > 0 ? char.mp / char.maxMp : 0;

    // Calculate XP progress to next level
    const xpForNext = char.getExperienceForNextLevel();
    const xpNeeded = char.getExperienceToNextLevel();
    const xpProgress = xpForNext > 0 ?
      1 - (xpNeeded / xpForNext) : 0;

    // HP bar
    this.currentRenderCtx.fillStyle = '#333';
    this.currentRenderCtx.fillRect(x + 5, barY, barWidth, 8);

    this.currentRenderCtx.fillStyle =
      hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
    this.currentRenderCtx.fillRect(x + 5, barY, barWidth * hpPercent, 8);

    // MP bar
    this.currentRenderCtx.fillStyle = '#333';
    this.currentRenderCtx.fillRect(x + barWidth + 10, barY, barWidth, 8);

    this.currentRenderCtx.fillStyle = '#0088ff';
    this.currentRenderCtx.fillRect(x + barWidth + 10, barY, barWidth * mpPercent, 8);

    // HP and MP text
    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '10px monospace';
    this.currentRenderCtx.fillText(`HP: ${char.hp}/${char.maxHp}`, x + 5, barY + 20);

    this.currentRenderCtx.fillStyle = '#8af';
    this.currentRenderCtx.fillText(`MP: ${char.mp}/${char.maxMp}`, x + barWidth + 10, barY + 20);

    // XP bar (full width)
    const xpBarY = barY + 25;
    const xpBarWidth = width - 10;

    this.currentRenderCtx.fillStyle = '#333';
    this.currentRenderCtx.fillRect(x + 5, xpBarY, xpBarWidth, 6);

    this.currentRenderCtx.fillStyle = '#ffaa00';
    this.currentRenderCtx.fillRect(x + 5, xpBarY, xpBarWidth * xpProgress, 6);

    // Show "LEVEL UP!" indicator if pending
    if (char.pendingLevelUp) {
      this.currentRenderCtx.fillStyle = '#ffaa00';
      this.currentRenderCtx.font = 'bold 10px monospace';
      this.currentRenderCtx.textAlign = 'center';
      this.currentRenderCtx.fillText('LEVEL UP!', x + width / 2, xpBarY + 16);
      this.currentRenderCtx.textAlign = 'left';
    }
  }

  public renderCombatStatus(
    currentTurn: string,
    turnOrder: string[],
    currentTurnIndex: number = 0,
    ctx?: CanvasRenderingContext2D
  ): void {
    const renderCtx = ctx || this.currentRenderCtx;
    // Position combat status below the party status panel with proper spacing
    const combatY = this.y + this.height + 20;

    renderCtx.fillStyle = '#330000';
    renderCtx.fillRect(this.x, combatY, this.width, 140);

    renderCtx.strokeStyle = '#ff0000';
    renderCtx.lineWidth = 2;
    renderCtx.strokeRect(this.x, combatY, this.width, 140);

    renderCtx.fillStyle = '#ff0000';
    renderCtx.font = '14px monospace';
    renderCtx.fillText('COMBAT', this.x + 10, combatY + 20);

    renderCtx.fillStyle = '#fff';
    renderCtx.font = '12px monospace';
    renderCtx.fillText(`Current: ${currentTurn}`, this.x + 10, combatY + 40);

    renderCtx.font = '10px monospace';
    renderCtx.fillText('Turn Order:', this.x + 10, combatY + 60);

    // Use grid layout for turn order to fit more characters
    const maxCols = 2; // Two columns to fit more units
    const colWidth = (this.width - 40) / maxCols; // Account for padding
    const rowHeight = 12;
    const startX = this.x + 10;
    const startY = combatY + 75;

    turnOrder.slice(0, 12).forEach((unit, index) => {
      // Show up to 12 units
      const col = index % maxCols;
      const row = Math.floor(index / maxCols);
      const x = startX + col * colWidth;
      const y = startY + row * rowHeight;

      renderCtx.fillStyle = index === currentTurnIndex ? '#ffff00' : '#ccc';

      // Truncate long names to fit in grid cells
      const displayName = unit.length > 12 ? unit.substring(0, 12) + '...' : unit;
      renderCtx.fillText(`${index + 1}. ${displayName}`, x, y);
    });
  }

  private renderStatusIcons(character: Character, x: number, y: number): void {
    const statuses = this.statusEffectSystem.getAllStatuses(character);
    if (statuses.length === 0) {
      this.currentRenderCtx.fillStyle = '#00ff00';
      this.currentRenderCtx.font = '11px monospace';
      this.currentRenderCtx.fillText('OK', x, y + 8);
      return;
    }

    const statusIconData: Array<{ abbr: string; color: string; turns?: number }> = [];

    for (const status of statuses) {
      const icon = this.getStatusIcon(status.type);
      if (icon) {
        statusIconData.push({
          ...icon,
          turns: status.turnsRemaining
        });
      }
    }

    if (statusIconData.length === 0) return;

    const iconSize = 14;
    const spacing = 2;

    statusIconData.forEach((iconData, idx) => {
      const iconX = x + idx * (iconSize + spacing);

      this.currentRenderCtx.fillStyle = iconData.color;
      this.currentRenderCtx.fillRect(iconX, y, iconSize, iconSize);

      this.currentRenderCtx.strokeStyle = '#000';
      this.currentRenderCtx.lineWidth = 1;
      this.currentRenderCtx.strokeRect(iconX, y, iconSize, iconSize);

      this.currentRenderCtx.fillStyle = '#fff';
      this.currentRenderCtx.font = 'bold 10px monospace';
      this.currentRenderCtx.textAlign = 'center';
      this.currentRenderCtx.fillText(iconData.abbr, iconX + iconSize / 2, y + 10);

      if (iconData.turns !== undefined) {
        const durationColor = iconData.turns <= 2 ? '#ff0000' :
                             iconData.turns <= 5 ? '#ffaa00' : '#ffffff';
        this.currentRenderCtx.fillStyle = durationColor;
        this.currentRenderCtx.font = '8px monospace';
        this.currentRenderCtx.fillText(String(iconData.turns), iconX + iconSize / 2, y + iconSize + 8);
      }

      this.currentRenderCtx.textAlign = 'left';
    });
  }

  private getStatusIcon(status: CharacterStatus): { abbr: string; color: string } | null {
    const iconMap: Record<CharacterStatus, { abbr: string; color: string }> = {
      'OK': { abbr: '', color: '' },
      'Dead': { abbr: '†', color: '#800000' },
      'Ashed': { abbr: 'A', color: '#400000' },
      'Lost': { abbr: 'X', color: '#000000' },
      'Paralyzed': { abbr: 'P', color: '#ffcc00' },
      'Stoned': { abbr: 'S', color: '#808080' },
      'Poisoned': { abbr: 'Po', color: '#00ff00' },
      'Sleeping': { abbr: 'Sl', color: '#4488ff' },
      'Silenced': { abbr: 'Si', color: '#ff8800' },
      'Blinded': { abbr: 'Bl', color: '#404040' },
      'Confused': { abbr: 'C', color: '#ff00ff' },
      'Afraid': { abbr: 'F', color: '#8844ff' },
      'Charmed': { abbr: 'Ch', color: '#ff44ff' },
      'Berserk': { abbr: 'B', color: '#ff0000' },
      'Blessed': { abbr: '+', color: '#44ffff' },
      'Cursed': { abbr: '-', color: '#884488' }
    };

    const icon = iconMap[status];
    if (!icon || !icon.abbr) return null;

    return icon;
  }
}
