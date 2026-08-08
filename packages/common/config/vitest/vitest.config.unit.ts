import { env } from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { z } from 'zod'

const packageDirUrl = new URL('../..', import.meta.url)

const packageDirPath = fileURLToPath(packageDirUrl)

const booleanPattern = /^(?:1|enabled|on|true|y|yes)$/i
const logMessageBlockPattern = /^(?:)/i

function zeroValueStringToUndefined(value: string): string | undefined {
  return value === '' ? undefined : value
}

// eslint-disable-next-line unicorn/consistent-boolean-name
function stringToBoolean(value: string): boolean {
  return booleanPattern.test(value)
}

const isContinuousIntegrationEnvironment = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.string().transform(stringToBoolean).default(false))
  .parse(env.CI)

const config = defineConfig({
  root: packageDirPath,
  test: {
    name: 'wren-common-unit',
    include: ['src/**/?(*.)unit.test.[jt]s'],
    reporters: [
      [isContinuousIntegrationEnvironment ? 'github-actions' : 'default'],
      [
        'html',
        {
          outputFile: fileURLToPath(new URL('test-reports/unit/index.html', packageDirUrl)),
        },
      ],
    ],
    environment: 'node',
    watch: false,
    root: packageDirPath,
    coverage: {
      include: ['src/**/*.[jt]s'],
      exclude: ['src/**/?(*.)unit.test.[jt]s'],
      reportsDirectory: 'test-reports',
      reporter: [
        [isContinuousIntegrationEnvironment ? 'cobertura' : 'text'],
        [
          'html',
          {
            subdir: 'coverage',
          },
        ],
      ],
    },
    mockReset: true,
    resolveSnapshotPath(filePath, ext) {
      return `${filePath}${ext}`
    },
    env: {
      NODE_ENV: 'test',
    },
    onConsoleLog(message) {
      return logMessageBlockPattern.test(message) ? false : undefined
    },
  },
})

export default config
