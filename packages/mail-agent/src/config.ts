import { zeroValueStringToUndefined } from '@wren/common/transformation'
import { env } from 'node:process'
import type { LevelWithSilent as PinoLogLevelWithSilent } from 'pino'
import { z } from 'zod'

// Auditing and Accountability
export const logLevel: PinoLogLevelWithSilent = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.literal(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'))
  .parse(env.LOG_LEVEL)
