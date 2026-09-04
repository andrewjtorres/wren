import { defineConfig, devices } from '@playwright/test'
import { env } from 'node:process'
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
