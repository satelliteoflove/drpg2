import { Scene, SceneManager } from '../core/Scene';
import { CharacterAlignment, CharacterClass, CharacterRace, GameState } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { DungeonGenerator } from '../utils/DungeonGenerator';

export class NewGameScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private selectedOption: number = 0;
  private menuOptions: string[] = ['Manual Character Creation', 'Auto-Generate Party'];

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('New Game');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
  }

  public enter(): void {
    this.selectedOption = 0;
  }

  public exit(): void {}

  public update(_deltaTime: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEW GAME', ctx.canvas.width / 2, 100);

    ctx.font = '16px monospace';
    ctx.fillText('Choose how you want to create your party:', ctx.canvas.width / 2, 180);

    const startY = 250;
    const lineHeight = 50;

    this.menuOptions.forEach((option, index) => {
      const y = startY + index * lineHeight;

      if (index === this.selectedOption) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('> ' + option + ' <', ctx.canvas.width / 2, y);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillText(option, ctx.canvas.width / 2, y);
      }
    });

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    if (this.selectedOption === 0) {
      ctx.fillText('Create characters one by one with full customization', 50, 400);
    } else {
      ctx.fillText('Automatically generate a balanced party of 4 characters', 50, 400);
      ctx.fillText('Classes: Fighter, Mage, Priest, Thief', 50, 420);
    }

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'UP/DOWN to select, ENTER to choose, ESC to go back',
      ctx.canvas.width / 2,
      ctx.canvas.height - 20
    );
  }

  public handleInput(key: string): boolean {
    switch (key) {
      case 'arrowup':
      case 'w':
        this.selectedOption = Math.max(0, this.selectedOption - 1);
        return true;

      case 'arrowdown':
      case 's':
        this.selectedOption = Math.min(this.menuOptions.length - 1, this.selectedOption + 1);
        return true;

      case 'enter':
      case ' ':
        this.selectCurrentOption();
        return true;

      case 'escape':
        this.sceneManager.switchTo('main_menu');
        return true;
    }
    return false;
  }

  private selectCurrentOption(): void {
    if (this.selectedOption === 0) {
      this.clearGameStateForNewGame();
      this.sceneManager.switchTo('character_creation');
    } else {
      this.autoGenerateParty();
    }
  }

  private autoGenerateParty(): void {
    this.clearGameStateForNewGame();
    this.gameState.party.characters = [];

    const partyTemplates = [
      { race: 'Human', class: 'Fighter', alignment: 'Good' },
      { race: 'Elf', class: 'Mage', alignment: 'Neutral' },
      { race: 'Human', class: 'Priest', alignment: 'Good' },
      { race: 'Hobbit', class: 'Thief', alignment: 'Neutral' },
    ];

    const names = [
      'GALAHAD',
      'MERLIN',
      'BENEDICT',
      'ROBIN',
      'ARTHUR',
      'GANDALF',
      'FRIAR',
      'SHADOW',
      'ROLAND',
      'PROSPERO',
      'AUGUSTIN',
      'SWIFT',
    ];

    const usedNames = new Set<string>();

    partyTemplates.forEach(template => {
      let characterName: string;
      do {
        characterName = names[Math.floor(Math.random() * names.length)];
      } while (usedNames.has(characterName));
      usedNames.add(characterName);

      const character = new Character(
        characterName,
        template.race as CharacterRace,
        template.class as CharacterClass,
        template.alignment as CharacterAlignment
      );

      this.gameState.party.addCharacter(character);
    });

    this.generateNewDungeon();
    this.sceneManager.switchTo('dungeon');
  }

  private clearGameStateForNewGame(): void {
    this.gameState.currentFloor = 1;
    this.gameState.inCombat = false;
    this.gameState.gameTime = 0;
    this.gameState.turnCount = 0;
    this.gameState.combatEnabled = true;
    this.gameState.currentEncounter = undefined;

    this.gameState.party.x = 0;
    this.gameState.party.y = 0;
    this.gameState.party.floor = 1;
    this.gameState.party.facing = 'north';
  }

  private generateNewDungeon(): void {
    const generator = new DungeonGenerator(20, 20);
    this.gameState.dungeon = [];

    for (let i = 1; i <= 10; i++) {
      this.gameState.dungeon.push(generator.generateLevel(i));
    }

    const firstLevel = this.gameState.dungeon[0];
    this.gameState.party.x = firstLevel.startX;
    this.gameState.party.y = firstLevel.startY;
  }
}
