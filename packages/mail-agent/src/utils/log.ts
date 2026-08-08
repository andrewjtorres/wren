import {
  type LevelWithSilent as PinoLogLevelWithSilent,
  type Logger as PinoLogger,
  type redactOptions as RedactOptions,
  pino,
  stdSerializers,
  stdTimeFunctions,
} from 'pino'

export type LoggerOptions = {
  level: PinoLogLevelWithSilent
  redact?: string[] | RedactOptions | undefined
}

export function createLogger(options: LoggerOptions): PinoLogger {
  return pino({
    serializers: {
      error: stdSerializers.errWithCause,
    },
    timestamp: stdTimeFunctions.isoTime,
    messageKey: 'message',
    errorKey: 'error',
    base: undefined,
    formatters: {
      level(label) {
        return {
          severity: label,
        }
      },
    },
    ...options,
  })
}
