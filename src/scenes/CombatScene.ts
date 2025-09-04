import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState, Monster, Item } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { CombatSystem } from '../systems/CombatSystem';
import { StatusPanel } from '../ui/StatusPanel';
import { DebugOverlay } from '../ui/DebugOverlay';
import { DataLoader } from '../utils/DataLoader';
import { InventorySystem } from '../systems/InventorySystem';
import { KEY_BINDINGS } from '../config/KeyBindings';
import { DebugLogger } from '../utils/DebugLogger';

export class CombatScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private combatSystem: CombatSystem;
  private statusPanel!: StatusPanel;
  private debugOverlay!: DebugOverlay;
  private messageLog: any; // Shared from gameState
  private selectedAction: number = 0;
  private selectedTarget: number = 0;
  private actionState: 'select_action' | 'select_target' | 'select_spell' | 'waiting' =
    'select_action';
  private isProcessingAction: boolean = false; // Prevent multiple simultaneous actions
  private lastActionTime: number = 0; // Debounce rapid input

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Combat');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.combatSystem = new CombatSystem();
    
    // Initialize messageLog immediately to avoid runtime errors
    this.messageLog = this.gameState.messageLog;
    
    // Safety check - if messageLog is still undefined, create a temporary one
    if (!this.messageLog) {
      DebugLogger.warn('CombatScene', 'MessageLog not found in gameState, this should not happen');
    }
  }

  public enter(): void {
    // Set debug overlay scene name
    this.debugOverlay?.setCurrentScene('Combat');
    
    this.initializeCombat();
    this.actionState = 'select_action';
    this.selectedAction = 0;
    this.selectedTarget = 0;
    this.isProcessingAction = false;
    this.lastActionTime = 0;
    DebugLogger.debug('CombatScene', 'Combat scene entered - UI state reset');
  }

  public exit(): void {
    this.gameState.inCombat = false;
  }

  private initializeCombat(): void {
    const monsters = this.generateMonsters();
    const aliveCharacters = this.gameState.party.getAliveCharacters();

    // Generate appropriate encounter message based on monsters and context
    this.generateEncounterMessage(monsters);

    this.combatSystem.startCombat(monsters, aliveCharacters, this.gameState.currentFloor, (victory: boolean, rewards, escaped) => {
      this.endCombat(victory, rewards, escaped);
    }, (message: string) => {
      // Callback for monster turn messages
      if (message) {
        this.messageLog.addCombatMessage(message);
      }
    });
  }

  private generateMonsters(): Monster[] {
    const dungeonLevel = this.gameState.currentFloor;
    const partyLevel = this.getAveragePartyLevel();
    
    return DataLoader.generateMonstersForLevel(dungeonLevel, partyLevel);
  }

  private getAveragePartyLevel(): number {
    const aliveCharacters = this.gameState.party.getAliveCharacters();
    if (aliveCharacters.length === 0) return 1;
    
    const totalLevel = aliveCharacters.reduce((sum: number, character: any) => sum + character.level, 0);
    return Math.floor(totalLevel / aliveCharacters.length);
  }

  private generateEncounterMessage(monsters: Monster[]): void {
    // Always generate message based on actual monsters encountered
    const monsterCounts = new Map<string, number>();
    monsters.forEach(monster => {
      const baseName = monster.name.replace(/ \d+$/, ''); // Remove number suffix
      monsterCounts.set(baseName, (monsterCounts.get(baseName) || 0) + 1);
    });

    const monsterTypes = Array.from(monsterCounts.entries());
    
    // Helper function to add correct article (a/an)
    const withArticle = (word: string): string => {
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const article = vowels.includes(word[0].toLowerCase()) ? 'an' : 'a';
      return `${article} ${word}`;
    };
    
    // Always generate message based on actual monsters
    if (monsterTypes.length === 1) {
      const [type, count] = monsterTypes[0];
      if (count === 1) {
        this.messageLog.addCombatMessage(`${withArticle(type.toLowerCase()).charAt(0).toUpperCase() + withArticle(type.toLowerCase()).slice(1)} appears!`);
      } else {
        this.messageLog.addCombatMessage(`A group of ${count} ${type.toLowerCase()}s appears!`);
      }
    } else {
      const typeList = monsterTypes.map(([type, count]) => 
        count === 1 ? withArticle(type.toLowerCase()) : `${count} ${type.toLowerCase()}s`
      ).join(', ');
      this.messageLog.addCombatMessage(`A hostile group appears: ${typeList}!`);
    }

    // Clear encounter context after use
    this.gameState.encounterContext = undefined;
  }

  public update(_deltaTime: number): void {
    // CombatSystem now handles all turn processing automatically
    // Just check if party is wiped after any updates
    if (this.gameState.party.isWiped()) {
      this.messageLog.addDeathMessage('Party defeated!');
      this.isProcessingAction = false;
      this.endCombat(false, undefined, false);
      return;
    }
    
    // Check if we should reset UI state when it's player's turn
    const canPlayerAct = this.combatSystem.canPlayerAct();
    if (canPlayerAct && this.actionState === 'waiting') {
      this.actionState = 'select_action';
      this.isProcessingAction = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.statusPanel) {
      this.initializeUI(ctx.canvas);
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderCombatArea(ctx);
    this.renderUI(ctx);
    this.renderCombatInfo(ctx);
    
    // Update and render debug overlay
    this.updateDebugData();
    this.debugOverlay.render(this.gameState);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;
    
    if (!this.statusPanel) {
      this.initializeUI(renderContext.mainContext.canvas);
    }

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderEntities((ctx) => {
      this.renderCombatArea(ctx);
    });

    renderManager.renderUI((ctx) => {
      this.renderUI(ctx);
      this.renderCombatInfo(ctx);
      this.renderCombatControls(ctx);
      
      // Update and render debug overlay
      this.updateDebugData();
      this.debugOverlay.render(this.gameState);
    });
  }

  private initializeUI(canvas: HTMLCanvasElement): void {
    this.statusPanel = new StatusPanel(canvas, 650, 0, 374, 300);
    this.debugOverlay = new DebugOverlay(canvas);
    
    // Only add combat message, don't create a new log
    this.messageLog.addCombatMessage('Combat begins!');
  }

  private renderCombatArea(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(0, 0, 640, 400);

    ctx.strokeStyle = '#600000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 640, 400);

    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return;

    this.renderMonsters(ctx, encounter.monsters);
  }

  private renderMonsters(ctx: CanvasRenderingContext2D, monsters: Monster[]): void {
    monsters.forEach((monster, index) => {
      if (monster.hp <= 0) return;

      const x = 100 + (index % 3) * 150;
      const y = 80 + Math.floor(index / 3) * 120;

      if (this.actionState === 'select_target' && index === this.selectedTarget) {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x - 5, y - 5, 110, 110);
      }

      ctx.fillStyle = '#800000';
      ctx.fillRect(x, y, 100, 100);

      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 100, 100);

      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(monster.name, x + 50, y + 20);

      const hpPercent = monster.hp / monster.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 10, y + 30, 80, 8);

      ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
      ctx.fillRect(x + 10, y + 30, 80 * hpPercent, 8);

      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`${monster.hp}/${monster.maxHp}`, x + 50, y + 50);

      ctx.fillStyle = '#fff';
      ctx.font = '36px monospace';
      ctx.fillText('👹', x + 50, y + 85);
    });
  }


  private renderUI(ctx: CanvasRenderingContext2D): void {
    this.statusPanel.render(this.gameState.party, ctx);
    this.messageLog.render(ctx);

    if (this.combatSystem.canPlayerAct()) {
      this.renderActionMenu(ctx);
    }
  }

  private renderActionMenu(ctx: CanvasRenderingContext2D): void {
    const menuX = 20;
    const menuY = 420;
    const menuWidth = 600;
    const menuHeight = 320;

    ctx.fillStyle = '#222';
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';

    if (this.actionState === 'select_action') {
      const actions = this.combatSystem.getPlayerOptions();

      ctx.fillText('Select Action:', menuX + 10, menuY + 25);

      actions.forEach((action, index) => {
        const y = menuY + 50 + index * 25;

        ctx.fillStyle = index === this.selectedAction ? '#ffff00' : '#fff';
        ctx.fillText(`${index + 1}. ${action}`, menuX + 20, y);
      });
    } else if (this.actionState === 'select_target') {
      ctx.fillText('Select Target:', menuX + 10, menuY + 25);
      ctx.fillText('Use LEFT/RIGHT arrows to select target', menuX + 10, menuY + 50);
      ctx.fillText('Press ENTER to attack', menuX + 10, menuY + 75);
    } else if (this.actionState === 'waiting') {
      ctx.fillText('Processing turn...', menuX + 10, menuY + 25);
    }
  }

  private renderCombatInfo(ctx: CanvasRenderingContext2D): void {
    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return;

    const currentUnit = this.combatSystem.getCurrentUnit();

    if (currentUnit) {
      const turnOrder = encounter.turnOrder.map(unit => ('class' in unit ? unit.name : unit.name));

      this.statusPanel.renderCombatStatus(
        'class' in currentUnit ? currentUnit.name : currentUnit.name,
        turnOrder,
        encounter.currentTurn,
        ctx
      );
    }

    // Show debug hint
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    ctx.fillText('[DEBUG: Press Ctrl+K for instant kill]', ctx.canvas.width - 200, ctx.canvas.height - 10);
  }


  public handleInput(key: string): boolean {
    // Handle debug scene key combination
    if (key === KEY_BINDINGS.dungeonActions.debugOverlay) {
      DebugLogger.debug('CombatScene', 'Switching to debug scene from combat');
      const debugScene = this.sceneManager.getScene('debug') as any;
      if (debugScene && debugScene.setPreviousScene) {
        debugScene.setPreviousScene('combat');
      }
      this.sceneManager.switchTo('debug');
      return true;
    }

    // Debug instant kill - Ctrl+K kills all enemies
    if (key === 'ctrl+k') {
      this.executeInstantKill();
      return true;
    }

    // Ignore all input if we're processing an action or waiting
    if (this.isProcessingAction || this.actionState === 'waiting') return true;

    if (this.actionState === 'select_action') {
      return this.handleActionSelection(key);
    } else if (this.actionState === 'select_target') {
      return this.handleTargetSelection(key);
    }

    return false;
  }

  private handleActionSelection(key: string): boolean {
    const actions = this.combatSystem.getPlayerOptions();

    if (key === KEY_BINDINGS.combat.selectUp) {
      this.selectedAction = Math.max(0, this.selectedAction - 1);
      return true;
    } else if (key === KEY_BINDINGS.combat.selectDown) {
      this.selectedAction = Math.min(actions.length - 1, this.selectedAction + 1);
      return true;
    } else if (key === KEY_BINDINGS.combat.confirm) {
      const selectedActionText = actions[this.selectedAction];

      if (selectedActionText === 'Attack') {
        this.actionState = 'select_target';
        this.selectedTarget = 0;
      } else {
        this.executeAction(selectedActionText);
      }
      return true;
    }

    return false;
  }

  private handleTargetSelection(key: string): boolean {
    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return false;

    const aliveMonsters = encounter.monsters.filter(m => m.hp > 0);

    if (key === KEY_BINDINGS.combat.selectLeft) {
      this.selectedTarget = Math.max(0, this.selectedTarget - 1);
      return true;
    } else if (key === KEY_BINDINGS.combat.selectRight) {
      this.selectedTarget = Math.min(aliveMonsters.length - 1, this.selectedTarget + 1);
      return true;
    } else if (key === KEY_BINDINGS.combat.confirm) {
      this.executeAction('Attack');
      return true;
    } else if (key === KEY_BINDINGS.combat.cancel) {
      this.actionState = 'select_action';
      return true;
    }

    return false;
  }

  private executeAction(action: string): void {
    const now = Date.now();
    
    // Debounce rapid input - ignore if pressed too quickly
    if (now - this.lastActionTime < 100) {
      DebugLogger.debug('CombatScene', 'Action debounced - pressed too quickly');
      return;
    }
    this.lastActionTime = now;
    
    // Prevent multiple simultaneous executions
    if (this.isProcessingAction) {
      DebugLogger.debug('CombatScene', 'Action blocked - already processing');
      return;
    }
    
    this.isProcessingAction = true;
    this.actionState = 'waiting';

    let result = '';
    if (action === 'Attack') {
      result = this.combatSystem.executePlayerAction(action, this.selectedTarget);
    } else {
      result = this.combatSystem.executePlayerAction(action);
    }

    DebugLogger.debug('CombatScene', `Action result: "${result}"`);

    // Handle different result types
    if (result === 'Action already in progress') {
      // CombatSystem is busy - reset UI immediately
      DebugLogger.debug('CombatScene', 'CombatSystem busy - resetting UI');
      this.isProcessingAction = false;
      this.actionState = 'select_action';
      return;
    } else if (result === 'Combat state invalid') {
      // Combat ended unexpectedly
      DebugLogger.debug('CombatScene', 'Combat state invalid - resetting UI');
      this.isProcessingAction = false;
      this.actionState = 'select_action';
      return;
    } else if (result && result.length > 0) {
      // Valid action result
      this.messageLog.addCombatMessage(result);
    }

    // Update UI state immediately
    const canAct = this.combatSystem.canPlayerAct();
    this.actionState = canAct ? 'select_action' : 'waiting';
    this.selectedAction = 0;
    this.isProcessingAction = false;
    DebugLogger.debug('CombatScene', `UI state reset - canPlayerAct: ${canAct}, actionState: ${this.actionState}`);
  }

  private executeInstantKill(): void {
    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return;

    // Deal 999 damage to all enemies
    this.messageLog.addSystemMessage('[DEBUG] Instant Kill activated! Dealing 999 damage to all enemies.');
    
    encounter.monsters.forEach(monster => {
      if (monster.hp > 0) {
        monster.hp = 0;
        this.messageLog.addCombatMessage(`${monster.name} takes 999 damage and is defeated!`);
      }
    });

    // Force check combat end to trigger rewards
    this.combatSystem.forceCheckCombatEnd();
  }

  private endCombat(victory: boolean, rewards?: { experience: number; gold: number; items: Item[] }, escaped?: boolean): void {
    try {
      DebugLogger.debug('CombatScene', 'endCombat called', { victory, rewards });
      
      // Reset processing flag to prevent lockups
      this.isProcessingAction = false;
      
      if (victory && rewards) {
        this.messageLog.addSystemMessage(
          `Victory! Gained ${rewards.experience} experience and ${rewards.gold} gold!`
        );
        
        DebugLogger.debug('CombatScene', 'Distributing rewards to party...');
        this.gameState.party.distributeExperience(rewards.experience);
        this.gameState.party.distributeGold(rewards.gold);
        
        // Handle item drops - store for distribution after scene switch
        if (rewards.items && rewards.items.length > 0) {
          this.messageLog.addSystemMessage(`Found ${rewards.items.length} item(s)!`);
          rewards.items.forEach(item => {
            this.messageLog.addSystemMessage(`- ${item.identified ? item.name : item.unidentifiedName || '?Item'}`);
          });
          
          // Store items to be distributed when returning to dungeon
          this.gameState.pendingLoot = rewards.items;
        }
        
        DebugLogger.debug('CombatScene', 'Rewards distributed successfully');
      } else if (escaped) {
        this.messageLog.addSystemMessage('Successfully ran away!');
      } else {
        this.messageLog.addDeathMessage('Defeated...');
      }

      this.sceneManager.switchTo('dungeon');
    } catch (error) {
      DebugLogger.error('CombatScene', 'Error in endCombat', error);
      this.messageLog.addWarningMessage('Error processing combat results');
      this.isProcessingAction = false; // Ensure flag is reset even on error
      this.sceneManager.switchTo('dungeon');
    }
  }

  private renderCombatControls(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    const y = ctx.canvas.height - 30;
    
    if (this.actionState === 'select_action' && this.combatSystem.canPlayerAct()) {
      let controls = 'UP/DOWN: Select Action | ENTER: Confirm';
      if (this.selectedAction === 0) { // Attack action
        controls += ' | LEFT/RIGHT: Select Target';
      }
      ctx.fillText(controls, 10, y);
      ctx.fillText('1: Attack | 2: Defend | 3: Run | K: Instant Kill (debug)', 10, y + 12);
    } else {
      ctx.fillText('Processing turn... please wait', 10, y);
    }
  }

  private updateDebugData(): void {
    if (!this.debugOverlay) return;

    // Get current system debug data
    const lootData = InventorySystem.getLootDebugData();
    const combatData = CombatSystem.getCombatDebugData();
    
    // Calculate party stats
    const totalLuck = this.gameState.party.characters.reduce((sum: number, char: Character) => sum + char.stats.luck, 0);
    const averageLevel = this.gameState.party.characters.reduce((sum: number, char: Character) => sum + char.level, 0) / this.gameState.party.characters.length;
    
    // Update debug overlay with current data
    this.debugOverlay.updateDebugData({
      lootSystem: lootData,
      partyStats: {
        totalLuck,
        luckMultiplier: lootData.luckMultiplier,
        averageLevel
      },
      combatSystem: combatData
    });
  }
}
