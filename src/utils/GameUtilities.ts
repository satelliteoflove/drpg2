import { Direction, ItemEffect } from '../types/GameTypes';

/**
 * Common game utility functions to reduce code duplication
 */
export class GameUtilities {
  /**
   * Common navigation input handling
   * Returns the index change for menu navigation
   */
  static handleMenuNavigation(
    key: string,
    currentIndex: number,
    maxIndex: number,
    options?: {
      wrapAround?: boolean;
    }
  ): { newIndex: number; handled: boolean } {
    const { wrapAround = false } = options || {};

    switch (key) {
      case 'arrowup':
      case 'w':
        if (wrapAround) {
          return {
            newIndex: currentIndex > 0 ? currentIndex - 1 : maxIndex,
            handled: true,
          };
        }
        return {
          newIndex: Math.max(0, currentIndex - 1),
          handled: true,
        };

      case 'arrowdown':
      case 's':
        if (wrapAround) {
          return {
            newIndex: currentIndex < maxIndex ? currentIndex + 1 : 0,
            handled: true,
          };
        }
        return {
          newIndex: Math.min(maxIndex, currentIndex + 1),
          handled: true,
        };

      default:
        return { newIndex: currentIndex, handled: false };
    }
  }

  /**
   * Calculate item effect value based on type
   */
  static calculateItemEffectValue(effect: ItemEffect, enchantment: number = 0): number {
    const baseValue = effect.value || 0;
    const enchantmentBonus = enchantment || 0;

    switch (effect.type) {
      case 'damage':
        return baseValue + enchantmentBonus;
      case 'ac':
        return baseValue + enchantmentBonus;
      case 'heal':
        return baseValue + Math.floor(enchantmentBonus * 0.5);
      case 'stat':
        return baseValue + enchantmentBonus;
      case 'special':
      case 'cure':
      default:
        return baseValue;
    }
  }

  /**
   * Get movement deltas for a direction
   */
  static getMovementDelta(direction: Direction): { dx: number; dy: number } {
    switch (direction) {
      case 'north':
        return { dx: 0, dy: -1 };
      case 'south':
        return { dx: 0, dy: 1 };
      case 'east':
        return { dx: 1, dy: 0 };
      case 'west':
        return { dx: -1, dy: 0 };
      default:
        return { dx: 0, dy: 0 };
    }
  }

  /**
   * Rotate direction clockwise
   */
  static rotateDirectionClockwise(direction: Direction): Direction {
    const rotations: Record<Direction, Direction> = {
      north: 'east',
      east: 'south',
      south: 'west',
      west: 'north',
    };
    return rotations[direction];
  }

  /**
   * Rotate direction counter-clockwise
   */
  static rotateDirectionCounterClockwise(direction: Direction): Direction {
    const rotations: Record<Direction, Direction> = {
      north: 'west',
      west: 'south',
      south: 'east',
      east: 'north',
    };
    return rotations[direction];
  }

  /**
   * Common action key handling (Enter, Space, Escape)
   */
  static isActionKey(key: string): 'confirm' | 'cancel' | null {
    switch (key) {
      case 'enter':
      case ' ':
        return 'confirm';
      case 'escape':
        return 'cancel';
      default:
        return null;
    }
  }

  /**
   * Get tile color based on type (for map rendering)
   */
  static getTileColor(tileType: string): string {
    const tileColors: Record<string, string> = {
      floor: '#444',
      wall: '#000',
      door: '#8b4513',
      stairs_up: '#ffff00',
      stairs_down: '#ff00ff',
      chest: '#ffd700',
      trap: '#ff0000',
      event: '#00ffff',
      safe: '#00ff00',
      boss: '#ff00ff',
      special: '#ffa500',
    };
    return tileColors[tileType] || '#333';
  }

  /**
   * Get tile symbol for text-based rendering
   */
  static getTileSymbol(tileType: string): string {
    const tileSymbols: Record<string, string> = {
      floor: '.',
      wall: '#',
      door: 'D',
      stairs_up: '<',
      stairs_down: '>',
      chest: 'C',
      trap: 'T',
      event: '!',
      safe: 'S',
      boss: 'B',
      special: '?',
    };
    return tileSymbols[tileType] || '?';
  }

  /**
   * Standardized damage/healing effect description
   */
  static getEffectDescription(effectType: string, value: number): string {
    switch (effectType) {
      case 'damage':
        return `+${value} damage`;
      case 'ac':
        return value > 0 ? `+${value} AC` : `${value} AC`;
      case 'heal':
        return `Heals ${value} HP`;
      case 'stat':
        return `+${value} to stats`;
      case 'special':
        return 'Special effect';
      case 'cure':
        return 'Cures conditions';
      default:
        return 'Unknown effect';
    }
  }

  /**
   * Check if a key is a movement key
   */
  static isMovementKey(key: string): boolean {
    return ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(
      key.toLowerCase()
    );
  }

  /**
   * Check if a key is a number key (1-9)
   */
  static isNumberKey(key: string): number | null {
    const num = parseInt(key);
    if (!isNaN(num) && num >= 1 && num <= 9) {
      return num;
    }
    return null;
  }

  /**
   * Format gold amount with proper pluralization
   */
  static formatGold(amount: number): string {
    return `${amount} gold piece${amount !== 1 ? 's' : ''}`;
  }

  /**
   * Format experience amount
   */
  static formatExperience(amount: number): string {
    return `${amount} XP`;
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Random chance check (0-1 probability)
   */
  static rollChance(probability: number): boolean {
    return Math.random() < probability;
  }

  /**
   * Roll dice notation (e.g., "2d6+3")
   */
  static rollDice(notation: string): number {
    const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return 0;

    const numDice = parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    let total = modifier;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * dieSize) + 1;
    }

    return Math.max(0, total);
  }
}
