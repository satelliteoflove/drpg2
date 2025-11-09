import { Character } from '../entities/Character';
import { Party } from '../entities/Party';
import { StatusEffectSystem } from '../systems/StatusEffectSystem';
import { CharacterStatus } from '../types/GameTypes';

export class StatusPanel {
  private ctx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private statusEffectSystem: StatusEffectSystem;

  constructor(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
    this.ctx = canvas.getContext('2d')!;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.statusEffectSystem = StatusEffectSystem.getInstance();
  }

  public render(party: Party, ctx?: CanvasRenderingContext2D): void {
    const renderCtx = ctx || this.ctx;

    renderCtx.fillStyle = '#2a2a2a';
    renderCtx.fillRect(this.x, this.y, this.width, this.height);

    renderCtx.strokeStyle = '#666';
    renderCtx.lineWidth = 2;
    renderCtx.strokeRect(this.x, this.y, this.width, this.height);

    const charHeight = 75;
    const startY = this.y + 15;
    const availableHeight = this.height - 25;
    const maxChars = Math.floor(availableHeight / charHeight);

    party.characters.slice(0, maxChars).forEach((char, index) => {
      const charY = startY + index * charHeight;
      this.renderCharacterStatus(char, this.x + 10, charY, this.width - 20, charHeight - 5, renderCtx);
    });
  }

  private renderCharacterStatus(
    char: Character,
    x: number,
    y: number,
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const statusColor = char.isDead ? '#ff0000' : char.statuses.length > 0 ? '#ffaa00' : '#00ff00';

    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(`${char.name} (${char.class})`, x + 5, y + 14);

    ctx.font = '11px monospace';
    ctx.fillText(`Lv.${char.level}`, x + 5, y + 28);

    this.renderStatusIcons(char, x + 50, y + 20, ctx);

    ctx.fillStyle = '#aaa';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`AC: ${char.ac}`, x + width - 5, y + 14);
    ctx.fillText(`Gold: ${char.gold}`, x + width - 5, y + 28);
    ctx.textAlign = 'left';

    const barY = y + 35;
    const barWidth = Math.floor((width - 20) / 2 - 5);
    const hpPercent = char.maxHp > 0 ? char.hp / char.maxHp : 0;
    const mpPercent = char.maxMp > 0 ? char.mp / char.maxMp : 0;

    const xpForNext = char.getExperienceForNextLevel();
    const xpNeeded = char.getExperienceToNextLevel();
    const xpProgress = xpForNext > 0 ?
      1 - (xpNeeded / xpForNext) : 0;

    ctx.fillStyle = '#333';
    ctx.fillRect(x + 5, barY, barWidth, 8);

    ctx.fillStyle =
      hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
    ctx.fillRect(x + 5, barY, barWidth * hpPercent, 8);

    ctx.fillStyle = '#333';
    ctx.fillRect(x + barWidth + 10, barY, barWidth, 8);

    ctx.fillStyle = '#0088ff';
    ctx.fillRect(x + barWidth + 10, barY, barWidth * mpPercent, 8);

    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText(`HP: ${char.hp}/${char.maxHp}`, x + 5, barY + 20);

    ctx.fillStyle = '#8af';
    ctx.fillText(`MP: ${char.mp}/${char.maxMp}`, x + barWidth + 10, barY + 20);

    const xpBarY = barY + 25;
    const xpBarWidth = width - 10;

    ctx.fillStyle = '#333';
    ctx.fillRect(x + 5, xpBarY, xpBarWidth, 6);

    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(x + 5, xpBarY, xpBarWidth * xpProgress, 6);

    if (char.pendingLevelUp) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LEVEL UP!', x + width / 2, xpBarY + 16);
      ctx.textAlign = 'left';
    }
  }

  private renderStatusIcons(character: Character, x: number, y: number, ctx: CanvasRenderingContext2D): void {
    const statuses = this.statusEffectSystem.getAllStatuses(character);
    if (statuses.length === 0) {
      ctx.fillStyle = '#00ff00';
      ctx.font = '11px monospace';
      ctx.fillText('OK', x, y + 8);
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

      ctx.fillStyle = iconData.color;
      ctx.fillRect(iconX, y, iconSize, iconSize);

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(iconX, y, iconSize, iconSize);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(iconData.abbr, iconX + iconSize / 2, y + 10);

      if (iconData.turns !== undefined) {
        const durationColor = iconData.turns <= 2 ? '#ff0000' :
                             iconData.turns <= 5 ? '#ffaa00' : '#ffffff';
        ctx.fillStyle = durationColor;
        ctx.font = '8px monospace';
        ctx.fillText(String(iconData.turns), iconX + iconSize / 2, y + iconSize + 8);
      }

      ctx.textAlign = 'left';
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
