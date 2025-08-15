// Production-ready logger with environment-based output
const isDevelopment = import.meta.env.DEV

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, even in production (for monitoring)
    if (isDevelopment) {
      console.error(...args)
    } else {
      // In production, you might want to send to an error tracking service
      console.error(...args)
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  }
}