import { DebugLogger } from './DebugLogger';

export class RandomSelector {
  static selectRandom<T>(array: T[]): T {
    if (!array || array.length === 0) {
      DebugLogger.error('RandomSelector', 'selectRandom called with empty array');
      throw new Error('Cannot select from empty array');
    }

    const index = Math.floor(Math.random() * array.length);
    return array[index];
  }

  static selectRandomFromEnum<T extends string>(enumObj: Record<string, T>): T {
    if (!enumObj || Object.keys(enumObj).length === 0) {
      DebugLogger.error('RandomSelector', 'selectRandomFromEnum called with empty enum');
      throw new Error('Cannot select from empty enum');
    }

    const values = Object.values(enumObj);
    return this.selectRandom(values);
  }

  static selectWeighted<T>(options: Array<{item: T, weight: number}>): T {
    if (!options || options.length === 0) {
      DebugLogger.error('RandomSelector', 'selectWeighted called with empty options');
      throw new Error('Cannot select from empty options array');
    }

    const totalWeight = options.reduce((sum, option) => {
      if (option.weight < 0) {
        DebugLogger.error('RandomSelector', 'Negative weight detected', { option });
        throw new Error('Weights must be non-negative');
      }
      return sum + option.weight;
    }, 0);

    if (totalWeight === 0) {
      DebugLogger.error('RandomSelector', 'Total weight is zero');
      throw new Error('Total weight must be greater than zero');
    }

    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const option of options) {
      cumulativeWeight += option.weight;
      if (random <= cumulativeWeight) {
        return option.item;
      }
    }

    return options[options.length - 1].item;
  }
}
