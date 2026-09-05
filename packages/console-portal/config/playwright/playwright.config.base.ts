import { defineConfig, devices } from '@playwright/test'
import { argv, env } from 'node:process'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

export const packageDirUrl = new URL('../..', import.meta.url)
export const temporaryDirUrl = new URL('tmp/', packageDirUrl)

export const packageDirPath = fileURLToPath(packageDirUrl)
export const temporaryDirPath = fileURLToPath(temporaryDirUrl)

const booleanPattern = /^(?:1|enabled|on|true|y|yes)$/i

export function zeroValueStringToUndefined(value: string): string | undefined {
  return value === '' ? undefined : value
}

// eslint-disable-next-line unicorn/consistent-boolean-name
export function stringToBoolean(value: string): boolean {
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

export const isContinuousIntegrationEnvironment = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.string().transform(stringToBoolean).default(false))
  .parse(env.CI)

export const isLocalEnvironment = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.string().transform(stringToBoolean).default(true))
  .parse(env.LOCAL)

export const htmlHost = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.literal('127.0.0.1').default('127.0.0.1'))
  .parse(env.PLAYWRIGHT_HTML_HOST)

// NOTE: Playwright accepts the UI host only from the command line, so it cannot
// be pinned through configuration. This runs for its validation side effect,
// rejecting a non-loopback `--ui-host` before the UI server starts.
z.literal('127.0.0.1').optional().parse(longOptionValue('--ui-host')) // eslint-disable-line unicorn/no-top-level-side-effects

export const baseConfig = defineConfig({
  snapshotPathTemplate: '{testDir}/{testFileDir}/snapshots/{arg}-{projectName}{ext}',
  ignoreSnapshots: !isContinuousIntegrationEnvironment,
  testDir: packageDirPath,
  fullyParallel: true,
  forbidOnly: isContinuousIntegrationEnvironment,
  retries: isContinuousIntegrationEnvironment ? 2 : 0,
  ...(isContinuousIntegrationEnvironment && {
    workers: 1,
  }),
  use: {
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
})
