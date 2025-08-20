import { Character } from '../entities/Character';
import { Party } from '../entities/Party';

export class StatusPanel {
  private ctx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
    this.ctx = canvas.getContext('2d')!;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public render(party: Party): void {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(this.x, this.y, this.width, this.height);

    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.x, this.y, this.width, this.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('PARTY STATUS', this.x + 10, this.y + 20);

    const charHeight = 45;
    const startY = this.y + 40;
    const availableHeight = this.height - 100; // Reserve space for party info
    const maxChars = Math.floor(availableHeight / charHeight);

    party.characters.slice(0, maxChars).forEach((char, index) => {
      const charY = startY + index * charHeight;
      this.renderCharacterStatus(char, this.x + 10, charY, this.width - 20, charHeight - 5);
    });

    this.renderPartyInfo(party);
  }

  private renderCharacterStatus(
    char: Character,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const statusColor = char.isDead ? '#ff0000' : char.status !== 'OK' ? '#ffaa00' : '#00ff00';

    this.ctx.strokeStyle = statusColor;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '11px monospace';

    this.ctx.fillText(`${char.name} (${char.class})`, x + 5, y + 12);
    this.ctx.fillText(`Lv.${char.level}`, x + 5, y + 24);

    this.ctx.fillStyle = statusColor;
    this.ctx.fillText(`${char.status}`, x + 60, y + 24);

    const hpBarWidth = width - 100;
    const hpPercent = char.maxHp > 0 ? char.hp / char.maxHp : 0;

    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x + 5, y + 28, hpBarWidth, 6);

    this.ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
    this.ctx.fillRect(x + 5, y + 28, hpBarWidth * hpPercent, 6);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '9px monospace';
    this.ctx.fillText(`HP: ${char.hp}/${char.maxHp}`, x + 5, y + 40);

    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '8px monospace';
    this.ctx.fillText(`AC: ${char.ac}`, x + width - 35, y + 12);
    this.ctx.fillText(`Gold: ${char.gold}`, x + width - 50, y + 24);
    this.ctx.fillText(`Exp: ${char.experience}`, x + width - 55, y + 36);

    if (char.maxMp > 0) {
      const mpPercent = char.mp / char.maxMp;
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(x + 5, y + 34, hpBarWidth, 4);

      this.ctx.fillStyle = '#0088ff';
      this.ctx.fillRect(x + 5, y + 34, hpBarWidth * mpPercent, 4);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = '8px monospace';
      this.ctx.fillText(`MP: ${char.mp}/${char.maxMp}`, x + width - 55, y + 48);
    }
  }

  private renderPartyInfo(party: Party): void {
    const infoY = this.y + this.height - 60;

    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(this.x + 10, infoY, this.width - 20, 50);

    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.x + 10, infoY, this.width - 20, 50);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '10px monospace';
    this.ctx.fillText('PARTY INFO', this.x + 15, infoY + 12);

    this.ctx.font = '9px monospace';
    this.ctx.fillText(`Position: (${party.x}, ${party.y})`, this.x + 15, infoY + 25);
    this.ctx.fillText(`Facing: ${party.facing}`, this.x + 15, infoY + 35);
    this.ctx.fillText(`Floor: ${party.floor}`, this.x + 15, infoY + 45);

    const aliveCount = party.getAliveCharacters().length;
    const totalGold = party.getTotalGold();

    this.ctx.fillText(`Alive: ${aliveCount}/${party.characters.length}`, this.x + 180, infoY + 25);
    this.ctx.fillText(`Total Gold: ${totalGold}`, this.x + 180, infoY + 35);

    if (party.isWiped()) {
      this.ctx.fillStyle = '#ff0000';
      this.ctx.font = '10px monospace';
      this.ctx.fillText('PARTY WIPED!', this.x + 180, infoY + 45);
    }
  }

  public renderCombatStatus(currentTurn: string, turnOrder: string[]): void {
    // Position combat status below the party status panel with proper spacing
    const combatY = this.y + this.height + 20;

    this.ctx.fillStyle = '#330000';
    this.ctx.fillRect(this.x, combatY, this.width, 140);

    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.x, combatY, this.width, 140);

    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('COMBAT', this.x + 10, combatY + 20);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`Current: ${currentTurn}`, this.x + 10, combatY + 40);

    this.ctx.font = '10px monospace';
    this.ctx.fillText('Turn Order:', this.x + 10, combatY + 60);

    turnOrder.slice(0, 8).forEach((unit, index) => {
      this.ctx.fillStyle = index === 0 ? '#ffff00' : '#ccc';
      this.ctx.fillText(`${index + 1}. ${unit}`, this.x + 10, combatY + 75 + index * 12);
    });
  }
}
