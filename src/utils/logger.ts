// Centralized logging utility with environment-based controls

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  enabledInProduction: boolean;
}

const LOG_CONFIG: LogConfig = {
  enabled: import.meta.env.DEV, // Only enable in development by default
  level: 'debug',
  enabledInProduction: false, // Explicitly disable in production
};

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LogConfig;

  constructor(config: LogConfig) {
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    if (!import.meta.env.DEV && !this.config.enabledInProduction) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): unknown[] {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return [prefix, message, ...args];
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', message, ...args));
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', message, ...args));
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', message, ...args));
    }
  }

  // For backwards compatibility during migration
  log(message: string, ...args: unknown[]): void {
    this.info(message, ...args);
  }
}

// Export singleton instance
export const logger = new Logger(LOG_CONFIG);

// Export for testing/configuration
export { Logger, LOG_CONFIG };

// For manual overrides (useful in development)
export function setLogLevel(level: LogLevel): void {
  LOG_CONFIG.level = level;
}

export function enableLogging(enabled: boolean): void {
  LOG_CONFIG.enabled = enabled;
}

export function enableProductionLogging(enabled: boolean): void {
  LOG_CONFIG.enabledInProduction = enabled;
}
