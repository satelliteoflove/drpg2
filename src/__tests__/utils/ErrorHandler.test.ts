import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ErrorHandler, ErrorSeverity, createSafeCanvas } from '../../utils/ErrorHandler';
import { TestUtils } from '../testUtils';

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logError', () => {
    it('should log error with all provided details', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const error = new Error('Test error');
      
      ErrorHandler.logError('Test message', ErrorSeverity.HIGH, 'TestContext', error);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[HIGH] [TestContext] Test message',
        error
      );
    });

    it('should log error without optional parameters', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      
      ErrorHandler.logError('Simple message', ErrorSeverity.LOW);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[LOW] Simple message',
        undefined
      );
    });

    it('should handle all error severity levels', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      
      ErrorHandler.logError('Critical', ErrorSeverity.CRITICAL);
      ErrorHandler.logError('High', ErrorSeverity.HIGH);
      ErrorHandler.logError('Medium', ErrorSeverity.MEDIUM);
      ErrorHandler.logError('Low', ErrorSeverity.LOW);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // CRITICAL and HIGH
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2); // MEDIUM and LOW
    });
  });

  describe('safeCanvasOperation', () => {
    it('should execute operation successfully and return result', () => {
      const operation = jest.fn(() => 'success');
      const fallback = 'fallback';
      
      const result = ErrorHandler.safeCanvasOperation(operation, fallback, 'TestContext');
      
      expect(operation).toHaveBeenCalled();
      expect(result).toBe('success');
    });

    it('should return fallback value when operation throws', () => {
      const operation = jest.fn(() => {
        throw new Error('Canvas error');
      });
      const fallback = 'fallback';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      
      const result = ErrorHandler.safeCanvasOperation(operation, fallback, 'TestContext');
      
      expect(result).toBe(fallback);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[MEDIUM] [TestContext] Canvas operation failed: Canvas error',
        expect.any(Error)
      );
    });

    it('should handle void operations', () => {
      const operation = jest.fn();
      
      ErrorHandler.safeCanvasOperation(operation, undefined, 'TestContext');
      
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('safeLocalStorageOperation', () => {
    it('should execute localStorage operation successfully', () => {
      const mockStorage = TestUtils.createMockLocalStorage({ 'test': 'value' });
      Object.defineProperty(window, 'localStorage', { value: mockStorage });
      
      const operation = jest.fn(() => localStorage.getItem('test'));
      const result = ErrorHandler.safeLocalStorageOperation(operation, null, 'TestContext');
      
      expect(result).toBe('value');
      expect(operation).toHaveBeenCalled();
    });

    it('should return fallback when localStorage is unavailable', () => {
      // Mock Storage to be undefined
      const originalStorage = global.Storage;
      delete (global as any).Storage;
      
      const operation = jest.fn(() => localStorage.getItem('test'));
      const fallback = 'fallback';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      
      const result = ErrorHandler.safeLocalStorageOperation(operation, fallback, 'TestContext');
      
      expect(result).toBe(fallback);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[LOW] [TestContext] LocalStorage not available',
        undefined
      );
      
      // Restore Storage
      (global as any).Storage = originalStorage;
    });
  });

  describe('safeBrowserOperation', () => {
    it('should execute browser operation successfully', () => {
      const operation = jest.fn(() => 'browser result');
      
      const result = ErrorHandler.safeBrowserOperation(operation, 'fallback', 'TestContext');
      
      expect(operation).toHaveBeenCalled();
      expect(result).toBe('browser result');
    });

    it('should handle browser operation failures', () => {
      const operation = jest.fn(() => {
        throw new Error('Browser API not available');
      });
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      
      const result = ErrorHandler.safeBrowserOperation(operation, 'fallback', 'TestContext');
      
      expect(result).toBe('fallback');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[MEDIUM] [TestContext] Browser operation failed: Browser API not available',
        expect.any(Error)
      );
    });
  });
});

describe('createSafeCanvas', () => {
  it('should return 2D context for valid canvas', () => {
    const canvas = TestUtils.createMockCanvas();
    // Ensure the canvas is properly mocked as HTMLCanvasElement
    Object.setPrototypeOf(canvas, HTMLCanvasElement.prototype);
    
    const context = createSafeCanvas(canvas);
    
    expect(context).toBeTruthy();
  });

  it('should return null when canvas.getContext fails', () => {
    const canvas = TestUtils.createMockCanvas();
    Object.setPrototypeOf(canvas, HTMLCanvasElement.prototype);
    canvas.getContext = jest.fn(() => null);
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    
    const context = createSafeCanvas(canvas);
    
    expect(context).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[MEDIUM] [Canvas Context Creation] Canvas operation failed: Failed to get 2D context',
      expect.any(Error)
    );
  });

  it('should handle canvas.getContext throwing error', () => {
    const canvas = TestUtils.createMockCanvas();
    Object.setPrototypeOf(canvas, HTMLCanvasElement.prototype);
    canvas.getContext = jest.fn(() => {
      throw new Error('Context creation failed');
    });
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    
    const context = createSafeCanvas(canvas);
    
    expect(context).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[MEDIUM] [Canvas Context Creation] Canvas operation failed: Context creation failed',
      expect.any(Error)
    );
  });
});