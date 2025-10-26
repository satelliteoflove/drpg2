import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { CharacterAlignment, CharacterClass, CharacterRace, GameState } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { MenuInputHandler } from '../ui/components/MenuInputHandler';

export class CharacterCreationScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private currentStep: 'name' | 'race' | 'gender' | 'class' | 'alignment' | 'confirm' | 'party';
  private currentCharacter: Partial<Character> = {};
  private selectedIndex: number = 0;
  private nameInput: string = '';

  private races: CharacterRace[] = [
    'Human', 'Elf', 'Dwarf', 'Gnome', 'Hobbit',
    'Faerie', 'Lizman', 'Dracon', 'Rawulf', 'Mook', 'Felpurr'
  ];
  private classes: CharacterClass[] = [
    'Fighter', 'Mage', 'Priest', 'Thief', 'Alchemist',
    'Bishop', 'Bard', 'Ranger', 'Psionic',
    'Valkyrie', 'Samurai', 'Lord', 'Monk', 'Ninja'
  ];
  private alignments: CharacterAlignment[] = ['Good', 'Neutral', 'Evil'];
  private genders: Array<'male' | 'female'> = ['male', 'female'];

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('Character Creation');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.currentStep = 'name';
  }

  public enter(): void {
    this.currentStep = 'name';
    this.currentCharacter = {};
    this.selectedIndex = 0;
    this.nameInput = '';
  }

  public exit(): void {}

  public update(_deltaTime: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHARACTER CREATION', ctx.canvas.width / 2, 50);

    ctx.font = '16px monospace';
    ctx.textAlign = 'left';

    switch (this.currentStep) {
      case 'name':
        this.renderNameStep(ctx);
        break;
      case 'race':
        this.renderRaceStep(ctx);
        break;
      case 'gender':
        this.renderGenderStep(ctx);
        break;
      case 'class':
        this.renderClassStep(ctx);
        break;
      case 'alignment':
        this.renderAlignmentStep(ctx);
        break;
      case 'confirm':
        this.renderConfirmStep(ctx);
        break;
      case 'party':
        this.renderPartyStep(ctx);
        break;
    }

    this.renderInstructions(ctx);
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      ctx.fillStyle = '#fff';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CHARACTER CREATION', ctx.canvas.width / 2, 50);

      ctx.font = '16px monospace';
      ctx.textAlign = 'left';

      switch (this.currentStep) {
        case 'name':
          this.renderNameStep(ctx);
          break;
        case 'race':
          this.renderRaceStep(ctx);
          break;
        case 'gender':
          this.renderGenderStep(ctx);
          break;
        case 'class':
          this.renderClassStep(ctx);
          break;
        case 'alignment':
          this.renderAlignmentStep(ctx);
          break;
        case 'confirm':
          this.renderConfirmStep(ctx);
          break;
        case 'party':
          this.renderPartyStep(ctx);
          break;
      }

      this.renderInstructions(ctx);
    });
  }

  private renderNameStep(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.fillText('Enter character name:', 100, 150);

    ctx.strokeStyle = '#666';
    ctx.strokeRect(100, 170, 300, 30);

    ctx.fillStyle = '#fff';
    ctx.fillText(this.nameInput + '_', 110, 190);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('Press ENTER when done, BACKSPACE to delete', 100, 220);
  }

  private renderRaceStep(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.fillText('Select race:', 100, 150);

    this.races.forEach((race, index) => {
      const y = 180 + index * 30;

      if (index === this.selectedIndex) {
        ctx.fillStyle = '#333';
        ctx.fillRect(90, y - 20, 400, 25);
      }

      ctx.fillStyle = index === this.selectedIndex ? '#ffff00' : '#fff';
      ctx.fillText(`${index + 1}. ${race}`, 100, y);

      ctx.fillStyle = '#aaa';
      ctx.font = '12px monospace';
      ctx.fillText(this.getRaceDescription(race), 200, y);
      ctx.font = '16px monospace';
    });
  }

  private renderGenderStep(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.fillText('Select gender:', 100, 150);

    this.genders.forEach((gender, index) => {
      const y = 180 + index * 40;

      if (index === this.selectedIndex) {
        ctx.fillStyle = '#333';
        ctx.fillRect(90, y - 20, 400, 30);
      }

      ctx.fillStyle = index === this.selectedIndex ? '#ffff00' : '#fff';
      const displayText = gender.charAt(0).toUpperCase() + gender.slice(1);
      ctx.fillText(`${index + 1}. ${displayText}`, 100, y);
    });
  }

  private renderClassStep(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.fillText('Select class:', 100, 150);

    this.classes.forEach((charClass, index) => {
      const y = 180 + index * 30;

      if (index === this.selectedIndex) {
        ctx.fillStyle = '#333';
        ctx.fillRect(90, y - 20, 500, 25);
      }

      const canSelect = this.canSelectClass(charClass);
      ctx.fillStyle = index === this.selectedIndex ? '#ffff00' : canSelect ? '#fff' : '#666';

      ctx.fillText(`${index + 1}. ${charClass}`, 100, y);

      if (!canSelect) {
        ctx.fillText('(Requirements not met)', 250, y);
      }
    });
  }

  private renderAlignmentStep(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.fillText('Select alignment:', 100, 150);

    this.alignments.forEach((alignment, index) => {
      const y = 180 + index * 40;

      if (index === this.selectedIndex) {
        ctx.fillStyle = '#333';
        ctx.fillRect(90, y - 20, 400, 30);
      }

      ctx.fillStyle = index === this.selectedIndex ? '#ffff00' : '#fff';
      ctx.fillText(`${index + 1}. ${alignment}`, 100, y);
    });
  }

  private renderConfirmStep(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.fillText('Confirm character:', 100, 150);

    ctx.fillText(`Name: ${this.nameInput}`, 100, 180);
    ctx.fillText(`Race: ${this.currentCharacter.race}`, 100, 200);
    ctx.fillText(`Class: ${this.currentCharacter.class}`, 100, 220);
    ctx.fillText(`Alignment: ${this.currentCharacter.alignment}`, 100, 240);

    if (this.currentCharacter.stats) {
      ctx.fillText('Base Stats:', 100, 280);
      ctx.fillText(
        `STR: ${this.currentCharacter.stats.strength}  INT: ${this.currentCharacter.stats.intelligence}  PIE: ${this.currentCharacter.stats.piety}`,
        100,
        300
      );
      ctx.fillText(
        `VIT: ${this.currentCharacter.stats.vitality}  AGI: ${this.currentCharacter.stats.agility}  LUK: ${this.currentCharacter.stats.luck}`,
        100,
        320
      );
    }

    ctx.fillStyle = this.selectedIndex === 0 ? '#ffff00' : '#fff';
    ctx.fillText('1. Create Character', 100, 360);

    ctx.fillStyle = this.selectedIndex === 1 ? '#ffff00' : '#fff';
    ctx.fillText('2. Start Over', 100, 380);
  }

  private renderPartyStep(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.fillText('Party Management:', 100, 150);

    ctx.fillText(`Characters created: ${this.gameState.party.characters.length}/6`, 100, 180);

    this.gameState.party.characters.forEach((char: any, index: number) => {
      const y = 210 + index * 20;
      ctx.fillText(`${index + 1}. ${char.name} (${char.race} ${char.class})`, 120, y);
    });

    const options = ['1. Create Another Character', '2. Enter Dungeon', '3. Remove Character'];

    options.forEach((option, index) => {
      const y = 350 + index * 30;
      ctx.fillStyle = index === this.selectedIndex ? '#ffff00' : '#fff';
      ctx.fillText(option, 100, y);
    });
  }

  private renderInstructions(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    let instructions = '';
    switch (this.currentStep) {
      case 'name':
        instructions = 'Type name, ENTER to continue, ESC to go back';
        break;
      case 'race':
      case 'gender':
      case 'class':
      case 'alignment':
        instructions = 'UP/DOWN to select, ENTER to continue, ESC to go back';
        break;
      case 'confirm':
      case 'party':
        instructions = 'UP/DOWN to select, ENTER to choose, ESC to go back';
        break;
    }

    ctx.fillText(instructions, ctx.canvas.width / 2, ctx.canvas.height - 20);
    ctx.textAlign = 'left';
  }

  private getRaceDescription(race: CharacterRace): string {
    switch (race) {
      case 'Human':
        return 'Balanced stats, no bonuses or penalties';
      case 'Elf':
        return '+2 INT, +1 AGI, -2 VIT';
      case 'Dwarf':
        return '+2 STR, +3 VIT, -2 AGI';
      case 'Gnome':
        return '+1 INT, +2 PIE, -2 STR';
      case 'Hobbit':
        return '+3 AGI, +2 LUK, -3 STR';
      case 'Faerie':
        return 'Very low STR/VIT, very high AGI/INT';
      case 'Lizman':
        return 'Very high STR/VIT, very low INT/PIE';
      case 'Dracon':
        return 'High STR/VIT, dragon heritage';
      case 'Rawulf':
        return 'High PIE, wolf-like race';
      case 'Mook':
        return 'Balanced warrior race';
      case 'Felpurr':
        return 'High AGI/LUK, feline race';
      default:
        return '';
    }
  }

  private canSelectClass(charClass: CharacterClass): boolean {
    if (!this.currentCharacter.stats) return true;

    const stats = this.currentCharacter.stats;

    // Check gender restriction for Valkyrie
    if (charClass === 'Valkyrie' && this.currentCharacter.gender !== 'female') {
      return false;
    }

    // Use class configs for requirements
    switch (charClass) {
      case 'Fighter':
        return true; // No requirements
      case 'Mage':
        return stats.intelligence >= 11;
      case 'Priest':
        return stats.piety >= 11;
      case 'Thief':
        return stats.agility >= 11;
      case 'Alchemist':
        return stats.intelligence >= 10;
      case 'Bishop':
        return stats.intelligence >= 12 && stats.piety >= 12;
      case 'Bard':
        return stats.intelligence >= 11 && stats.luck >= 11;
      case 'Ranger':
        return stats.strength >= 11 && stats.agility >= 11;
      case 'Psionic':
        return stats.intelligence >= 11 && stats.piety >= 11;
      case 'Valkyrie':
        return stats.strength >= 12 && stats.vitality >= 10 && stats.piety >= 11;
      case 'Samurai':
        return (
          stats.strength >= 13 &&
          stats.intelligence >= 11 &&
          stats.piety >= 10 &&
          stats.vitality >= 14 &&
          stats.agility >= 10
        );
      case 'Lord':
        return (
          stats.strength >= 13 &&
          stats.intelligence >= 11 &&
          stats.piety >= 11 &&
          stats.vitality >= 13 &&
          stats.agility >= 9 &&
          stats.luck >= 9
        );
      case 'Monk':
        return (
          stats.strength >= 12 &&
          stats.piety >= 12 &&
          stats.vitality >= 13 &&
          stats.agility >= 11
        );
      case 'Ninja':
        return (
          stats.strength >= 14 &&
          stats.intelligence >= 14 &&
          stats.piety >= 14 &&
          stats.vitality >= 14 &&
          stats.agility >= 14 &&
          stats.luck >= 14
        );
      default:
        return true;
    }
  }

  public handleInput(key: string): boolean {
    // Normalize key to lowercase
    const normalizedKey = key.toLowerCase();

    // Escape returns to new game menu
    if (normalizedKey === 'escape') {
      this.sceneManager.switchTo('new-game-menu');
      return true;
    }

    switch (this.currentStep) {
      case 'name':
        return this.handleNameInput(normalizedKey);
      case 'race':
        return this.handleSelectionInput(normalizedKey, this.races.length);
      case 'gender':
        return this.handleSelectionInput(normalizedKey, this.genders.length);
      case 'class':
        return this.handleSelectionInput(normalizedKey, this.classes.length);
      case 'alignment':
        return this.handleSelectionInput(normalizedKey, this.alignments.length);
      case 'confirm':
        return this.handleConfirmInput(normalizedKey);
      case 'party':
        return this.handlePartyInput(normalizedKey);
    }
    return false;
  }

  private handleNameInput(key: string): boolean {
    if (key === 'enter') {
      if (this.nameInput.trim().length > 0) {
        this.currentStep = 'race';
        this.selectedIndex = 0;
      }
      return true;
    } else if (key === 'backspace') {
      this.nameInput = this.nameInput.slice(0, -1);
      return true;
    } else if (key === 'escape') {
      // Handled at the top level
      return true;
    } else if (key.length === 1 && key.match(/[a-zA-Z]/)) {
      if (this.nameInput.length < 12) {
        this.nameInput += key.toUpperCase();
      }
      return true;
    }
    return false;
  }

  private handleSelectionInput(key: string, maxOptions: number): boolean {
    // Use MenuInputHandler for navigation
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.selectedIndex,
        maxIndex: maxOptions - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.selectedIndex = newIndex;
        },
        onConfirm: () => {
          this.selectCurrentOption();
        },
        onCancel: () => {
          this.goBack();
        },
      }
    );

    return action.type !== 'none';
  }

  private selectCurrentOption(): void {
    switch (this.currentStep) {
      case 'race':
        this.currentCharacter.race = this.races[this.selectedIndex];
        this.currentStep = 'gender';
        this.selectedIndex = 0;
        this.generatePreviewStats();
        break;
      case 'gender':
        this.currentCharacter.gender = this.genders[this.selectedIndex];
        this.currentStep = 'class';
        this.selectedIndex = 0;
        break;
      case 'class':
        if (this.canSelectClass(this.classes[this.selectedIndex])) {
          this.currentCharacter.class = this.classes[this.selectedIndex];
          this.currentStep = 'alignment';
          this.selectedIndex = 0;
        }
        break;
      case 'alignment':
        this.currentCharacter.alignment = this.alignments[this.selectedIndex];
        this.currentStep = 'confirm';
        this.selectedIndex = 0;
        break;
    }
  }

  private generatePreviewStats(): void {
    if (this.currentCharacter.race) {
      const tempChar = new Character(this.nameInput, this.currentCharacter.race, 'Fighter', 'Good');
      this.currentCharacter.stats = tempChar.stats;
    }
  }

  private handleConfirmInput(key: string): boolean {
    // Use MenuInputHandler for navigation
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.selectedIndex,
        maxIndex: 1, // Accept and Start Over options (0 and 1)
      },
      {
        onNavigate: (newIndex: number) => {
          this.selectedIndex = newIndex;
        },
        onConfirm: () => {
          if (this.selectedIndex === 0) {
            this.createCharacter();
          } else {
            this.startOver();
          }
        },
        onCancel: () => {
          this.currentStep = 'alignment';
          this.selectedIndex = 0;
        },
      }
    );

    return action.type !== 'none';
  }

  private handlePartyInput(key: string): boolean {
    // Use MenuInputHandler for navigation
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.selectedIndex,
        maxIndex: 2, // Add another, Start adventure, Remove last (0, 1, 2)
      },
      {
        onNavigate: (newIndex: number) => {
          this.selectedIndex = newIndex;
        },
        onConfirm: () => {
          if (this.selectedIndex === 0) {
            if (this.gameState.party.characters.length < 6) {
              this.startOver();
            }
          } else if (this.selectedIndex === 1) {
            if (this.gameState.party.characters.length > 0) {
              this.generateNewDungeon();
              this.sceneManager.switchTo('dungeon');
            }
          } else if (this.selectedIndex === 2) {
            if (this.gameState.party.characters.length > 0) {
              this.gameState.party.characters.pop();
            }
          }
        },
        onCancel: () => {
          // No cancel action in party step
        },
      }
    );

    return action.type !== 'none';
  }

  private createCharacter(): void {
    if (
      this.currentCharacter.race &&
      this.currentCharacter.class &&
      this.currentCharacter.alignment
    ) {
      const character = new Character(
        this.nameInput,
        this.currentCharacter.race,
        this.currentCharacter.class,
        this.currentCharacter.alignment,
        this.currentCharacter.gender || 'male'
      );

      this.gameState.party.addCharacter(character);
      this.currentStep = 'party';
      this.selectedIndex = 0;
    }
  }

  private startOver(): void {
    this.currentStep = 'name';
    this.currentCharacter = {};
    this.selectedIndex = 0;
    this.nameInput = '';
  }

  private goBack(): void {
    switch (this.currentStep) {
      case 'race':
        this.currentStep = 'name';
        break;
      case 'gender':
        this.currentStep = 'race';
        break;
      case 'class':
        this.currentStep = 'gender';
        break;
      case 'alignment':
        this.currentStep = 'class';
        break;
    }
    this.selectedIndex = 0;
  }

  private generateNewDungeon(): void {
    const generator = new DungeonGenerator(20, 20, this.gameState.dungeonSeed);
    this.gameState.dungeon = [];
    this.gameState.dungeonSeed = generator.getSeed();

    for (let i = 1; i <= 10; i++) {
      this.gameState.dungeon.push(generator.generateLevel(i));
    }

    const firstLevel = this.gameState.dungeon[0];
    this.gameState.party.x = firstLevel.startX;
    this.gameState.party.y = firstLevel.startY;
    this.gameState.party.floor = 1;
    this.gameState.party.facing = 'north';
  }

  // Removed: createDefaultParty was only used for the Escape→Dungeon debug shortcut
  // which has been removed. Use auto-generate party option instead.
}
