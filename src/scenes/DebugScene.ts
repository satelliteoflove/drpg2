import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { CombatSystem } from '../systems/CombatSystem';
import { KEY_BINDINGS } from '../config/KeyBindings';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { DebugLogger } from '../utils/DebugLogger';
import { GameServices } from '../services/GameServices';

export class DebugScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private previousScene: string = 'dungeon';
  private scrollOffset: number = 0;
  private maxScrollOffset: number = 0;

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('debug');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
  }

  public setPreviousScene(sceneName: string): void {
    this.previousScene = sceneName;
  }

  public enter(): void {
    DebugLogger.info('DebugScene', 'Debug scene entered');
    this.scrollOffset = 0;
  }

  public exit(): void {
    DebugLogger.info('DebugScene', 'Debug scene exited');
  }

  public update(_deltaTime: number): void {
    // No update logic needed for debug scene
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Fallback render method - not used in layered rendering
    this.renderDebugContent(ctx);
  }

  private renderDebugContent(ctx: CanvasRenderingContext2D): void {
    // Get debug data from systems
    const lootData = GameServices.getInstance().getLootGenerator().getLootDebugData();
    const combatData = CombatSystem.getCombatDebugData();

    let currentY = 30 - this.scrollOffset;
    const lineHeight = 16;
    const sectionSpacing = 25;
    const padding = 20;

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('DEBUG INFORMATION', padding, currentY);
    currentY += 40;

    // Instructions
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '12px monospace';
    ctx.fillText(
      'Use Page Up/Down to scroll • Press P for Performance Report • Press Escape to return',
      padding,
      currentY
    );
    currentY += sectionSpacing;

    // System Information
    currentY = this.renderSystemInfo(ctx, padding, currentY, lineHeight);
    currentY += sectionSpacing;

    // Party Stats
    currentY = this.renderPartyStats(ctx, padding, currentY, lineHeight);
    currentY += sectionSpacing;

    // Loot System
    currentY = this.renderLootSystem(ctx, padding, currentY, lineHeight, lootData);
    currentY += sectionSpacing;

    // Combat System
    currentY = this.renderCombatSystem(ctx, padding, currentY, lineHeight, combatData);
    currentY += sectionSpacing;

    // Calculate max scroll offset for boundary checking
    this.maxScrollOffset = Math.max(0, currentY - ctx.canvas.height + 50);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    // Use layered rendering for debug screen
    const { renderManager } = renderContext;

    // Render background layer
    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    // Render UI layer
    renderManager.renderUI((ctx) => {
      this.renderDebugContent(ctx);
    });
  }

  public handleInput(key: string): boolean {
    DebugLogger.debug('DebugScene', `Key pressed: ${key}`);

    // Handle scrolling
    if (key === KEY_BINDINGS.ui.scrollUp) {
      this.scrollOffset = Math.max(0, this.scrollOffset - 50);
      return true;
    } else if (key === KEY_BINDINGS.ui.scrollDown) {
      this.scrollOffset = Math.min(this.maxScrollOffset, this.scrollOffset + 50);
      return true;
    }

    // Generate performance report with 'p' key (lowercase since InputManager converts to lowercase)
    if (key === 'p') {
      DebugLogger.info('DebugScene', 'Generating performance report...');
      this.generatePerformanceReport();
      return true;
    }

    // Handle escape to return to previous scene
    if (key === KEY_BINDINGS.ui.close) {
      this.sceneManager.switchTo(this.previousScene);
      return true;
    }

    return false;
  }

  private generatePerformanceReport(): void {
    const monitor = PerformanceMonitor.getInstance();
    const report = monitor.generateReport();
    const markdown = monitor.exportReportAsMarkdown(report);

    // Log full report to debug logger
    DebugLogger.info('Performance Report', '===== PERFORMANCE REPORT GENERATED =====');
    const lines = markdown.split('\n');
    lines.forEach((line) => {
      DebugLogger.info('Performance Report', line);
    });
    DebugLogger.info('Performance Report', '=========================================');

    // Show multiple messages to user for visibility
    if (this.gameState.messageLog) {
      this.gameState.messageLog.addSystemMessage('===================================');
      this.gameState.messageLog.addSystemMessage('PERFORMANCE REPORT GENERATED!');
      this.gameState.messageLog.addSystemMessage(
        `Performance Score: ${report.globalMetrics.performanceScore.toFixed(1)}/100`
      );
      this.gameState.messageLog.addSystemMessage(
        `Average FPS: ${report.globalMetrics.overallAverageFPS.toFixed(1)}`
      );
      this.gameState.messageLog.addSystemMessage('Report downloaded to your Downloads folder');
      this.gameState.messageLog.addSystemMessage('Full report available in Debug Logger');
      this.gameState.messageLog.addSystemMessage('===================================');
    }

    // Try to download as a file
    this.downloadReport(markdown);
  }

  private downloadReport(markdown: string): void {
    try {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      DebugLogger.info('Performance Report', 'Report successfully downloaded as markdown file');

      if (this.gameState.messageLog) {
        this.gameState.messageLog.addSystemMessage('✓ Report file downloaded successfully');
      }
    } catch (error) {
      DebugLogger.error('Performance Report', 'Failed to download report file', error);

      if (this.gameState.messageLog) {
        this.gameState.messageLog.addSystemMessage(
          '! Could not download report file - check Debug Logger'
        );
      }
    }
  }

  private renderSystemInfo(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    lineHeight: number
  ): number {
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('=== SYSTEM INFORMATION ===', x, y);
    y += lineHeight + 5;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';

    ctx.fillText(`Current Scene: ${this.previousScene}`, x, y);
    y += lineHeight;
    ctx.fillText(`Current Floor: ${this.gameState.currentFloor}`, x, y);
    y += lineHeight;
    ctx.fillText(`Combat Enabled: ${this.gameState.combatEnabled}`, x, y);
    y += lineHeight;
    ctx.fillText(`Game Time: ${this.gameState.gameTime}`, x, y);
    y += lineHeight;
    ctx.fillText(`Party Position: (${this.gameState.party.x}, ${this.gameState.party.y})`, x, y);
    y += lineHeight;
    ctx.fillText(`Party Facing: ${this.gameState.party.facing}`, x, y);
    y += lineHeight;

    return y;
  }

  private renderPartyStats(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    lineHeight: number
  ): number {
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('=== PARTY STATS & LUCK SYSTEM ===', x, y);
    y += lineHeight + 5;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';

    // Calculate party stats
    const totalLuck = this.gameState.party.characters.reduce(
      (sum: number, char: Character) => sum + char.stats.luck,
      0
    );
    const averageLevel =
      this.gameState.party.characters.reduce(
        (sum: number, char: Character) => sum + char.level,
        0
      ) / this.gameState.party.characters.length;
    const luckMultiplier = 1.0 + (totalLuck - 60) * 0.005;

    ctx.fillText(`Total Party Luck: ${totalLuck} (Base: 60)`, x, y);
    y += lineHeight;
    ctx.fillText(`Average Party Level: ${averageLevel.toFixed(1)}`, x, y);
    y += lineHeight;
    ctx.fillText(`Luck Multiplier: ${luckMultiplier.toFixed(3)}x`, x, y);
    y += lineHeight;
    y += lineHeight;

    // Individual character stats
    this.gameState.party.characters.forEach((char: Character) => {
      const status = char.isDead ? ' (DEAD)' : '';
      ctx.fillStyle = char.isDead ? '#888888' : '#CCCCCC';
      ctx.fillText(`${char.name} (${char.class}, Lvl ${char.level})${status}:`, x, y);
      y += lineHeight;

      ctx.fillStyle = char.isDead ? '#666666' : '#FFFFFF';
      const stats = `  STR:${char.stats.strength} INT:${char.stats.intelligence} PIE:${char.stats.piety} VIT:${char.stats.vitality} AGI:${char.stats.agility} LUK:${char.stats.luck}`;
      ctx.fillText(stats, x, y);
      y += lineHeight;

      const equipCount = Object.values(char.equipment).filter((item) => item !== undefined).length;
      ctx.fillText(
        `  HP:${char.hp}/${char.maxHp} MP:${char.mp}/${char.maxMp} AC:${char.effectiveAC} Equipment:${equipCount}/7 Items:${char.inventory.length}/20`,
        x,
        y
      );
      y += lineHeight;
    });

    return y;
  }

  private renderLootSystem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    lineHeight: number,
    lootData: any
  ): number {
    ctx.fillStyle = '#FF8800';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('=== LOOT SYSTEM ===', x, y);
    y += lineHeight + 5;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';

    if (lootData) {
      ctx.fillText(`Dungeon Level: ${lootData.dungeonLevel}`, x, y);
      y += lineHeight;
      ctx.fillText(`Dungeon Multiplier: ${lootData.dungeonMultiplier.toFixed(1)}x`, x, y);
      y += lineHeight;
      ctx.fillText(`Luck Multiplier: ${lootData.luckMultiplier.toFixed(3)}x`, x, y);
      y += lineHeight;
      ctx.fillText(`Total Drop Rate Multiplier: ${lootData.totalMultiplier.toFixed(3)}x`, x, y);
      y += lineHeight;

      if (lootData.lastRarityRolls && lootData.lastRarityRolls.length > 0) {
        y += lineHeight;
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('Recent Rarity Rolls:', x, y);
        y += lineHeight;
        ctx.fillStyle = '#FFFFFF';
        lootData.lastRarityRolls.forEach((roll: string) => {
          ctx.fillText(`  ${roll}`, x, y);
          y += lineHeight;
        });
      }
    } else {
      ctx.fillText('No loot generation data available', x, y);
      y += lineHeight;
    }

    return y;
  }

  private renderCombatSystem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    lineHeight: number,
    combatData: any
  ): number {
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('=== COMBAT SYSTEM ===', x, y);
    y += lineHeight + 5;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';

    if (combatData && combatData.isActive) {
      if (combatData.currentTurn) {
        ctx.fillText(`Current Turn: ${combatData.currentTurn}`, x, y);
        y += lineHeight;
      }

      if (combatData.turnOrder && combatData.turnOrder.length > 0) {
        ctx.fillText('Turn Order:', x, y);
        y += lineHeight;
        combatData.turnOrder.forEach((unit: string, index: number) => {
          ctx.fillText(`  ${index + 1}. ${unit}`, x, y);
          y += lineHeight;
        });
      }

      if (combatData.escapeChances && combatData.escapeChances.length > 0) {
        y += lineHeight;
        ctx.fillText('Escape Chances:', x, y);
        y += lineHeight;
        combatData.escapeChances.forEach((escape: { name: string; chance: number }) => {
          ctx.fillText(`  ${escape.name}: ${Math.round(escape.chance * 100)}%`, x, y);
          y += lineHeight;
        });
      }
    } else {
      ctx.fillText('No combat active', x, y);
      y += lineHeight;
    }

    return y;
  }
}
