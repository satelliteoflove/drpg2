import { BaseASCIIScene } from '../BaseASCIIScene';
import { ASCIIState, ASCII_GRID_HEIGHT, ASCII_GRID_WIDTH } from '../ASCIIState';
import { ASCII_SYMBOLS } from '../ASCIISymbols';
import { InputZone, SceneDeclaration } from '../SceneDeclaration';
import { GameState } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { DebugLogger } from '../../utils/DebugLogger';

export class TownASCIIState extends BaseASCIIScene {
  private sceneManager: SceneManager;
  private selectedOption: number = 0;
  private menuOptions: Array<{
    name: string;
    description: string;
    available: boolean;
    sceneId?: string;
  }> = [
    {
      name: "Boltac's Trading Post",
      description: 'Buy, sell, and identify items. Pool your gold for better purchases.',
      available: true,
      sceneId: 'shop',
    },
    {
      name: 'Temple',
      description: 'Heal your party and remove curses (not yet available)',
      available: false,
    },
    {
      name: 'Inn',
      description: 'Rest and recover your party (not yet available)',
      available: false,
    },
    {
      name: 'Return to Dungeon',
      description: 'Return to the dungeon depths',
      available: true,
      sceneId: 'dungeon',
    },
  ];

  constructor(_gameState: GameState, sceneManager: SceneManager) {
    super('Town', 'ascii_town_scene');
    this.sceneManager = sceneManager;
    this.initializeTownLayout();
  }

  public updateSelectedIndex(index: number): void {
    this.selectedOption = index;
    this.initializeTownLayout();
  }

  public getGrid(): ASCIIState {
    return this.asciiState;
  }

  public getSelectedOption(): number {
    return this.selectedOption;
  }

  public render(): void {
    this.initializeTownLayout();
  }

  private initializeTownLayout(): void {
    const grid = this.asciiState;
    console.log('[TownASCIIState.initializeTownLayout] Called, grid:', grid);

    // Draw town border (leave room at bottom for help text)
    grid.drawBox(0, 0, ASCII_GRID_WIDTH, ASCII_GRID_HEIGHT - 3);
    console.log('[TownASCIIState.initializeTownLayout] After drawBox');

    // Title - Add [ASCII MODE] indicator
    const title = 'TOWN OF LLYLGAMYN [ASCII MODE]';
    const titleX = Math.floor((ASCII_GRID_WIDTH - title.length) / 2);
    grid.writeText(titleX, 2, title, { foreground: '#FFFF00', bold: true });

    // Subtitle
    const subtitle = 'Welcome to the castle town!';
    const subtitleX = Math.floor((ASCII_GRID_WIDTH - subtitle.length) / 2);
    grid.writeText(subtitleX, 4, subtitle, { foreground: '#AAAAAA' });

    // Draw ASCII art representation of town
    this.drawTownArt(grid);

    // Draw menu
    this.drawMenu(grid);

    // Draw help text
    const helpText = 'UP/DOWN: Select   ENTER: Choose   ESC: Leave Town';
    const helpX = Math.floor((ASCII_GRID_WIDTH - helpText.length) / 2);
    grid.writeText(helpX, ASCII_GRID_HEIGHT - 2, helpText, { foreground: '#666666' });
  }

  private drawTownArt(grid: ASCIIState): void {
    // Simple ASCII art representation of town buildings
    const artLines = [
      '     /\\           [][]    ___                 ___     ',
      '    /  \\   SHOP  [][][]  |INN|               | T |    ',
      '   /    \\  ===   [][][]  |___|              |TEMPLE|  ',
      '  |CASTLE| |$|   [][][]                     |_____|   ',
      '  |______|_|_|___[][][]________________________________',
      '                                                       ',
      '         === Welcome to Llylgamyn ===                 ',
      '                                                       ',
    ];

    const artStartY = 6;
    const artStartX = Math.floor((ASCII_GRID_WIDTH - artLines[0].length) / 2);

    artLines.forEach((line, index) => {
      grid.writeText(artStartX, artStartY + index, line, { foreground: '#888888' });
    });
  }

  private drawMenu(grid: ASCIIState): void {
    const menuStartY = 12; // Moved up to make room for description
    const menuStartX = 20;

    // Draw menu box
    grid.drawBox(menuStartX - 2, menuStartY - 1, 42, this.menuOptions.length + 2);

    // Draw menu options
    this.menuOptions.forEach((option, index) => {
      const y = menuStartY + index;
      const isSelected = index === this.selectedOption;

      // Draw cursor
      if (isSelected) {
        grid.writeText(menuStartX, y, ASCII_SYMBOLS.MENU_CURSOR, { foreground: '#FFAA00' });
      }

      // Draw option text
      const textColor = option.available ? (isSelected ? '#FFAA00' : '#FFFFFF') : '#666666';
      const optionText = option.name + (option.available ? '' : ' (Unavailable)');
      grid.writeText(menuStartX + 2, y, optionText, { foreground: textColor });
    });

    // Draw description for selected option
    const descStartY = menuStartY + this.menuOptions.length + 2;
    grid.drawBox(10, descStartY, 60, 3);
    const selectedDesc = this.menuOptions[this.selectedOption].description;
    const descX = Math.floor((ASCII_GRID_WIDTH - selectedDesc.length) / 2);
    grid.writeText(descX, descStartY + 1, selectedDesc, { foreground: '#AAAAAA' });
  }

  public override enter(): void {
    console.log('[TownASCIIState.enter] Called');
    super.enter();
    // Don't reset selectedOption if it's already set
    if (this.selectedOption === undefined || this.selectedOption === null) {
      this.selectedOption = 0;
    }
    console.log('[TownASCIIState.enter] About to call initializeTownLayout');
    this.initializeTownLayout();
    console.log('[TownASCIIState.enter] After initializeTownLayout');
    DebugLogger.info('TownASCIIState', `Entered Town scene with selection: ${this.selectedOption}`);
  }

  public override update(deltaTime: number): void {
    super.update(deltaTime);

    // Refresh menu display if selection changed
    if (this.shouldRefreshMenu()) {
      const grid = this.asciiState;
      this.drawMenu(grid);
    }
  }

  private shouldRefreshMenu(): boolean {
    // This would check if selection has changed
    return false;
  }

  public override handleInput(key: string): boolean {
    console.log('[TownASCIIState.handleInput] Key:', key);
    const lowerKey = key.toLowerCase();
    switch (lowerKey) {
      case 'arrowup':
      case 'w':
        this.selectPreviousOption();
        return true;
      case 'arrowdown':
      case 's':
        this.selectNextOption();
        return true;
      case 'enter':
      case ' ':
        console.log('[TownASCIIState.handleInput] Enter pressed, activating option');
        this.activateSelectedOption();
        return true;
      case 'escape':
        this.returnToDungeon();
        return true;
    }
    return false;
  }

  private selectPreviousOption(): void {
    this.selectedOption =
      (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
    const grid = this.asciiState;
    this.drawMenu(grid);
    DebugLogger.info(
      'TownASCIIState',
      `Selected option: ${this.menuOptions[this.selectedOption].name}`
    );
  }

  private selectNextOption(): void {
    this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
    const grid = this.asciiState;
    this.drawMenu(grid);
    DebugLogger.info(
      'TownASCIIState',
      `Selected option: ${this.menuOptions[this.selectedOption].name}`
    );
  }

  private activateSelectedOption(): void {
    const option = this.menuOptions[this.selectedOption];
    console.log(
      '[TownASCIIState] Activating option:',
      this.selectedOption,
      option.name,
      option.sceneId
    );

    if (!option.available) {
      DebugLogger.warn('TownASCIIState', `Option ${option.name} is not available`);
      return;
    }

    if (option.sceneId) {
      DebugLogger.info('TownASCIIState', `Transitioning to scene: ${option.sceneId}`);
      console.log('[TownASCIIState] Calling sceneManager.switchTo:', option.sceneId);
      this.sceneManager.switchTo(option.sceneId);
    }
  }

  private returnToDungeon(): void {
    DebugLogger.info('TownASCIIState', 'Returning to dungeon');
    this.sceneManager.switchTo('dungeon');
  }

  protected setupInputHandlers(): void {
    // Input handlers are managed through handleInput method
  }

  protected updateASCIIState(_deltaTime: number): void {
    // Update animation or dynamic elements if needed
  }

  protected setupScene(): void {
    this.initializeTownLayout();
  }

  public getSceneDeclaration(): SceneDeclaration {
    return this.generateSceneDeclaration();
  }

  protected generateSceneDeclaration(): SceneDeclaration {
    const inputZones: InputZone[] = this.menuOptions.map((option, index) => ({
      id: `menu-option-${index}`,
      bounds: {
        x: 18,
        y: 15 + index,
        width: 40,
        height: 1,
      },
      type: 'menu-item',
      enabled: option.available,
      onActivate: option.available
        ? () => {
            this.selectedOption = index;
            this.activateSelectedOption();
          }
        : undefined,
    }));

    return {
      id: 'town',
      name: 'Town',
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
}
