import { GameState } from '../../types/GameTypes';
import { SceneManager } from '../../core/Scene';
import { TrainingGroundsStateManager } from './TrainingGroundsStateManager';
import { TrainingGroundsServiceHandler } from './TrainingGroundsServiceHandler';
import { MenuInputHandler } from '../../ui/components/MenuInputHandler';

export class TrainingGroundsInputHandler {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private stateManager: TrainingGroundsStateManager;
  private serviceHandler: TrainingGroundsServiceHandler;
  private messageLog: any;

  constructor(
    gameState: GameState,
    sceneManager: SceneManager,
    stateManager: TrainingGroundsStateManager,
    serviceHandler: TrainingGroundsServiceHandler,
    messageLog: any
  ) {
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.stateManager = stateManager;
    this.serviceHandler = serviceHandler;
    this.messageLog = messageLog;
  }

  public handleInput(key: string): boolean {
    const state = this.stateManager.currentState;

    switch (state) {
      case 'main':
        return this.handleMainMenuInput(key);
      case 'createName':
        return this.handleNameInput(key);
      case 'createRace':
        return this.handleRaceSelection(key);
      case 'createGender':
        return this.handleGenderSelection(key);
      case 'createBonusPoints':
        return this.handleBonusPointAllocation(key);
      case 'createClass':
        return this.handleClassSelection(key);
      case 'createAlignment':
        return this.handleAlignmentSelection(key);
      case 'createConfirm':
        return this.handleCreateConfirmation(key);
      case 'inspectSelectCharacter':
        return this.handleInspectCharacterSelection(key);
      case 'inspectMenu':
        return this.handleInspectMenu(key);
      case 'inspectView':
        return this.handleInspectView(key);
      case 'inspectDeleteConfirm':
        return this.handleDeleteConfirmation(key);
      case 'inspectClassChange':
        return this.handleClassChangeInfo(key);
      case 'inspectClassChangeSelect':
        return this.handleClassChangeSelection(key);
      case 'inspectClassChangeConfirm':
        return this.handleClassChangeConfirmation(key);
      case 'inspectRename':
        return this.handleRenameInput(key);
      case 'roster':
        return this.handleRosterView(key);
      default:
        return false;
    }
  }

  private handleMainMenuInput(key: string): boolean {
    const options = this.stateManager.getMainMenuOptions();
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: options.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.selectMainMenuOption();
        },
        onCancel: () => {
          this.sceneManager.switchTo('town');
        },
      }
    );

    return action.type !== 'none';
  }

  private selectMainMenuOption(): void {
    switch (this.stateManager.selectedOption) {
      case 0:
        this.stateManager.resetCreationData();
        this.stateManager.setState('createName');
        this.stateManager.textInput = '';
        break;
      case 1:
        if (this.gameState.characterRoster.length === 0) {
          if (this.messageLog?.add) {
            this.messageLog.add('No characters in roster to inspect.');
          }
        } else {
          this.stateManager.setState('inspectSelectCharacter');
          this.stateManager.selectedOption = 0;
        }
        break;
      case 2:
        if (this.gameState.characterRoster.length === 0) {
          if (this.messageLog?.add) {
            this.messageLog.add('No characters in roster.');
          }
        } else {
          this.stateManager.setState('roster');
        }
        break;
      case 3:
        this.sceneManager.switchTo('town');
        break;
    }
  }

  private handleNameInput(key: string): boolean {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey === 'enter' || normalizedKey === 'return') {
      if (this.stateManager.textInput.length > 0) {
        this.stateManager.creationData.name = this.stateManager.textInput;
        this.stateManager.setState('createRace');
        this.stateManager.selectedOption = 0;
      }
      return true;
    }

    if (normalizedKey === 'escape' || normalizedKey === 'esc') {
      this.stateManager.setState('main');
      this.stateManager.selectedOption = 0;
      return true;
    }

    if (normalizedKey === 'backspace') {
      this.stateManager.textInput = this.stateManager.textInput.slice(0, -1);
      return true;
    }

    if (key.length === 1 && this.stateManager.textInput.length < 16) {
      const isAlphanumeric = /^[a-zA-Z0-9 ]$/.test(key);
      if (isAlphanumeric) {
        this.stateManager.textInput += key;
        return true;
      }
    }

    return false;
  }

  private handleRaceSelection(key: string): boolean {
    const races = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Hobbit', 'Faerie', 'Lizman', 'Dracon', 'Rawulf', 'Mook', 'Felpurr'];
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: races.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.stateManager.creationData.race = races[this.stateManager.selectedOption] as any;
          this.stateManager.generateBaseStats();
          this.stateManager.setState('createGender');
          this.stateManager.selectedOption = 0;
        },
        onCancel: () => {
          this.stateManager.setState('createName');
          this.stateManager.textInput = this.stateManager.creationData.name;
        },
      }
    );

    return action.type !== 'none';
  }

  private handleGenderSelection(key: string): boolean {
    const genders = ['male', 'female'];
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: genders.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.stateManager.creationData.gender = genders[this.stateManager.selectedOption] as 'male' | 'female';
          this.stateManager.rollBonusPoints();
          this.stateManager.setState('createBonusPoints');
          this.stateManager.selectedOption = 0;
        },
        onCancel: () => {
          this.stateManager.setState('createRace');
          const races = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Hobbit', 'Faerie', 'Lizman', 'Dracon', 'Rawulf', 'Mook', 'Felpurr'];
          this.stateManager.selectedOption = races.indexOf(this.stateManager.creationData.race || 'Human');
        },
      }
    );

    return action.type !== 'none';
  }

  private handleBonusPointAllocation(key: string): boolean {
    const stats = ['strength', 'intelligence', 'piety', 'vitality', 'agility', 'luck'];

    if (key === 'arrowup' || key === 'w') {
      this.stateManager.selectedOption = Math.max(0, this.stateManager.selectedOption - 1);
      return true;
    }

    if (key === 'arrowdown' || key === 's') {
      this.stateManager.selectedOption = Math.min(stats.length - 1, this.stateManager.selectedOption + 1);
      return true;
    }

    if (key === 'arrowright' || key === 'd' || key === '+' || key === '=') {
      const stat = stats[this.stateManager.selectedOption] as keyof typeof this.stateManager.creationData.allocatedBonusPoints;
      this.stateManager.allocateBonusPoint(stat);
      return true;
    }

    if (key === 'arrowleft' || key === 'a' || key === '-') {
      const stat = stats[this.stateManager.selectedOption] as keyof typeof this.stateManager.creationData.allocatedBonusPoints;
      this.stateManager.deallocateBonusPoint(stat);
      return true;
    }

    if (key === 'enter' || key === 'return') {
      const remaining = this.stateManager.getRemainingBonusPoints();
      if (remaining > 0) {
        if (this.messageLog?.add) {
          this.messageLog.add('You must allocate all bonus points before continuing.');
        }
        return true;
      }

      const eligibleClasses = this.stateManager.getEligibleClasses();
      if (eligibleClasses.length === 0) {
        if (this.messageLog?.add) {
          this.messageLog.add('Your stats do not qualify for any class. Reallocate points.');
        }
        return true;
      }

      this.stateManager.setState('createClass');
      this.stateManager.selectedOption = 0;
      return true;
    }

    if (key === 'escape' || key === 'esc') {
      this.stateManager.setState('createGender');
      this.stateManager.selectedOption = this.stateManager.creationData.gender === 'male' ? 0 : 1;
      return true;
    }

    return false;
  }

  private handleClassSelection(key: string): boolean {
    const eligibleClasses = this.stateManager.getEligibleClasses();
    if (eligibleClasses.length === 0) return false;

    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: eligibleClasses.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.stateManager.creationData.class = eligibleClasses[this.stateManager.selectedOption];
          this.stateManager.setState('createAlignment');
          this.stateManager.selectedOption = 0;
        },
        onCancel: () => {
          this.stateManager.setState('createBonusPoints');
          this.stateManager.selectedOption = 0;
        },
      }
    );

    return action.type !== 'none';
  }

  private handleAlignmentSelection(key: string): boolean {
    const alignments = ['Good', 'Neutral', 'Evil'];
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: alignments.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.stateManager.creationData.alignment = alignments[this.stateManager.selectedOption] as any;
          this.stateManager.setState('createConfirm');
        },
        onCancel: () => {
          this.stateManager.setState('createClass');
          this.stateManager.selectedOption = 0;
        },
      }
    );

    return action.type !== 'none';
  }

  private handleCreateConfirmation(key: string): boolean {
    if (key === 'y') {
      const character = this.stateManager.createCharacter();
      if (character) {
        this.serviceHandler.addCharacterToRoster(character);
        if (this.messageLog?.add) {
          this.messageLog.add(`${character.name} has been created!`);
        }
      }
      this.stateManager.setState('main');
      this.stateManager.selectedOption = 0;
      return true;
    } else if (key === 'n' || key === 'escape' || key === 'esc') {
      this.stateManager.setState('createAlignment');
      this.stateManager.selectedOption = ['Good', 'Neutral', 'Evil'].indexOf(this.stateManager.creationData.alignment || 'Neutral');
      return true;
    }

    return false;
  }

  private handleInspectCharacterSelection(key: string): boolean {
    const characters = this.stateManager.getRosterCharacters();
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: characters.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.stateManager.selectedCharacterIndex = this.stateManager.selectedOption;
          this.stateManager.setState('inspectMenu');
          this.stateManager.selectedOption = 0;
        },
        onCancel: () => {
          this.stateManager.setState('main');
          this.stateManager.selectedOption = 1;
        },
      }
    );

    return action.type !== 'none';
  }

  private handleInspectMenu(key: string): boolean {
    const options = this.stateManager.getInspectMenuOptions();
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: options.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.selectInspectOption();
        },
        onCancel: () => {
          this.stateManager.setState('inspectSelectCharacter');
          this.stateManager.selectedOption = this.stateManager.selectedCharacterIndex;
        },
      }
    );

    return action.type !== 'none';
  }

  private selectInspectOption(): void {
    switch (this.stateManager.selectedOption) {
      case 0:
        this.stateManager.setState('inspectView');
        break;
      case 1:
        this.stateManager.setState('inspectClassChange');
        break;
      case 2:
        this.stateManager.setState('inspectRename');
        this.stateManager.textInput = this.stateManager.getRosterCharacters()[this.stateManager.selectedCharacterIndex].name;
        break;
      case 3:
        this.stateManager.setState('inspectDeleteConfirm');
        break;
      case 4:
        this.stateManager.setState('inspectSelectCharacter');
        this.stateManager.selectedOption = this.stateManager.selectedCharacterIndex;
        break;
    }
  }

  private handleInspectView(key: string): boolean {
    if (key === 'arrowup' || key === 'w') {
      this.stateManager.scrollUp();
      return true;
    }

    if (key === 'arrowdown' || key === 's') {
      this.stateManager.scrollDown();
      return true;
    }

    if (key === 'enter' || key === 'return' || key === 'escape' || key === 'esc' || key === ' ') {
      this.stateManager.resetScroll();
      this.stateManager.setState('inspectMenu');
      this.stateManager.selectedOption = 0;
      return true;
    }
    return false;
  }

  private handleDeleteConfirmation(key: string): boolean {
    if (key === 'y') {
      const character = this.stateManager.getRosterCharacters()[this.stateManager.selectedCharacterIndex];
      const deleted = this.serviceHandler.deleteCharacter(this.stateManager.selectedCharacterIndex);

      if (deleted) {
        if (this.messageLog?.add) {
          this.messageLog.add(`${character.name} has been deleted from the roster.`);
        }
        this.stateManager.setState('main');
        this.stateManager.selectedOption = 1;
      } else {
        if (this.messageLog?.add) {
          this.messageLog.add(`Cannot delete ${character.name} - remove from party first.`);
        }
        this.stateManager.setState('inspectMenu');
        this.stateManager.selectedOption = 0;
      }
      return true;
    } else if (key === 'n' || key === 'escape' || key === 'esc') {
      this.stateManager.setState('inspectMenu');
      this.stateManager.selectedOption = 0;
      return true;
    }

    return false;
  }

  private handleClassChangeInfo(key: string): boolean {
    if (key === 'enter' || key === 'return') {
      const character = this.stateManager.getRosterCharacters()[this.stateManager.selectedCharacterIndex];
      const currentStats = {
        strength: character.stats.strength,
        intelligence: character.stats.intelligence,
        piety: character.stats.piety,
        vitality: character.stats.vitality,
        agility: character.stats.agility,
        luck: character.stats.luck
      };

      this.stateManager.creationData.baseStats = currentStats;
      this.stateManager.creationData.allocatedBonusPoints = {};
      this.stateManager.creationData.bonusPoints = 0;
      this.stateManager.creationData.gender = character.gender;

      const eligibleClasses = this.stateManager.getEligibleClasses();

      if (eligibleClasses.length === 0) {
        if (this.messageLog?.add) {
          this.messageLog.add(`${character.name}'s stats do not qualify for any other class.`);
        }
        this.stateManager.setState('inspectMenu');
        return true;
      }

      this.stateManager.setState('inspectClassChangeSelect');
      this.stateManager.selectedOption = 0;
      return true;
    }

    if (key === 'escape' || key === 'esc') {
      this.stateManager.setState('inspectMenu');
      this.stateManager.selectedOption = 1;
      return true;
    }

    return false;
  }

  private handleClassChangeSelection(key: string): boolean {
    const character = this.stateManager.getRosterCharacters()[this.stateManager.selectedCharacterIndex];
    const currentStats = {
      strength: character.stats.strength,
      intelligence: character.stats.intelligence,
      piety: character.stats.piety,
      vitality: character.stats.vitality,
      agility: character.stats.agility,
      luck: character.stats.luck
    };

    const eligibleClasses = ['Fighter', 'Mage', 'Priest', 'Thief', 'Alchemist', 'Bishop', 'Bard', 'Ranger', 'Psionic', 'Valkyrie', 'Samurai', 'Lord', 'Monk', 'Ninja'].filter(c => {
      if (c === 'Valkyrie' && character.gender !== 'female') return false;
      return this.stateManager['meetsClassRequirements'](c as any, currentStats);
    });

    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.stateManager.selectedOption,
        maxIndex: eligibleClasses.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.stateManager.selectedOption = newIndex;
        },
        onConfirm: () => {
          this.stateManager.creationData.class = eligibleClasses[this.stateManager.selectedOption] as any;
          this.stateManager.setState('inspectClassChangeConfirm');
        },
        onCancel: () => {
          this.stateManager.setState('inspectClassChange');
        },
      }
    );

    return action.type !== 'none';
  }

  private handleClassChangeConfirmation(key: string): boolean {
    if (key === 'y') {
      const character = this.stateManager.getRosterCharacters()[this.stateManager.selectedCharacterIndex];
      const newClass = this.stateManager.creationData.class;
      if (newClass) {
        this.serviceHandler.changeCharacterClass(this.stateManager.selectedCharacterIndex, newClass);
        if (this.messageLog?.add) {
          this.messageLog.add(`${character.name} is now a ${newClass}!`);
        }
      }
      this.stateManager.setState('main');
      this.stateManager.selectedOption = 1;
      return true;
    } else if (key === 'n' || key === 'escape' || key === 'esc') {
      this.stateManager.setState('inspectClassChangeSelect');
      return true;
    }

    return false;
  }

  private handleRenameInput(key: string): boolean {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey === 'enter' || normalizedKey === 'return') {
      if (this.stateManager.textInput.length > 0) {
        this.serviceHandler.renameCharacter(this.stateManager.selectedCharacterIndex, this.stateManager.textInput);
        if (this.messageLog?.add) {
          this.messageLog.add(`Character renamed to ${this.stateManager.textInput}.`);
        }
        this.stateManager.setState('inspectMenu');
        this.stateManager.selectedOption = 0;
      }
      return true;
    }

    if (normalizedKey === 'escape' || normalizedKey === 'esc') {
      this.stateManager.setState('inspectMenu');
      this.stateManager.selectedOption = 2;
      return true;
    }

    if (normalizedKey === 'backspace') {
      this.stateManager.textInput = this.stateManager.textInput.slice(0, -1);
      return true;
    }

    if (key.length === 1 && this.stateManager.textInput.length < 16) {
      const isAlphanumeric = /^[a-zA-Z0-9 ]$/.test(key);
      if (isAlphanumeric) {
        this.stateManager.textInput += key;
        return true;
      }
    }

    return false;
  }

  private handleRosterView(key: string): boolean {
    if (key === 'enter' || key === 'return' || key === 'escape' || key === 'esc' || key === ' ') {
      this.stateManager.setState('main');
      this.stateManager.selectedOption = 2;
      return true;
    }
    return false;
  }
}
