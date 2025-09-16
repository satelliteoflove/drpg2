export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface GameError {
  message: string;
  severity: ErrorSeverity;
  context?: string;
  timestamp: number;
  stack?: string;
}

export class ErrorHandler {
  private static errors: GameError[] = [];
  private static maxErrors = 100;

  static logError(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: string,
    error?: Error
  ): void {
    const gameError: GameError = {
      message,
      severity,
      context,
      timestamp: Date.now(),
      stack: error?.stack,
    };

    this.errors.push(gameError);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      console.error(
        `[${severity.toUpperCase()}] ${context ? `[${context}] ` : ''}${message}`,
        error
      );
    } else {
      console.warn(
        `[${severity.toUpperCase()}] ${context ? `[${context}] ` : ''}${message}`,
        error
      );
    }
  }

  static safeCanvasOperation<T>(
    operation: () => T,
    fallback: T,
    context: string = 'Canvas Operation'
  ): T {
    try {
      return operation();
    } catch (error) {
      this.logError(
        `Canvas operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorSeverity.MEDIUM,
        context,
        error instanceof Error ? error : undefined
      );
      return fallback;
    }
  }

  static safeLocalStorageOperation<T>(
    operation: () => T,
    fallback: T,
    context: string = 'LocalStorage Operation'
  ): T {
    try {
      if (typeof Storage === 'undefined') {
        this.logError('LocalStorage not available', ErrorSeverity.LOW, context);
        return fallback;
      }
      return operation();
    } catch (error) {
      this.logError(
        `LocalStorage operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorSeverity.MEDIUM,
        context,
        error instanceof Error ? error : undefined
      );
      return fallback;
    }
  }

  static safeBrowserOperation<T>(
    operation: () => T,
    fallback: T,
    context: string = 'Browser Operation'
  ): T {
    try {
      if (typeof window === 'undefined') {
        this.logError('Window object not available', ErrorSeverity.LOW, context);
        return fallback;
      }
      return operation();
    } catch (error) {
      this.logError(
        `Browser operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorSeverity.MEDIUM,
        context,
        error instanceof Error ? error : undefined
      );
      return fallback;
    }
  }

  static getErrors(): GameError[] {
    return [...this.errors];
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static getErrorsByContext(context: string): GameError[] {
    return this.errors.filter((error) => error.context === context);
  }

  static getErrorsBySeverity(severity: ErrorSeverity): GameError[] {
    return this.errors.filter((error) => error.severity === severity);
  }
}

export function safeConfirm(message: string, defaultValue: boolean = false): boolean {
  return ErrorHandler.safeBrowserOperation(
    () => window.confirm(message),
    defaultValue,
    'Confirmation Dialog'
  );
}

export function safeAlert(message: string): void {
  ErrorHandler.safeBrowserOperation(
    () => {
      window.alert(message);
      return undefined;
    },
    undefined,
    'Alert Dialog'
  );
}

export function createSafeCanvas(element: HTMLElement | null): CanvasRenderingContext2D | null {
  if (!element || !(element instanceof HTMLCanvasElement)) {
    ErrorHandler.logError('Invalid canvas element provided', ErrorSeverity.HIGH, 'Canvas Creation');
    return null;
  }

  return ErrorHandler.safeCanvasOperation(
    () => {
      const ctx = element.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get 2D context');
      }
      return ctx;
    },
    null,
    'Canvas Context Creation'
  );
}
