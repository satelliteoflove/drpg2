import { Party } from '../entities/Party';
import { GameState } from '../types/GameTypes';

interface DebugData {
  partyStats?: {
    totalLuck: number;
    luckMultiplier: number;
    averageLevel: number;
  };
  lootSystem?: {
    dungeonLevel: number;
    dungeonMultiplier: number;
    luckMultiplier: number;
    totalMultiplier: number;
    lastRarityRolls?: string[];
  };
  combatSystem?: {
    currentTurn?: string;
    escapeChances?: { name: string; chance: number }[];
    turnOrder?: string[];
  };
  systemInfo?: {
    currentScene: string;
    combatEnabled: boolean;
    currentFloor: number;
    gameTime: number;
  };
}

export class DebugOverlay {
  private ctx: CanvasRenderingContext2D;
  private isVisible: boolean = false;
  private debugData: DebugData = {};
  private scrollOffset: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  public toggle(): void {
    console.log('[DEBUG OVERLAY] Toggle called! Current state:', this.isVisible);
    this.isVisible = !this.isVisible;
    console.log('[DEBUG OVERLAY] New state:', this.isVisible);
    if (this.isVisible) {
      this.scrollOffset = 0; // Reset scroll when opening
    }
  }

  public isOpen(): boolean {
    return this.isVisible;
  }

  public updateDebugData(data: Partial<DebugData>): void {
    this.debugData = { ...this.debugData, ...data };
  }

  public handleScroll(direction: 'up' | 'down'): void {
    if (!this.isVisible) return;

    const scrollAmount = 20;
    if (direction === 'up') {
      this.scrollOffset = Math.max(0, this.scrollOffset - scrollAmount);
    } else {
      this.scrollOffset += scrollAmount;
    }
  }

  public render(gameState: GameState): void {
    if (!this.isVisible) return;

    // Update system info from game state
    this.updateSystemInfo(gameState);

    const padding = 20;
    const width = this.ctx.canvas.width - padding * 2;
    const height = this.ctx.canvas.height - padding * 2;
    const x = padding;
    const y = padding;

    // Dark semi-transparent background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(x, y, width, height);

    // Border
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Title
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText('DEBUG INFORMATION', x + 10, y + 25);

    // Scroll indicator
    this.ctx.font = '10px monospace';
    this.ctx.fillStyle = '#888';
    this.ctx.fillText('Use Page Up/Down to scroll • Ctrl+, to close', x + 10, y + height - 10);

    // Content area with scroll offset
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x + 5, y + 35, width - 10, height - 60);
    this.ctx.clip();

    let currentY = y + 50 - this.scrollOffset;
    const lineHeight = 14;
    const sectionSpacing = 20;

    // Render all debug sections
    currentY = this.renderSystemInfo(x + 10, currentY, lineHeight);
    currentY += sectionSpacing;

    currentY = this.renderPartyStats(gameState.party, x + 10, currentY, lineHeight);
    currentY += sectionSpacing;

    currentY = this.renderLootSystemInfo(x + 10, currentY, lineHeight);
    currentY += sectionSpacing;

    currentY = this.renderCombatInfo(x + 10, currentY, lineHeight);

    this.ctx.restore();
  }

  private updateSystemInfo(gameState: GameState): void {
    this.debugData.systemInfo = {
      currentScene: 'Unknown', // Will be set by the scene
      combatEnabled: gameState.combatEnabled,
      currentFloor: gameState.currentFloor,
      gameTime: gameState.gameTime,
    };
  }

  private renderSystemInfo(x: number, y: number, lineHeight: number): number {
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.fillText('=== SYSTEM INFO ===', x, y);
    y += lineHeight + 5;

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '11px monospace';

    const info = this.debugData.systemInfo;
    if (info) {
      this.ctx.fillText(`Current Scene: ${info.currentScene}`, x, y);
      y += lineHeight;
      this.ctx.fillText(`Current Floor: ${info.currentFloor}`, x, y);
      y += lineHeight;
      this.ctx.fillText(`Combat Enabled: ${info.combatEnabled}`, x, y);
      y += lineHeight;
      this.ctx.fillText(`Game Time: ${info.gameTime}`, x, y);
      y += lineHeight;
    }

    return y;
  }

  private renderPartyStats(party: Party, x: number, y: number, lineHeight: number): number {
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.fillText('=== PARTY STATS & LUCK SYSTEM ===', x, y);
    y += lineHeight + 5;

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '11px monospace';

    // Calculate party stats
    const totalLuck = party.characters.reduce((sum, char) => sum + char.stats.luck, 0);
    const averageLevel =
      party.characters.reduce((sum, char) => sum + char.level, 0) / party.characters.length;

    this.ctx.fillText(`Total Party Luck: ${totalLuck} (Base: 60)`, x, y);
    y += lineHeight;
    this.ctx.fillText(`Average Party Level: ${averageLevel.toFixed(1)}`, x, y);
    y += lineHeight;

    if (this.debugData.partyStats) {
      this.ctx.fillText(
        `Luck Multiplier: ${this.debugData.partyStats.luckMultiplier.toFixed(3)}x`,
        x,
        y
      );
      y += lineHeight;
    }

    y += lineHeight; // Space before character details

    // Individual character stats
    party.characters.forEach((char) => {
      this.ctx.fillStyle = '#ccc';
      this.ctx.fillText(`${char.name} (${char.class}, Lvl ${char.level}):`, x, y);
      y += lineHeight;

      this.ctx.fillStyle = '#fff';
      const stats = `  STR:${char.stats.strength} INT:${char.stats.intelligence} PIE:${char.stats.piety} VIT:${char.stats.vitality} AGI:${char.stats.agility} LUK:${char.stats.luck}`;
      this.ctx.fillText(stats, x, y);
      y += lineHeight;

      // Equipment and status
      const equipCount = Object.values(char.equipment).filter((item) => item !== undefined).length;
      this.ctx.fillText(
        `  HP:${char.hp}/${char.maxHp} MP:${char.mp}/${char.maxMp} AC:${char.ac} Equipment:${equipCount}/7`,
        x,
        y
      );
      y += lineHeight;
    });

    return y;
  }

  private renderLootSystemInfo(x: number, y: number, lineHeight: number): number {
    this.ctx.fillStyle = '#ff8800';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.fillText('=== LOOT SYSTEM ===', x, y);
    y += lineHeight + 5;

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '11px monospace';

    const loot = this.debugData.lootSystem;
    if (loot) {
      this.ctx.fillText(`Dungeon Level: ${loot.dungeonLevel}`, x, y);
      y += lineHeight;
      this.ctx.fillText(`Dungeon Multiplier: ${loot.dungeonMultiplier.toFixed(1)}x`, x, y);
      y += lineHeight;
      this.ctx.fillText(`Luck Multiplier: ${loot.luckMultiplier.toFixed(3)}x`, x, y);
      y += lineHeight;
      this.ctx.fillText(`Total Drop Rate Multiplier: ${loot.totalMultiplier.toFixed(3)}x`, x, y);
      y += lineHeight;

      if (loot.lastRarityRolls && loot.lastRarityRolls.length > 0) {
        y += lineHeight;
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Recent Rarity Rolls:', x, y);
        y += lineHeight;
        this.ctx.fillStyle = '#fff';
        loot.lastRarityRolls.forEach((roll) => {
          this.ctx.fillText(`  ${roll}`, x, y);
          y += lineHeight;
        });
      }
    } else {
      this.ctx.fillText('No loot generation data available', x, y);
      y += lineHeight;
    }

    return y;
  }

  private renderCombatInfo(x: number, y: number, lineHeight: number): number {
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.fillText('=== COMBAT SYSTEM ===', x, y);
    y += lineHeight + 5;

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '11px monospace';

    const combat = this.debugData.combatSystem;
    if (combat) {
      if (combat.currentTurn) {
        this.ctx.fillText(`Current Turn: ${combat.currentTurn}`, x, y);
        y += lineHeight;
      }

      if (combat.turnOrder && combat.turnOrder.length > 0) {
        this.ctx.fillText('Turn Order:', x, y);
        y += lineHeight;
        combat.turnOrder.forEach((unit, index) => {
          this.ctx.fillText(`  ${index + 1}. ${unit}`, x, y);
          y += lineHeight;
        });
      }

      if (combat.escapeChances && combat.escapeChances.length > 0) {
        y += lineHeight;
        this.ctx.fillText('Escape Chances (last calculated):', x, y);
        y += lineHeight;
        combat.escapeChances.forEach((escape) => {
          this.ctx.fillText(`  ${escape.name}: ${Math.round(escape.chance * 100)}%`, x, y);
          y += lineHeight;
        });
      }
    } else {
      this.ctx.fillText('No combat active', x, y);
      y += lineHeight;
    }

    return y;
  }

  // Method to set current scene name (called by scenes)
  public setCurrentScene(sceneName: string): void {
    if (!this.debugData.systemInfo) {
      this.debugData.systemInfo = {
        currentScene: sceneName,
        combatEnabled: false,
        currentFloor: 1,
        gameTime: 0,
      };
    } else {
      this.debugData.systemInfo.currentScene = sceneName;
    }
  }
}
