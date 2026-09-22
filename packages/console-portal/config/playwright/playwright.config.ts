import { defineConfig, devices } from '@playwright/test'
import { argv, env } from 'node:process'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

// NOTE: Playwright accepts the UI host only from the command line, so it cannot
// be pinned through configuration. This runs for its validation side effect,
// rejecting a non-loopback `--ui-host` before the UI server starts.
z.literal('127.0.0.1').optional().parse(longOptionValue('--ui-host')) // eslint-disable-line unicorn/no-top-level-side-effects

const packageDirUrl = new URL('../..', import.meta.url)
const temporaryDirUrl = new URL('tmp/', packageDirUrl)
const temporaryEndToEndDirUrl = new URL('end-to-end/', temporaryDirUrl)

const packageDirPath = fileURLToPath(packageDirUrl)
const temporaryEndToEndDirPath = fileURLToPath(temporaryEndToEndDirUrl)

const booleanPattern = /^(?:1|enabled|on|true|y|yes)$/i

const portalHttpPort = 4173
const portalProbePort = 4174

function zeroValueStringToUndefined(value: string): string | undefined {
  return value === '' ? undefined : value
}

// eslint-disable-next-line unicorn/consistent-boolean-name
function stringToBoolean(value: string): boolean {
  return booleanPattern.test(value)
}

function longOptionValue(name: string): string | undefined {
  const options = argv.slice(2)
  const i = options.findLastIndex((option) => option === name || option.startsWith(`${name}=`))

  if (i === -1) {
    return
  }

  const option = options[i] ?? ''

  return option.includes('=') ? option.slice(name.length + 1) : options[i + 1]
}

const isLocalEnvironment = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.string().transform(stringToBoolean).default(true))
  .parse(env.LOCAL)

const isContinuousIntegrationEnvironment = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.string().transform(stringToBoolean).default(false))
  .parse(env.CI)

const htmlReporterHost = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.literal('127.0.0.1').default('127.0.0.1'))
  .parse(env.PLAYWRIGHT_HTML_REPORTER_HOST)

const cacheDatabaseDsn = fileURLToPath(new URL('cache.db', temporaryEndToEndDirUrl))

const stateDatabaseDsn = fileURLToPath(new URL('state.db', temporaryEndToEndDirUrl))

const portalUrl = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.url().default(`http://localhost:${portalHttpPort}`))
  .parse(env.PORTAL_URL)

const config = defineConfig({
  testMatch: ['src/**/?(*.)end-to-end.test.[jt]s'],
  snapshotPathTemplate: '{testDir}/{testFileDir}/snapshots/{arg}-{projectName}{ext}',
  ignoreSnapshots: !isContinuousIntegrationEnvironment,
  testDir: packageDirPath,
  fullyParallel: true,
  forbidOnly: isContinuousIntegrationEnvironment,
  retries: isContinuousIntegrationEnvironment ? 2 : 0,
  ...(isContinuousIntegrationEnvironment && {
    workers: 1,
  }),
  reporter: [
    [isContinuousIntegrationEnvironment ? 'github' : 'list'],
    [
      'html',
      {
        host: htmlReporterHost,
        outputFolder: fileURLToPath(new URL('test-reports/end-to-end/html/', packageDirUrl)),
      },
    ],
  ],
  use: {
    baseURL: portalUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
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
