import { jest } from '@jest/globals';
import { Character } from '../entities/Character';
import { Party } from '../entities/Party';
import { GameState } from '../types/GameTypes';

/**
 * Test utilities for creating mock objects and test data
 */
export class TestUtils {
  /**
   * Creates a mock HTML canvas element
   */
  static createMockCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    return canvas;
  }

  /**
   * Creates a mock canvas 2D rendering context
   */
  static createMockCanvasContext(): CanvasRenderingContext2D {
    return {
      fillRect: jest.fn(),
      fillText: jest.fn(),
      strokeRect: jest.fn(),
      strokeText: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      rect: jest.fn(),
      clearRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      drawImage: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      getImageData: jest.fn(),
      putImageData: jest.fn(),
      createImageData: jest.fn(),
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      isPointInPath: jest.fn(),
      isPointInStroke: jest.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '12px sans-serif',
      textAlign: 'start' as CanvasTextAlign,
      textBaseline: 'alphabetic' as CanvasTextBaseline,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    } as unknown as CanvasRenderingContext2D;
  }

  /**
   * Creates a test character with default stats
   */
  static createTestCharacter(
    overrides: Partial<{
      name: string;
      race: string;
      class: string;
      alignment: string;
    }> = {}
  ): Character {
    const defaults = {
      name: 'Test Hero',
      race: 'Human',
      class: 'Fighter',
      alignment: 'Good',
    };

    const params = { ...defaults, ...overrides };
    return new Character(
      params.name,
      params.race as any,
      params.class as any,
      params.alignment as any
    );
  }

  /**
   * Creates a test party with specified number of characters
   */
  static createTestParty(characterCount: number = 1): Party {
    const party = new Party();

    for (let i = 0; i < characterCount; i++) {
      const character = this.createTestCharacter({
        name: `Hero ${i + 1}`,
        class: i % 2 === 0 ? 'Fighter' : 'Mage',
      });
      party.addCharacter(character);
    }

    return party;
  }

  /**
   * Creates a minimal test game state
   */
  static createTestGameState(overrides: Partial<GameState> = {}): GameState {
    const defaults: GameState = {
      party: this.createTestParty(),
      dungeon: [],
      currentFloor: 1,
      inCombat: false,
      gameTime: 0,
      turnCount: 0,
      combatEnabled: true,
      characterRoster: [],
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Creates a spy function that can be used in tests
   */
  static createSpy<T extends (...args: any[]) => any>(implementation?: T): any {
    return jest.fn(implementation);
  }

  /**
   * Advances Jest fake timers by specified milliseconds
   */
  static advanceTimers(ms: number): void {
    jest.advanceTimersByTime(ms);
  }

  /**
   * Asserts that a function throws an error with a specific message
   */
  static expectToThrow(fn: () => void, errorMessage?: string): void {
    if (errorMessage) {
      expect(fn).toThrow(errorMessage);
    } else {
      expect(fn).toThrow();
    }
  }

  /**
   * Creates a mock for localStorage with specified initial data
   */
  static createMockLocalStorage(initialData: Record<string, string> = {}): Storage {
    const store: Record<string, string> = { ...initialData };

    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
      length: Object.keys(store).length,
    } as Storage;
  }

  /**
   * Asserts that a canvas context method was called with specific parameters
   */
  static expectCanvasCall(
    context: CanvasRenderingContext2D,
    method: keyof CanvasRenderingContext2D,
    ...args: any[]
  ): void {
    const mockMethod = (context as any)[method];
    if (jest.isMockFunction(mockMethod)) {
      if (args.length > 0) {
        expect(mockMethod).toHaveBeenCalledWith(...args);
      } else {
        expect(mockMethod).toHaveBeenCalled();
      }
    } else {
      throw new Error(`${String(method)} is not a mock function`);
    }
  }
}
