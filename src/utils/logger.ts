// Production-ready structured logger with environment-based output
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: 'log' | 'warn' | 'error' | 'debug' | 'info';
  message: string;
  data?: unknown;
  context?: LogContext;
  timestamp: string;
}

class Logger {
  private context: LogContext = {};

  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  private formatMessage(
    level: LogEntry['level'],
    message: string,
    data?: unknown
  ): LogEntry {
    return {
      level,
      message,
      data,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }

  private shouldLog(level: LogEntry['level']): boolean {
    if (level === 'error') {
      return true;
    } // Always log errors
    if (isDevelopment) {
      return true;
    }
    if (isProduction && level === 'warn') {
      return true;
    }
    return false;
  }

  private output(entry: LogEntry): void {
    const { level, message, data, context, timestamp } = entry;

    if (isDevelopment) {
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      if (context.component) {
        console[level](`${prefix} [${context.component}]`, message, data || '');
      } else {
        console[level](`${prefix}`, message, data || '');
      }
    } else {
      // In production, log as JSON for better parsing
      console[level](JSON.stringify(entry));
    }
  }

  log(message: string, data?: unknown): void {
    if (!this.shouldLog('log')) {
      return;
    }
    const entry = this.formatMessage('log', message, data);
    this.output(entry);
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) {
      return;
    }
    const entry = this.formatMessage('warn', message, data);
    this.output(entry);
  }

  error(message: string, error?: Error | unknown): void {
    const entry = this.formatMessage('error', message, error);
    this.output(entry);

    // In production, you might want to send to an error tracking service
    if (isProduction && error instanceof Error) {
      // Example: Sentry.captureException(error)
      this.context.errorId = crypto.randomUUID();
    }
  }

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) {
      return;
    }
    const entry = this.formatMessage('debug', message, data);
    this.output(entry);
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog('info')) {
      return;
    }
    const entry = this.formatMessage('info', message, data);
    this.output(entry);
  }

  // Performance logging
  time(label: string): void {
    if (isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Group logging for better organization
  group(label: string): void {
    if (isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (isDevelopment) {
      console.groupEnd();
    }
  }
}

export const logger = new Logger();
