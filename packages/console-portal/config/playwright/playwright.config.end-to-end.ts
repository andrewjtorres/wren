import { defineConfig } from '@playwright/test'
import { env } from 'node:process'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

import {
  baseConfig,
  isContinuousIntegrationEnvironment,
  isLocalEnvironment,
  packageDirPath,
  packageDirUrl,
  temporaryDirUrl,
  zeroValueStringToUndefined,
} from './playwright.config.base.ts'

const temporaryEndToEndDirUrl = new URL('end-to-end/', temporaryDirUrl)

const temporaryEndToEndDirPath = fileURLToPath(temporaryEndToEndDirUrl)

const portalHttpPort = 4173
const portalProbePort = 4174

const cacheDatabaseDsn = fileURLToPath(new URL('cache.db', temporaryEndToEndDirUrl))

const stateDatabaseDsn = fileURLToPath(new URL('state.db', temporaryEndToEndDirUrl))

const portalUrl = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.url().default(`http://localhost:${portalHttpPort}`))
  .parse(env.PORTAL_URL)

const config = defineConfig(baseConfig, {
  testMatch: ['src/**/?(*.)end-to-end.test.[jt]s'],
  reporter: [
    [isContinuousIntegrationEnvironment ? 'github' : 'list'],
    [
      'html',
      {
        outputFolder: fileURLToPath(new URL('test-reports/end-to-end/', packageDirUrl)),
      },
    ],
  ],
  use: {
    baseURL: portalUrl,
  },
  ...(isLocalEnvironment && {
    webServer: [
      {
        command: `yarn run turbo run build:portal --force && yarn run del '${temporaryEndToEndDirPath}' && yarn run make-dir --mode=0755 '${temporaryEndToEndDirPath}' && yarn ../graph-manager atlas migrate apply --dir=file://migrations/cache --url='libsql+file://${cacheDatabaseDsn}' && yarn ../graph-manager atlas migrate apply --dir=file://migrations/state --url='libsql+file://${stateDatabaseDsn}' && yarn ./dist node server/index.js`,
        url: `http://localhost:${portalProbePort}/ready`,
        reuseExistingServer: !isContinuousIntegrationEnvironment,
        cwd: packageDirPath,
        env: {
          NODE_ENV: 'test',
          PORTAL_HTTP_PORT: portalHttpPort.toString(),
          PORTAL_PROBE_PORT: portalProbePort.toString(),
          CACHE_DATABASE_DSN: cacheDatabaseDsn,
          STATE_DATABASE_DSN: stateDatabaseDsn,
          DEBUG: '-wren-console-portal',
        },
      },
    ],
  }),
})

export default config
