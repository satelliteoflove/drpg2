import { GameState, CharacterClass, CharacterStats } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { TrainingGroundsState, CharacterCreationData, TrainingGroundsStateContext } from '../../types/TrainingGroundsTypes';
import { RACES } from '../../config/races';
import { CLASSES_BY_ID } from '../../config/classes';
import { DiceRoller } from '../../utils/DiceRoller';

export class TrainingGroundsStateManager {
  public currentState: TrainingGroundsState = 'main';
  public selectedOption: number = 0;
  public selectedCharacterIndex: number = 0;
  public selectedStatIndex: number = 0;
  public textInput: string = '';
  public message: string | null = null;
  public confirmationPrompt: string | null = null;

  public creationData: CharacterCreationData = {
    name: '',
    race: null,
    gender: null,
    class: null,
    alignment: null,
    baseStats: null,
    bonusPoints: 0,
    allocatedBonusPoints: {},
    startAtLevel4: false
  };

  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public reset(): void {
    this.currentState = 'main';
    this.selectedOption = 0;
    this.selectedCharacterIndex = 0;
    this.selectedStatIndex = 0;
    this.textInput = '';
    this.message = null;
    this.confirmationPrompt = null;
    this.resetCreationData();
  }

  public resetCreationData(): void {
    this.creationData = {
      name: '',
      race: null,
      gender: null,
      class: null,
      alignment: null,
      baseStats: null,
      bonusPoints: 0,
      allocatedBonusPoints: {},
      startAtLevel4: false
    };
  }

  public setState(state: TrainingGroundsState): void {
    this.currentState = state;
    this.selectedOption = 0;

    if (state === 'main') {
      this.message = null;
      this.confirmationPrompt = null;
    }
  }

  public getStateContext(): TrainingGroundsStateContext {
    return {
      currentState: this.currentState,
      selectedOption: this.selectedOption,
      selectedCharacterIndex: this.selectedCharacterIndex,
      selectedStatIndex: this.selectedStatIndex,
      textInput: this.textInput,
      creationData: { ...this.creationData },
      eligibleClasses: this.getEligibleClasses(),
      message: this.message,
      confirmationPrompt: this.confirmationPrompt,
      rosterCount: this.gameState.characterRoster.length
    };
  }

  public getMainMenuOptions(): string[] {
    return [
      'Create Character',
      'Inspect Character',
      'View Roster',
      'Leave Training Grounds'
    ];
  }

  public rollBonusPoints(): void {
    const baseRoll = DiceRoller.roll('1d4+6');
    let total = baseRoll;

    if (Math.random() < 0.1) {
      total += 10;
    }

    this.creationData.bonusPoints = total;
    this.creationData.startAtLevel4 = total <= 10;
  }

  public generateBaseStats(): void {
    if (!this.creationData.race) return;

    const raceConfig = RACES[this.creationData.race.toLowerCase()];
    if (!raceConfig) return;

    const rollStatInRange = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    this.creationData.baseStats = {
      strength: rollStatInRange(raceConfig.stats.strength.min, raceConfig.stats.strength.max),
      intelligence: rollStatInRange(raceConfig.stats.intelligence.min, raceConfig.stats.intelligence.max),
      piety: rollStatInRange(raceConfig.stats.piety.min, raceConfig.stats.piety.max),
      vitality: rollStatInRange(raceConfig.stats.vitality.min, raceConfig.stats.vitality.max),
      agility: rollStatInRange(raceConfig.stats.agility.min, raceConfig.stats.agility.max),
      luck: rollStatInRange(raceConfig.stats.luck.min, raceConfig.stats.luck.max)
    };

    this.creationData.allocatedBonusPoints = {};
  }

  public getCurrentStats(): CharacterStats {
    if (!this.creationData.baseStats) {
      return { strength: 0, intelligence: 0, piety: 0, vitality: 0, agility: 0, luck: 0 };
    }

    return {
      strength: this.creationData.baseStats.strength + (this.creationData.allocatedBonusPoints.strength || 0),
      intelligence: this.creationData.baseStats.intelligence + (this.creationData.allocatedBonusPoints.intelligence || 0),
      piety: this.creationData.baseStats.piety + (this.creationData.allocatedBonusPoints.piety || 0),
      vitality: this.creationData.baseStats.vitality + (this.creationData.allocatedBonusPoints.vitality || 0),
      agility: this.creationData.baseStats.agility + (this.creationData.allocatedBonusPoints.agility || 0),
      luck: this.creationData.baseStats.luck + (this.creationData.allocatedBonusPoints.luck || 0)
    };
  }

  public getRemainingBonusPoints(): number {
    const allocated = Object.values(this.creationData.allocatedBonusPoints).reduce((sum, val) => sum + (val || 0), 0);
    return this.creationData.bonusPoints - allocated;
  }

  public canAllocateBonusPoint(_stat: keyof CharacterStats): boolean {
    return this.getRemainingBonusPoints() > 0;
  }

  public allocateBonusPoint(stat: keyof CharacterStats): void {
    if (!this.canAllocateBonusPoint(stat)) return;

    this.creationData.allocatedBonusPoints[stat] = (this.creationData.allocatedBonusPoints[stat] || 0) + 1;
  }

  public deallocateBonusPoint(stat: keyof CharacterStats): void {
    const current = this.creationData.allocatedBonusPoints[stat] || 0;
    if (current > 0) {
      this.creationData.allocatedBonusPoints[stat] = current - 1;
    }
  }

  public getEligibleClasses(): CharacterClass[] {
    const stats = this.getCurrentStats();
    const allClasses: CharacterClass[] = [
      'Fighter', 'Mage', 'Priest', 'Thief', 'Alchemist',
      'Bishop', 'Bard', 'Ranger', 'Psionic',
      'Valkyrie', 'Samurai', 'Lord', 'Monk', 'Ninja'
    ];

    return allClasses.filter(charClass => this.meetsClassRequirements(charClass, stats));
  }

  private meetsClassRequirements(charClass: CharacterClass, stats: CharacterStats): boolean {
    if (charClass === 'Valkyrie' && this.creationData.gender !== 'female') {
      return false;
    }

    const classConfig = CLASSES_BY_ID[charClass.toLowerCase()];
    if (!classConfig || !classConfig.requirements) {
      return true;
    }

    const reqs = classConfig.requirements;

    if (reqs.strength && stats.strength < reqs.strength) return false;
    if (reqs.intelligence && stats.intelligence < reqs.intelligence) return false;
    if (reqs.piety && stats.piety < reqs.piety) return false;
    if (reqs.vitality && stats.vitality < reqs.vitality) return false;
    if (reqs.agility && stats.agility < reqs.agility) return false;
    if (reqs.luck && stats.luck < reqs.luck) return false;

    return true;
  }

  public createCharacter(): Character | null {
    if (!this.creationData.race || !this.creationData.class || !this.creationData.alignment || !this.creationData.gender) {
      return null;
    }

    const character = new Character(
      this.creationData.name,
      this.creationData.race,
      this.creationData.class,
      this.creationData.alignment,
      this.creationData.gender
    );

    const finalStats = this.getCurrentStats();
    character.stats = finalStats;
    character.baseStats = finalStats;

    if (this.creationData.startAtLevel4) {
      character.level = 4;
      character.maxHp = character.maxHp * 4;
      character.hp = character.maxHp;
      character.maxMp = character.maxMp * 4;
      character.mp = character.maxMp;
    }

    return character;
  }

  public getRosterCharacters(): Character[] {
    return this.gameState.characterRoster as Character[];
  }

  public getInspectMenuOptions(): string[] {
    return [
      'View Details',
      'Change Class',
      'Rename',
      'Delete',
      'Back'
    ];
  }
}
