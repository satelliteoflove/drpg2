import { BaseASCIIScene } from '../BaseASCIIScene';
import { ASCIIState, ASCII_GRID_HEIGHT, ASCII_GRID_WIDTH } from '../ASCIIState';
import { ASCII_SYMBOLS } from '../ASCIISymbols';
import { InputZone, SceneDeclaration } from '../SceneDeclaration';
import { GameState, Monster } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { CombatSystem } from '../../systems/CombatSystem';
import { DebugLogger } from '../../utils/DebugLogger';

export class CombatASCIIState extends BaseASCIIScene {
  private gameState: GameState;
  private combatSystem: CombatSystem;
  private selectedAction: number = 0;
  private selectedTarget: number = 0;
  private actionState: 'select_action' | 'select_target' | 'select_spell' | 'waiting' =
    'select_action';
  private pendingAction: { action: string; target?: number } | null = null;

  private actionOptions = [
    { name: 'Attack', symbol: ASCII_SYMBOLS.ITEM_WEAPON, enabled: true },
    { name: 'Defend', symbol: ASCII_SYMBOLS.ITEM_SHIELD, enabled: true },
    { name: 'Spell', symbol: ASCII_SYMBOLS.ITEM_WAND, enabled: false },
    { name: 'Run', symbol: ASCII_SYMBOLS.STAIRS_DOWN, enabled: true },
  ];

  constructor(gameState: GameState, _sceneManager: SceneManager, combatSystem: CombatSystem) {
    super('Combat', 'ascii_combat_scene');
    this.gameState = gameState;
    this.combatSystem = combatSystem;
    this.initializeCombatLayout();
  }

  public getGrid(): ASCIIState {
    return this.asciiState;
  }

  public render(): void {
    this.initializeCombatLayout();
  }

  private initializeCombatLayout(): void {
    const grid = this.asciiState;

    // Clear the grid
    grid.clear();

    // Draw main border
    grid.drawBox(0, 0, ASCII_GRID_WIDTH, ASCII_GRID_HEIGHT - 1);

    // Draw title bar
    const title = '=== COMBAT [ASCII MODE] ===';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 1, title, { foreground: '#FF0000', bold: true });

    // Draw battlefield area
    this.drawBattlefield(grid);

    // Draw party status
    this.drawPartyStatus(grid);

    // Draw action menu or waiting message
    if (this.actionState === 'waiting') {
      this.drawWaitingMessage(grid);
    } else {
      this.drawActionMenu(grid);
    }

    // Draw help text
    this.drawHelpText(grid);
  }

  private drawBattlefield(grid: ASCIIState): void {
    // Battlefield box
    grid.drawBox(2, 3, ASCII_GRID_WIDTH - 4, 15);

    // Draw monsters
    const encounter = this.combatSystem.getEncounter();
    if (encounter && encounter.monsters) {
      this.drawMonsters(grid, encounter.monsters);
    }

    // Draw party representation
    this.drawPartyFormation(grid);
  }

  private drawMonsters(grid: ASCIIState, monsters: Monster[]): void {
    const monsterAreaX = 10;
    const monsterAreaY = 5;
    const monstersPerRow = 3;

    monsters.forEach((monster, index) => {
      if (monster.hp <= 0) return;

      const row = Math.floor(index / monstersPerRow);
      const col = index % monstersPerRow;
      const x = monsterAreaX + col * 20;
      const y = monsterAreaY + row * 4;

      // Draw monster symbol with selection highlight
      if (this.actionState === 'select_target' && index === this.selectedTarget) {
        grid.writeText(x - 2, y, '>>', { foreground: '#FFFF00', bold: true });
        grid.writeText(x + 15, y, '<<', { foreground: '#FFFF00', bold: true });
      }

      // Monster representation
      const monsterSymbol = this.getMonsterSymbol(monster.name);
      grid.writeText(x, y, `[${monsterSymbol}]`, {
        foreground: monster.hp > monster.maxHp * 0.5 ? '#FF6666' : '#FF0000',
      });

      // Monster name
      const displayName =
        monster.name.length > 12 ? monster.name.substring(0, 12) + '.' : monster.name;
      grid.writeText(x, y + 1, displayName, { foreground: '#FFFFFF' });

      // Health bar
      const hpPercent = monster.hp / monster.maxHp;
      const barLength = 10;
      const filledBars = Math.floor(hpPercent * barLength);
      const emptyBars = barLength - filledBars;

      const healthBar = '[' + '='.repeat(filledBars) + '-'.repeat(emptyBars) + ']';
      const barColor = hpPercent > 0.5 ? '#00FF00' : hpPercent > 0.25 ? '#FFAA00' : '#FF0000';
      grid.writeText(x, y + 2, healthBar, { foreground: barColor });

      // HP text
      const hpText = `${monster.hp}/${monster.maxHp}`;
      grid.writeText(x + 2, y + 3, hpText, { foreground: '#AAAAAA' });
    });
  }

  private getMonsterSymbol(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('orc')) return ASCII_SYMBOLS.MONSTER_MEDIUM;
    if (lowerName.includes('slime')) return ASCII_SYMBOLS.MONSTER_WEAK;
    if (lowerName.includes('goblin')) return ASCII_SYMBOLS.MONSTER_WEAK;
    if (lowerName.includes('wolf')) return ASCII_SYMBOLS.MONSTER_BEAST;
    if (lowerName.includes('skeleton')) return ASCII_SYMBOLS.MONSTER_UNDEAD;
    if (lowerName.includes('zombie')) return ASCII_SYMBOLS.MONSTER_UNDEAD;
    if (lowerName.includes('dragon')) return ASCII_SYMBOLS.MONSTER_STRONG;
    return ASCII_SYMBOLS.MONSTER_WEAK; // Default monster symbol
  }

  private drawPartyFormation(grid: ASCIIState): void {
    const partyX = 55;
    const partyY = 6;

    grid.writeText(partyX, partyY, '=== PARTY ===', { foreground: '#00AAFF', bold: true });

    const aliveCharacters = this.gameState.party.getAliveCharacters();
    aliveCharacters.forEach((char: any, index: number) => {
      const y = partyY + 2 + index * 2;

      // Character symbol based on class
      const classSymbol = this.getClassSymbol(char.class);
      grid.writeText(partyX, y, `[${classSymbol}]`, { foreground: '#00FF00' });

      // Character name (truncated)
      const displayName = char.name.length > 8 ? char.name.substring(0, 8) + '.' : char.name;
      grid.writeText(partyX + 4, y, displayName, { foreground: '#FFFFFF' });

      // HP indicator
      const hpPercent = char.stats.hp / char.stats.maxHp;
      const hpColor = hpPercent > 0.5 ? '#00FF00' : hpPercent > 0.25 ? '#FFAA00' : '#FF0000';
      const hpText = `${char.stats.hp}/${char.stats.maxHp}`;
      grid.writeText(partyX + 13, y, hpText, { foreground: hpColor });
    });
  }

  private getClassSymbol(className: string): string {
    switch (className.toLowerCase()) {
      case 'fighter':
        return 'F';
      case 'mage':
        return 'M';
      case 'priest':
        return 'P';
      case 'thief':
        return 'T';
      default:
        return '@';
    }
  }

  private drawPartyStatus(grid: ASCIIState): void {
    const statusY = 19;
    grid.drawBox(2, statusY, ASCII_GRID_WIDTH - 4, 8);

    grid.writeText(4, statusY + 1, '=== PARTY STATUS ===', { foreground: '#00AAFF', bold: true });

    const party = this.gameState.party.getAliveCharacters();
    let xOffset = 4;

    party.forEach((char: any) => {
      const y = statusY + 3;

      // Character info block
      const name = char.name.substring(0, 6);
      grid.writeText(xOffset, y, name, { foreground: '#FFFFFF' });

      const hpPercent = char.stats.hp / char.stats.maxHp;
      const hpColor = hpPercent > 0.5 ? '#00FF00' : hpPercent > 0.25 ? '#FFAA00' : '#FF0000';

      grid.writeText(xOffset, y + 1, 'HP:', { foreground: '#AAAAAA' });
      grid.writeText(xOffset + 3, y + 1, `${char.stats.hp}/${char.stats.maxHp}`, {
        foreground: hpColor,
      });

      grid.writeText(xOffset, y + 2, 'MP:', { foreground: '#AAAAAA' });
      grid.writeText(xOffset + 3, y + 2, `${char.stats.mp}/${char.stats.maxMp}`, {
        foreground: '#6666FF',
      });

      grid.writeText(xOffset, y + 3, `AC:${char.stats.ac}`, { foreground: '#AAAAAA' });

      xOffset += 13;
    });
  }

  private drawActionMenu(grid: ASCIIState): void {
    const menuY = 28;
    grid.drawBox(2, menuY, ASCII_GRID_WIDTH - 4, 10);

    const currentUnit = this.combatSystem.getCurrentUnit();
    const isPlayerTurn = currentUnit && 'class' in currentUnit;

    if (!isPlayerTurn) {
      grid.writeText(4, menuY + 2, "Enemy's Turn...", { foreground: '#FF6666' });
      return;
    }

    if (this.actionState === 'select_action') {
      grid.writeText(4, menuY + 1, '=== SELECT ACTION ===', { foreground: '#FFFF00', bold: true });

      this.actionOptions.forEach((option, index) => {
        const y = menuY + 3 + index;
        const isSelected = index === this.selectedAction;

        if (isSelected) {
          grid.writeText(4, y, ASCII_SYMBOLS.MENU_CURSOR, { foreground: '#FFAA00' });
        }

        const textColor = option.enabled ? (isSelected ? '#FFAA00' : '#FFFFFF') : '#666666';

        grid.writeText(6, y, `${option.symbol} ${option.name}`, { foreground: textColor });

        if (!option.enabled) {
          grid.writeText(16, y, '(Unavailable)', { foreground: '#666666' });
        }
      });
    } else if (this.actionState === 'select_target') {
      grid.writeText(4, menuY + 1, '=== SELECT TARGET ===', { foreground: '#FFFF00', bold: true });
      grid.writeText(4, menuY + 3, 'Use LEFT/RIGHT arrows to select target', {
        foreground: '#AAAAAA',
      });
      grid.writeText(4, menuY + 4, 'Press ENTER to confirm', { foreground: '#AAAAAA' });
      grid.writeText(4, menuY + 5, 'Press ESC to cancel', { foreground: '#AAAAAA' });

      const encounter = this.combatSystem.getEncounter();
      if (encounter) {
        const aliveMonsters = encounter.monsters.filter((m) => m.hp > 0);
        const targetMonster = aliveMonsters[this.selectedTarget];
        if (targetMonster) {
          grid.writeText(4, menuY + 7, `Target: ${targetMonster.name}`, { foreground: '#FFAA00' });
        }
      }
    }
  }

  private drawWaitingMessage(grid: ASCIIState): void {
    const menuY = 28;
    grid.drawBox(2, menuY, ASCII_GRID_WIDTH - 4, 10);
    grid.writeText(4, menuY + 2, 'Processing turn...', { foreground: '#AAAAAA' });
  }

  private drawHelpText(grid: ASCIIState): void {
    const helpY = ASCII_GRID_HEIGHT - 2;
    let helpText = '';

    if (this.actionState === 'select_action') {
      helpText = 'UP/DOWN: Select | ENTER: Confirm | 1-4: Quick Select | ESC: Menu';
    } else if (this.actionState === 'select_target') {
      helpText = 'LEFT/RIGHT: Target | ENTER: Attack | ESC: Cancel';
    } else {
      helpText = 'Waiting...';
    }

    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, helpY, helpText, { foreground: '#666666' });
  }

  public override enter(): void {
    super.enter();
    this.selectedAction = 0;
    this.selectedTarget = 0;
    this.actionState = 'select_action';
    this.initializeCombatLayout();
    DebugLogger.info('CombatASCIIState', 'Entered Combat scene');
  }

  public override update(deltaTime: number): void {
    super.update(deltaTime);

    // Update combat display based on current state
    const canPlayerAct = this.combatSystem.canPlayerAct();
    if (canPlayerAct && this.actionState === 'waiting') {
      this.actionState = 'select_action';
      this.initializeCombatLayout();
    } else if (!canPlayerAct && this.actionState !== 'waiting') {
      this.actionState = 'waiting';
      this.initializeCombatLayout();
    }
  }

  public override handleInput(key: string): boolean {
    // Don't handle input while waiting
    if (this.actionState === 'waiting') return false;

    if (this.actionState === 'select_action') {
      switch (key) {
        case 'arrowup':
        case 'w':
          this.selectPreviousAction();
          return true;
        case 'arrowdown':
        case 's':
          this.selectNextAction();
          return true;
        case 'enter':
        case ' ':
          this.confirmAction();
          return true;
        case '1':
        case '2':
        case '3':
        case '4':
          const index = parseInt(key) - 1;
          if (index < this.actionOptions.length) {
            this.selectedAction = index;
            this.confirmAction();
          }
          return true;
      }
    } else if (this.actionState === 'select_target') {
      switch (key) {
        case 'arrowleft':
        case 'a':
          this.selectPreviousTarget();
          return true;
        case 'arrowright':
        case 'd':
          this.selectNextTarget();
          return true;
        case 'enter':
        case ' ':
          this.executeAttack();
          return true;
        case 'escape':
          this.cancelTargetSelection();
          return true;
      }
    }

    return false;
  }

  private selectPreviousAction(): void {
    this.selectedAction =
      (this.selectedAction - 1 + this.actionOptions.length) % this.actionOptions.length;
    this.initializeCombatLayout();
  }

  private selectNextAction(): void {
    this.selectedAction = (this.selectedAction + 1) % this.actionOptions.length;
    this.initializeCombatLayout();
  }

  private confirmAction(): void {
    const action = this.actionOptions[this.selectedAction];
    if (!action.enabled) return;

    if (action.name === 'Attack') {
      this.actionState = 'select_target';
      this.selectedTarget = 0;
      this.initializeCombatLayout();
    } else {
      // Execute other actions directly
      this.executeAction(action.name);
    }
  }

  private selectPreviousTarget(): void {
    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return;

    const aliveMonsters = encounter.monsters.filter((m) => m.hp > 0);
    if (aliveMonsters.length === 0) return;
    this.selectedTarget = Math.max(0, this.selectedTarget - 1);
    this.initializeCombatLayout();
  }

  private selectNextTarget(): void {
    const encounter = this.combatSystem.getEncounter();
    if (!encounter) return;

    const aliveMonsters = encounter.monsters.filter((m) => m.hp > 0);
    this.selectedTarget = Math.min(aliveMonsters.length - 1, this.selectedTarget + 1);
    this.initializeCombatLayout();
  }

  private executeAttack(): void {
    this.executeAction('Attack');
  }

  private executeAction(action: string): void {
    this.actionState = 'waiting';
    this.initializeCombatLayout();

    // Store the pending action for the parent scene to execute
    this.pendingAction = {
      action: action,
      target: action === 'Attack' ? this.selectedTarget : undefined,
    };

    DebugLogger.info(
      'CombatASCIIState',
      `Executing action: ${action} on target: ${this.selectedTarget}`
    );
  }

  private cancelTargetSelection(): void {
    this.actionState = 'select_action';
    this.initializeCombatLayout();
  }

  protected setupInputHandlers(): void {
    // Input handlers are managed through handleInput method
  }

  protected updateASCIIState(_deltaTime: number): void {
    // Update any animations or dynamic elements
  }

  protected setupScene(): void {
    this.initializeCombatLayout();
  }

  public getSceneDeclaration(): SceneDeclaration {
    return this.generateSceneDeclaration();
  }

  protected generateSceneDeclaration(): SceneDeclaration {
    const inputZones: InputZone[] = [];

    // Add input zones for action menu items
    if (this.actionState === 'select_action') {
      this.actionOptions.forEach((option, index) => {
        inputZones.push({
          id: `action-${index}`,
          bounds: {
            x: 4,
            y: 31 + index,
            width: 20,
            height: 1,
          },
          type: 'menu-item',
          enabled: option.enabled,
          onActivate: option.enabled
            ? () => {
                this.selectedAction = index;
                this.confirmAction();
              }
            : undefined,
        });
      });
    }

    // Add input zones for monster targets
    if (this.actionState === 'select_target') {
      const encounter = this.combatSystem.getEncounter();
      if (encounter) {
        encounter.monsters.forEach((monster, index) => {
          if (monster.hp <= 0) return;

          const row = Math.floor(index / 3);
          const col = index % 3;
          inputZones.push({
            id: `monster-${index}`,
            bounds: {
              x: 10 + col * 20,
              y: 5 + row * 4,
              width: 15,
              height: 4,
            },
            type: 'custom',
            enabled: true,
            onActivate: () => {
              this.selectedTarget = index;
              this.executeAttack();
            },
          });
        });
      }
    }

    return {
      id: 'combat',
      name: 'Combat',
      layers: [
        {
          id: 'main',
          grid: this.asciiState.getGrid(),
          zIndex: 0,
          visible: true,
        },
      ],
      uiElements: [],
      inputZones,
    };
  }

  // Public methods for parent scene integration
  public setActionState(
    state: 'select_action' | 'select_target' | 'select_spell' | 'waiting'
  ): void {
    this.actionState = state;
    this.initializeCombatLayout();
  }

  public getSelectedAction(): number {
    return this.selectedAction;
  }

  public getSelectedTarget(): number {
    return this.selectedTarget;
  }

  public getActionState(): string {
    return this.actionState;
  }

  public setSelectedAction(action: number): void {
    this.selectedAction = action;
  }

  public setSelectedTarget(target: number): void {
    this.selectedTarget = target;
  }

  public getPendingAction(): { action: string; target?: number } | null {
    return this.pendingAction;
  }

  public clearPendingAction(): void {
    this.pendingAction = null;
  }
}
