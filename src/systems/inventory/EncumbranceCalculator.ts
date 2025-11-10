import { Character } from '../../entities/Character';

export class EncumbranceCalculator {
  private static instance: EncumbranceCalculator | null = null;

  public static getInstance(): EncumbranceCalculator {
    if (!EncumbranceCalculator.instance) {
      EncumbranceCalculator.instance = new EncumbranceCalculator();
    }
    return EncumbranceCalculator.instance;
  }

  public getInventoryWeight(character: Character): number {
    let weight = 0;

    character.inventory.forEach((item) => {
      weight += item.weight * item.quantity;
    });

    Object.values(character.equipment).forEach((item) => {
      if (item) {
        weight += item.weight;
      }
    });

    return weight;
  }

  public getCarryCapacity(character: Character): number {
    return character.stats.strength * 10;
  }

  public isEncumbered(character: Character): boolean {
    return this.getInventoryWeight(character) > this.getCarryCapacity(character);
  }
}
