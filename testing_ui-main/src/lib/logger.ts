type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  debug(...args: any[]) {
    if (this.isDevelopment) {
      console.log('[DEBUG]', ...args)
    }
  }

  info(...args: any[]) {
    if (this.isDevelopment) {
      console.log('[INFO]', ...args)
    }
  }

  warn(...args: any[]) {
    console.warn('[WARN]', ...args)
  }

  error(...args: any[]) {
    console.error('[ERROR]', ...args)
  }
}

export const logger = new Logger()



