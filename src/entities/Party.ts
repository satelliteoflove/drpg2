import { Character } from './Character';
import { Direction, Formation, IParty } from '../types/GameTypes';

export class Party implements IParty {
  characters: Character[];
  formation: Formation;
  x: number;
  y: number;
  facing: Direction;
  floor: number;

  constructor() {
    this.characters = [];
    this.formation = 'front';
    this.x = 0;
    this.y = 0;
    this.facing = 'north';
    this.floor = 1;
  }

  public addCharacter(character: Character): boolean {
    if (this.characters.length >= 6) {
      return false;
    }
    this.characters.push(character);
    return true;
  }

  public removeCharacter(characterId: string): boolean {
    const index = this.characters.findIndex((c) => c.id === characterId);
    if (index === -1) return false;

    this.characters.splice(index, 1);
    return true;
  }

  public swapCharacters(index1: number, index2: number): void {
    if (
      index1 < 0 ||
      index1 >= this.characters.length ||
      index2 < 0 ||
      index2 >= this.characters.length
    ) {
      return;
    }

    [this.characters[index1], this.characters[index2]] = [
      this.characters[index2],
      this.characters[index1],
    ];
  }

  public getFrontRow(): Character[] {
    return this.characters.slice(0, 3).filter((c) => c && !c.isDead);
  }

  public getBackRow(): Character[] {
    return this.characters.slice(3, 6).filter((c) => c && !c.isDead);
  }

  public getAliveCharacters(): Character[] {
    return this.characters.filter((c) => !c.isDead);
  }

  public isWiped(): boolean {
    return this.getAliveCharacters().length === 0;
  }

  public move(direction: 'forward' | 'backward' | 'left' | 'right'): void {
    switch (direction) {
      case 'forward':
        this.moveForward();
        break;
      case 'backward':
        this.moveBackward();
        break;
      case 'left':
        this.turnLeft();
        break;
      case 'right':
        this.turnRight();
        break;
    }
  }

  private moveForward(): void {
    const [dx, dy] = this.getDirectionVector();
    this.x += dx;
    this.y += dy;
  }

  private moveBackward(): void {
    const [dx, dy] = this.getDirectionVector();
    this.x -= dx;
    this.y -= dy;
  }

  private turnLeft(): void {
    const directions: Direction[] = ['north', 'west', 'south', 'east'];
    const currentIndex = directions.indexOf(this.facing);
    this.facing = directions[(currentIndex + 1) % 4];
  }

  private turnRight(): void {
    const directions: Direction[] = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(this.facing);
    this.facing = directions[(currentIndex + 1) % 4];
  }

  private getDirectionVector(): [number, number] {
    switch (this.facing) {
      case 'north':
        return [0, -1];
      case 'south':
        return [0, 1];
      case 'east':
        return [1, 0];
      case 'west':
        return [-1, 0];
      default:
        return [0, 0];
    }
  }

  public rest(): void {
    this.characters.forEach((char) => {
      if (!char.isDead) {
        char.heal(Math.floor(char.maxHp * 0.1));
        char.mp = Math.min(char.maxMp, char.mp + Math.floor(char.maxMp * 0.2));
      }
    });
  }

  public getTotalGold(): number {
    return this.characters.reduce((total, char) => total + char.gold, 0);
  }

  public distributeGold(amount: number): void {
    const aliveChars = this.getAliveCharacters();
    if (aliveChars.length === 0) return;

    const goldPerChar = Math.floor(amount / aliveChars.length);
    aliveChars.forEach((char) => {
      char.gold += goldPerChar;
    });
  }

  public distributeExperience(amount: number): void {
    const aliveChars = this.getAliveCharacters();
    if (aliveChars.length === 0) return;

    // Each character gets the full experience amount (not split)
    aliveChars.forEach((char) => {
      char.addExperience(amount);
    });
  }
}
