// Production-safe logger that only logs in development
const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args)
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, but in production send to monitoring service
    if (isDev) {
      console.error(...args)
    } else {
      // In production, you could send to error tracking service
      // Example: Sentry.captureException(args[0])
    }
  },
  
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args)
    }
  },
  
  time: (label: string) => {
    if (isDev) {
      console.time(label)
    }
  },
  
  timeEnd: (label: string) => {
    if (isDev) {
      console.timeEnd(label)
    }
  }
}

export default logger