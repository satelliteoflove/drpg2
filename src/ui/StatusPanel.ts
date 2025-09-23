import { Character } from '../entities/Character';
import { Party } from '../entities/Party';

export class StatusPanel {
  private ctx: CanvasRenderingContext2D;
  private currentRenderCtx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
    this.ctx = canvas.getContext('2d')!;
    this.currentRenderCtx = this.ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public render(party: Party, ctx?: CanvasRenderingContext2D): void {
    this.currentRenderCtx = ctx || this.ctx;

    this.currentRenderCtx.fillStyle = '#1a1a1a';
    this.currentRenderCtx.fillRect(this.x, this.y, this.width, this.height);

    this.currentRenderCtx.strokeStyle = '#333';
    this.currentRenderCtx.lineWidth = 2;
    this.currentRenderCtx.strokeRect(this.x, this.y, this.width, this.height);

    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '14px monospace';
    this.currentRenderCtx.fillText('PARTY STATUS', this.x + 10, this.y + 20);

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

    this.currentRenderCtx.strokeStyle = statusColor;
    this.currentRenderCtx.lineWidth = 1;
    this.currentRenderCtx.strokeRect(x, y, width, height);

    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '11px monospace';

    this.currentRenderCtx.fillText(`${char.name} (${char.class})`, x + 5, y + 12);
    this.currentRenderCtx.fillText(`Lv.${char.level}`, x + 5, y + 24);

    this.currentRenderCtx.fillStyle = statusColor;
    this.currentRenderCtx.fillText(`${char.status}`, x + 60, y + 24);

    const barWidth = Math.floor((width - 120) / 2);
    const hpPercent = char.maxHp > 0 ? char.hp / char.maxHp : 0;
    const mpPercent = char.maxMp > 0 ? char.mp / char.maxMp : 0;

    this.currentRenderCtx.fillStyle = '#333';
    this.currentRenderCtx.fillRect(x + 5, y + 28, barWidth, 6);

    this.currentRenderCtx.fillStyle =
      hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
    this.currentRenderCtx.fillRect(x + 5, y + 28, barWidth * hpPercent, 6);

    this.currentRenderCtx.fillStyle = '#333';
    this.currentRenderCtx.fillRect(x + barWidth + 15, y + 28, barWidth, 6);

    this.currentRenderCtx.fillStyle = '#0088ff';
    this.currentRenderCtx.fillRect(x + barWidth + 15, y + 28, barWidth * mpPercent, 6);

    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '9px monospace';
    this.currentRenderCtx.fillText(`HP: ${char.hp}/${char.maxHp}`, x + 5, y + 40);

    this.currentRenderCtx.fillStyle = '#8af';
    this.currentRenderCtx.fillText(`MP: ${char.mp}/${char.maxMp}`, x + barWidth + 15, y + 40);

    this.currentRenderCtx.fillStyle = '#aaa';
    this.currentRenderCtx.font = '8px monospace';
    this.currentRenderCtx.fillText(`AC: ${char.ac}`, x + width - 35, y + 12);
    this.currentRenderCtx.fillText(`Gold: ${char.gold}`, x + width - 50, y + 24);
    this.currentRenderCtx.fillText(`Exp: ${char.experience}`, x + width - 55, y + 36);

    if (char.maxMp > 0) {
      const mpPercent = char.mp / char.maxMp;
      this.currentRenderCtx.fillStyle = '#333';
      this.currentRenderCtx.fillRect(x + 5, y + 34, barWidth, 4);

      this.currentRenderCtx.fillStyle = '#0088ff';
      this.currentRenderCtx.fillRect(x + 5, y + 34, barWidth * mpPercent, 4);

      this.currentRenderCtx.fillStyle = '#fff';
      this.currentRenderCtx.font = '8px monospace';
      this.currentRenderCtx.fillText(`MP: ${char.mp}/${char.maxMp}`, x + width - 55, y + 48);
    }
  }

  private renderPartyInfo(party: Party): void {
    const infoY = this.y + this.height - 60;

    this.currentRenderCtx.fillStyle = '#333';
    this.currentRenderCtx.fillRect(this.x + 10, infoY, this.width - 20, 50);

    this.currentRenderCtx.strokeStyle = '#666';
    this.currentRenderCtx.lineWidth = 1;
    this.currentRenderCtx.strokeRect(this.x + 10, infoY, this.width - 20, 50);

    this.currentRenderCtx.fillStyle = '#fff';
    this.currentRenderCtx.font = '10px monospace';
    this.currentRenderCtx.fillText('PARTY INFO', this.x + 15, infoY + 12);

    this.currentRenderCtx.font = '9px monospace';
    this.currentRenderCtx.fillText(`Position: (${party.x}, ${party.y})`, this.x + 15, infoY + 25);
    this.currentRenderCtx.fillText(`Facing: ${party.facing}`, this.x + 15, infoY + 35);
    this.currentRenderCtx.fillText(`Floor: ${party.floor}`, this.x + 15, infoY + 45);

    const aliveCount = party.getAliveCharacters().length;
    const totalGold = party.getTotalGold();

    this.currentRenderCtx.fillText(
      `Alive: ${aliveCount}/${party.characters.length}`,
      this.x + 180,
      infoY + 25
    );
    this.currentRenderCtx.fillText(`Total Gold: ${totalGold}`, this.x + 180, infoY + 35);

    if (party.isWiped()) {
      this.currentRenderCtx.fillStyle = '#ff0000';
      this.currentRenderCtx.font = '10px monospace';
      this.currentRenderCtx.fillText('PARTY WIPED!', this.x + 180, infoY + 45);
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
}
