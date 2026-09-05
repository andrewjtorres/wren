import { zeroValueStringToUndefined } from '@wren/common/transformation'
import { env } from 'node:process'
import type { LevelWithSilent as PinoLogLevelWithSilent } from 'pino'
import type { SupportedLanguageTag } from 'react-intl'
import { z } from 'zod'

// Networking and Lifecycle
const portalSchema = z.object({
  httpPort: z
    .string()
    .transform(zeroValueStringToUndefined)
    .optional()
    .pipe(z.coerce.number<string | undefined>().int().gte(1024).lte(65_535).default(5173)),
  probePort: z
    .string()
    .transform(zeroValueStringToUndefined)
    .optional()
    .pipe(z.coerce.number<string | undefined>().int().gte(1024).lte(65_535).default(5174)),
  shutdownTimeout: z
    .string()
    .transform(zeroValueStringToUndefined)
    .optional()
    .pipe(z.coerce.number<string | undefined>().int().gte(0).default(2000 /* 2 seconds */)),
})

export const portal = portalSchema.parse({
  httpPort: env.PORTAL_HTTP_PORT,
  probePort: env.PORTAL_PROBE_PORT,
  shutdownTimeout: env.PORTAL_SHUTDOWN_TIMEOUT,
})

// Auditing and Accountability
export const logLevel: PinoLogLevelWithSilent = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.literal(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'))
  .parse(env.LOG_LEVEL)

// Internationalization
export const i18nDefaultLanguageTag: SupportedLanguageTag = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.literal(['en', 'es']).default('en'))
  .parse(env.I18N_DEFAULT_LANGUAGE_TAG)

// External Resources
const encryptionSchema = z
  .object({
    algorithm: z
      .string()
      .transform(zeroValueStringToUndefined)
      .optional()
      .pipe(z.literal(['aes128gcm', 'aes256gcm', 'aegis128l', 'aegis128x2', 'aegis128x4', 'aegis256', 'aegis256x2']).optional()), // prettier-ignore
    key: z
      .string()
      .transform(zeroValueStringToUndefined)
      .optional(), // prettier-ignore
  })
  .refine((value) => typeof value.algorithm === typeof value.key, {
    error: 'Invalid input: both "algorithm" and "key" are required',
  })

const databaseSchema = z.object({
  dsn: z
    .string()
    .transform(zeroValueStringToUndefined)
    .optional()
    .pipe(z.string()), // prettier-ignore
  encryption: encryptionSchema,
})

export const cacheDatabase = databaseSchema.parse({
  dsn: env.CACHE_DATABASE_DSN,
  encryption: {
    algorithm: env.CACHE_DATABASE_ENCRYPTION_ALGORITHM,
    key: env.CACHE_DATABASE_ENCRYPTION_KEY,
  },
})

export const stateDatabase = databaseSchema.parse({
  dsn: env.STATE_DATABASE_DSN,
  encryption: {
    algorithm: env.STATE_DATABASE_ENCRYPTION_ALGORITHM,
    key: env.STATE_DATABASE_ENCRYPTION_KEY,
  },
})

// Development
const serverSchema = z.object({
  wsPort: z
    .string()
    .transform(zeroValueStringToUndefined)
    .optional()
    .pipe(z.coerce.number<string | undefined>().int().gte(1024).lte(65_535).default(24_678)),
})

export const server = serverSchema.parse({
  wsPort: env.SERVER_WS_PORT,
})

export const debug = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .parse(env.DEBUG) // prettier-ignore
