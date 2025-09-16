interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  module: string;
  message: string;
  data?: any;
  asciiSnapshot?: string;
}

export class DebugLogger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 10000; // Maximum logs to keep in memory
  private static isEnabled = true; // Can be toggled via localStorage
  private static logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' = 'DEBUG';
  private static asciiStateCallback: (() => string) | null = null;

  static {
    // Check localStorage for debug settings
    if (typeof window !== 'undefined' && window.localStorage) {
      const enabled = localStorage.getItem('debugEnabled');
      const level = localStorage.getItem('debugLevel');

      if (enabled !== null) {
        this.isEnabled = enabled === 'true';
      }

      if (level && ['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(level)) {
        this.logLevel = level as typeof this.logLevel;
      }
    }
  }

  private static shouldLog(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'): boolean {
    if (!this.isEnabled) return false;

    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private static formatTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  private static addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also output to console in development
    // eslint-disable-next-line no-undef
    if (typeof process !== 'undefined' && (process as any).env?.NODE_ENV === 'development') {
      const consoleMethod =
        entry.level === 'ERROR' ? 'error' : entry.level === 'WARN' ? 'warn' : 'log';
      console[consoleMethod](`[${entry.level}] ${entry.module}: ${entry.message}`, entry.data);
    }
  }

  public static debug(module: string, message: string, data?: any): void {
    if (!this.shouldLog('DEBUG')) return;

    this.addLog({
      timestamp: this.formatTimestamp(),
      level: 'DEBUG',
      module,
      message,
      data,
    });
  }

  public static info(module: string, message: string, data?: any): void {
    if (!this.shouldLog('INFO')) return;

    this.addLog({
      timestamp: this.formatTimestamp(),
      level: 'INFO',
      module,
      message,
      data,
    });
  }

  public static warn(module: string, message: string, data?: any): void {
    if (!this.shouldLog('WARN')) return;

    this.addLog({
      timestamp: this.formatTimestamp(),
      level: 'WARN',
      module,
      message,
      data,
    });
  }

  public static error(module: string, message: string, data?: any): void {
    if (!this.shouldLog('ERROR')) return;

    this.addLog({
      timestamp: this.formatTimestamp(),
      level: 'ERROR',
      module,
      message,
      data,
    });
  }

  /**
   * Export logs as a downloadable file
   */
  public static exportLogs(): void {
    if (typeof window === 'undefined') return;

    const logContent = this.logs
      .map(
        (log) =>
          `${log.timestamp} [${log.level}] ${log.module}: ${log.message}${
            log.data ? '\n  Data: ' + JSON.stringify(log.data, null, 2) : ''
          }`
      )
      .join('\n\n');

    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drpg2-debug-${new Date().toISOString().replace(/:/g, '-')}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get logs as formatted string
   */
  public static getLogsAsString(): string {
    return this.logs
      .map(
        (log) =>
          `${log.timestamp} [${log.level}] ${log.module}: ${log.message}${
            log.data ? '\n  Data: ' + JSON.stringify(log.data, null, 2) : ''
          }`
      )
      .join('\n');
  }

  /**
   * Clear all logs
   */
  public static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get recent logs
   */
  public static getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Enable/disable logging
   */
  public static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('debugEnabled', String(enabled));
    }
  }

  /**
   * Set minimum log level
   */
  public static setLogLevel(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'): void {
    this.logLevel = level;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('debugLevel', level);
    }
  }

  /**
   * Add keyboard shortcut to export logs (Ctrl+Shift+L)
   */
  public static initializeKeyboardShortcut(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.exportLogs();
        this.info('DebugLogger', 'Logs exported via keyboard shortcut');
      }
    });
  }

  /**
   * Set ASCII state provider for capturing snapshots
   */
  public static setASCIIStateProvider(provider: () => string): void {
    this.asciiStateCallback = provider;
    this.info('DebugLogger', 'ASCII state provider registered');
  }

  /**
   * Log with ASCII snapshot
   */
  public static logWithASCII(
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    module: string,
    message: string,
    data?: any
  ): void {
    if (!this.shouldLog(level)) return;

    const asciiSnapshot = this.asciiStateCallback ? this.asciiStateCallback() : undefined;

    this.addLog({
      timestamp: this.formatTimestamp(),
      level,
      module,
      message,
      data,
      asciiSnapshot,
    });
  }

  /**
   * Get logs with ASCII snapshots
   */
  public static getLogsWithASCII(): LogEntry[] {
    return this.logs.filter((log) => log.asciiSnapshot !== undefined);
  }

  /**
   * Export logs with ASCII snapshots to file
   */
  public static exportASCIILogs(): void {
    if (typeof window === 'undefined') return;

    const asciiLogs = this.getLogsWithASCII();
    const content = asciiLogs
      .map(
        (log) => `${log.timestamp} [${log.level}] ${log.module}: ${log.message}
ASCII State:
${log.asciiSnapshot}
${log.data ? 'Data: ' + JSON.stringify(log.data, null, 2) : ''}
${'='.repeat(80)}`
      )
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drpg2-ascii-debug-${new Date().toISOString().replace(/:/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.info('DebugLogger', 'ASCII logs exported');
  }
}
