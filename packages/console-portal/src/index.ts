import { type HttpBindings, serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import type { EncryptionOpts, ExperimentalFeature } from '@tursodatabase/database-common'
import { asError } from '@wren/common/error'
import {
  createStatus404ResponseBody,
  createStatus500ResponseBody,
  status200Code,
  status404Code,
  status500Code,
} from '@wren/common/http'
import { createSafeAlphanumericLowercaseId } from '@wren/common/nanoid'
import { relations as cacheDatabaseRelations } from '@wren/graph-manager/database/cache'
import { relations as stateDatabaseRelations } from '@wren/graph-manager/database/state'
import closeWithGrace from 'close-with-grace'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/tursodatabase/database'
import { Hono, type MiddlewareHandler } from 'hono'
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { randomBytes } from 'node:crypto'
import { env } from 'node:process'
import { RouterContextProvider, type ServerBuild, createRequestHandler } from 'react-router'

import {
  cacheDatabase,
  debug,
  i18nDefaultLanguageTag,
  logLevel,
  portal,
  server,
  stateDatabase,
} from './config.server.ts'
import {
  cacheDatabaseClientContext,
  contentSecurityPolicyNonceContext,
  loggerContext,
  stateDatabaseClientContext,
} from './context.ts'
import { createLogger } from './utils/log.server.ts'

const cacheControlHighPathPattern = /^(?:assets|fonts)\//i
const cacheControlLowPathPattern = /^(?!(?:assets|fonts)\/)/i

const acceptLanguageHeaderValuePattern = /^(?:\*|accept-language)$/i
const forwardSlashPrefixPattern = /^\/+/

type ContentSecurityPolicyVariables = {
  contentSecurityPolicyNonce?: string
}

export type HonoEnvironment = {
  Bindings: HttpBindings
  Variables: ContentSecurityPolicyVariables
}

function getCacheControl(uriPath: string): string {
  if (cacheControlHighPathPattern.test(uriPath)) {
    return 'public, max-age=31557600, immutable' // 1 year
  }

  if (cacheControlLowPathPattern.test(uriPath)) {
    return 'max-age=3600, must-revalidate' // 1 hour
  }

  return 'no-cache, no-store, must-revalidate'
}

export type MainOptions = {
  build?: ServerBuild | (() => ServerBuild | Promise<ServerBuild>)
  interceptorMiddleware?: MiddlewareHandler<HonoEnvironment>
  prepareError?: (error: Error) => void
}

export async function main({ interceptorMiddleware, prepareError, ...restOptions }: MainOptions = {}): Promise<void> {
  const build = restOptions.build ?? (await import('virtual:react-router/server-build')) // eslint-disable-line import-x/no-unresolved

  const logger = createLogger({
    level: logLevel,
    redact: {
      paths: ['config.cacheDatabase.encryption.key', 'config.stateDatabase.encryption.key'],
      censor(value) {
        return value === undefined ? undefined : '[redacted]'
      },
    },
  })

  logger.info({
    message: 'Build information',
    info: {
      gitCommitReference: env.GIT_COMMIT_REFERENCE,
      gitCommitHash: env.GIT_COMMIT_HASH,
      gitCommitTimestamp: env.GIT_COMMIT_TIMESTAMP,
    },
  })

  logger.info({
    message: 'Active configuration',
    config: {
      portal,
      logLevel,
      i18nDefaultLanguageTag,
      cacheDatabase,
      stateDatabase,
      server,
      debug,
    },
  })

  let cacheDatabaseExperimentalFeatures: ExperimentalFeature[] = ['triggers']
  let cacheDatabaseEncryptionOptions: EncryptionOpts | undefined

  if (cacheDatabase.encryption.algorithm !== undefined && cacheDatabase.encryption.key !== undefined) {
    cacheDatabaseExperimentalFeatures = ['encryption', ...cacheDatabaseExperimentalFeatures]

    cacheDatabaseEncryptionOptions = {
      cipher: cacheDatabase.encryption.algorithm,
      hexkey: cacheDatabase.encryption.key,
    }
  }

  const cacheDatabaseClient = drizzle({
    relations: cacheDatabaseRelations,
    jit: true,
    connection: {
      timeout: 3000, // 3 seconds
      defaultQueryTimeout: 15_000, // 15 seconds
      experimental: cacheDatabaseExperimentalFeatures,
      ...(cacheDatabaseEncryptionOptions !== undefined && {
        encryption: cacheDatabaseEncryptionOptions,
      }),
      path: cacheDatabase.dsn,
    },
  })

  let stateDatabaseExperimentalFeatures: ExperimentalFeature[] = ['triggers']
  let stateDatabaseEncryptionOptions: EncryptionOpts | undefined

  if (stateDatabase.encryption.algorithm !== undefined && stateDatabase.encryption.key !== undefined) {
    stateDatabaseExperimentalFeatures = ['encryption']

    stateDatabaseEncryptionOptions = {
      cipher: stateDatabase.encryption.algorithm,
      hexkey: stateDatabase.encryption.key,
    }
  }

  const stateDatabaseClient = drizzle({
    relations: stateDatabaseRelations,
    jit: true,
    connection: {
      timeout: 3000, // 3 seconds
      defaultQueryTimeout: 15_000, // 15 seconds
      experimental: stateDatabaseExperimentalFeatures,
      ...(stateDatabaseEncryptionOptions !== undefined && {
        encryption: stateDatabaseEncryptionOptions,
      }),
      path: stateDatabase.dsn,
    },
  })

  await Promise.all([
    cacheDatabaseClient.run(sql`PRAGMA foreign_keys = ON`),
    stateDatabaseClient.run(sql`PRAGMA foreign_keys = ON`),
  ])

  const httpApp = new Hono<HonoEnvironment>()

  httpApp.onError((error, context) => {
    prepareError?.(error)

    logger.error({
      message: 'HTTP server encountered an error',
      error,
    })

    if ('getResponse' in error) {
      return error.getResponse()
    }

    const url = new URL(context.req.url)

    return context.json(createStatus500ResponseBody(`${url.pathname}${url.search}`), status500Code)
  })

  httpApp.notFound((context) => {
    const url = new URL(context.req.url)

    return context.json(createStatus404ResponseBody(`${url.pathname}${url.search}`), status404Code)
  })

  httpApp.use(
    secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: [
          "'self'",
          ...(env.NODE_ENV === 'development'
            ? [
                `http://127.0.0.1:${portal.httpPort}`,
                `http://localhost:${portal.httpPort}`,
                `ws://127.0.0.1:${server.wsPort}`,
                `ws://localhost:${server.wsPort}`,
              ]
            : []),
        ],
        frameAncestors: ["'none'"],
        fontSrc: ["'self'"],
        formAction: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: [
          (context) => {
            const nonce = randomBytes(16).toString('base64')

            context.set('contentSecurityPolicyNonce', nonce)

            return `'nonce-${nonce}'`
          },
          "'self'",
          "'strict-dynamic'",
          "'unsafe-inline'",
        ],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        workerSrc: ["'self'", 'blob:'],
        childSrc: ["'self'"],
        manifestSrc: ["'self'"],
        ...(env.NODE_ENV === 'production' && {
          upgradeInsecureRequests: [],
        }),
      },
    }),
  )

  httpApp.use(
    requestId({
      headerName: 'x-request-id',
      generator() {
        return createSafeAlphanumericLowercaseId()
      },
    }),
  )

  httpApp.use(trimTrailingSlash())

  let isPortalShuttingDown = false

  async function isPortalReady(): Promise<boolean> {
    if (isPortalShuttingDown || !httpServer.listening) {
      return false
    }

    try {
      await Promise.all([cacheDatabaseClient.run(sql`SELECT 1`), stateDatabaseClient.run(sql`SELECT 1`)])

      return true
    } catch {
      return false
    }
  }

  httpApp.get('/health', async (context) => {
    if (isPortalShuttingDown) {
      return context.text('PORTAL_IS_SHUTTING_DOWN', status500Code)
    }

    if (await isPortalReady()) {
      return context.text('PORTAL_IS_HEALTHY', status200Code)
    }

    return context.text('PORTAL_IS_UNHEALTHY', status500Code)
  })

  if (interceptorMiddleware) {
    httpApp.use(interceptorMiddleware)
  }

  httpApp.use(
    '*',
    serveStatic({
      root: env.NODE_ENV === 'development' ? 'public' : 'client',
      onFound(_path, context) {
        context.header('cache-control', getCacheControl(context.req.path.replace(forwardSlashPrefixPattern, '')))
      },
    }),
  )

  httpApp.all('*', async (context) => {
    const requestHandler = createRequestHandler(build, env.NODE_ENV)

    const contextProvider = new RouterContextProvider()

    contextProvider.set(loggerContext, logger)
    contextProvider.set(cacheDatabaseClientContext, cacheDatabaseClient)
    contextProvider.set(stateDatabaseClientContext, stateDatabaseClient)
    contextProvider.set(contentSecurityPolicyNonceContext, context.get('contentSecurityPolicyNonce'))

    const response = await requestHandler(context.req.raw, contextProvider)

    const headers = new Headers(response.headers)

    if (!headers.has('cache-control')) {
      headers.set('cache-control', 'no-cache, no-store, must-revalidate')
    }

    const varyHeader = headers.get('vary')

    if (!varyHeader?.split(',').some((value) => acceptLanguageHeaderValuePattern.test(value.trim()))) {
      headers.append('vary', 'accept-language')
    }

    return new Response(response.body, {
      headers,
      status: response.status,
      statusText: response.statusText,
    })
  })

  const httpServer = serve(
    {
      fetch: httpApp.fetch,
      port: portal.httpPort,
      hostname: '127.0.0.1',
    },
    ({ port }) => {
      logger.info(`HTTP server listening at http://localhost:${port}`)
    },
  )

  const probeApp = new Hono()

  probeApp.onError((error, context) => {
    prepareError?.(error)

    logger.error({
      message: 'Probe server encountered an error',
      error,
    })

    if ('getResponse' in error) {
      return error.getResponse()
    }

    const url = new URL(context.req.url)

    return context.json(createStatus500ResponseBody(`${url.pathname}${url.search}`), status500Code)
  })

  probeApp.notFound((context) => {
    const url = new URL(context.req.url)

    return context.json(createStatus404ResponseBody(`${url.pathname}${url.search}`), status404Code)
  })

  probeApp.get('/health', async (context) => {
    if (isPortalShuttingDown) {
      return context.text('PORTAL_IS_SHUTTING_DOWN', status500Code)
    }

    if (await isPortalReady()) {
      return context.text('PORTAL_IS_HEALTHY', status200Code)
    }

    return context.text('PORTAL_IS_UNHEALTHY', status500Code)
  })

  probeApp.get('/live', (context) => {
    if (isPortalShuttingDown) {
      return context.text('PORTAL_IS_SHUTTING_DOWN', status500Code)
    }

    return context.text('PORTAL_IS_NOT_SHUTTING_DOWN', status200Code)
  })

  probeApp.get('/ready', async (context) => {
    if (await isPortalReady()) {
      return context.text('PORTAL_IS_READY', status200Code)
    }

    return context.text('PORTAL_IS_NOT_READY', status500Code)
  })

  const probeServer = serve(
    {
      fetch: probeApp.fetch,
      port: portal.probePort,
      hostname: '127.0.0.1',
    },
    ({ port }) => {
      logger.info(`Probe server listening at http://localhost:${port}`)
    },
  )

  const { close } = closeWithGrace(
    {
      delay: portal.shutdownTimeout,
    },
    async ({ err: error }) => {
      if (error) {
        logger.error({
          message: 'An error occurred during graceful shutdown',
          error,
        })
      }

      isPortalShuttingDown = true

      try {
        await new Promise<void>((resolve, reject) => {
          if (!httpServer.listening) {
            resolve()

            return
          }

          httpServer.close((error) => {
            if (error) {
              reject(error)
            } else {
              resolve()
            }
          })
        })
      } catch (error) {
        logger.error({
          message: 'HTTP server encountered an error',
          error: asError(error),
        })
      }

      try {
        await new Promise<void>((resolve, reject) => {
          if (!probeServer.listening) {
            resolve()

            return
          }

          probeServer.close((error) => {
            if (error) {
              reject(error)
            } else {
              resolve()
            }
          })
        })
      } catch (error) {
        logger.error({
          message: 'Probe server encountered an error',
          error: asError(error),
        })
      }

      try {
        await cacheDatabaseClient.$client.close()
      } catch (error) {
        logger.error({
          message: 'Cache database client encountered an error',
          error: asError(error),
        })
      }

      try {
        await stateDatabaseClient.$client.close()
      } catch (error) {
        logger.error({
          message: 'State database client encountered an error',
          error: asError(error),
        })
      }
    },
  )

  httpServer.on('error', (error) => {
    logger.error({
      message: 'HTTP server encountered an error',
      error: asError(error),
    })

    close()
  })

  probeServer.on('error', (error) => {
    logger.error({
      message: 'Probe server encountered an error',
      error: asError(error),
    })

    close()
  })
}

if (import.meta.main) {
  await main()
}
