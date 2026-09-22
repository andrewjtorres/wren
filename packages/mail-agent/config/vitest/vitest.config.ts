import path from 'node:path'
import { env } from 'node:process'
import { fileURLToPath } from 'node:url'
import { type Plugin, defineConfig } from 'vitest/config'
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

const artifactRootDir = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.string().default('test-reports'))
  .parse(env.VITEST_ARTIFACT_ROOT_DIR)

function assertHostPlugin(host: string): Plugin {
  return {
    name: 'wren-mail-agent:assert-host',
    configResolved(config) {
      if (config.server.host !== undefined && config.server.host !== host) {
        throw new Error(`@wren/mail-agent listeners must bind to ${host}`)
      }
    },
  }
}

const config = defineConfig({
  root: packageDirPath,
  plugins: [assertHostPlugin('127.0.0.1')],
  server: {
    host: '127.0.0.1',
  },
  test: {
    reporters: [
      [isContinuousIntegrationEnvironment ? 'github-actions' : 'default'],
      [
        'html',
        {
          outputDir: path.join(artifactRootDir, 'html'),
        },
      ],
    ],
    environment: 'node',
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/?(*.)unit.test.[jt]s'],
        },
      },
    ],
    watch: false,
    root: packageDirPath,
    coverage: {
      include: ['src/**/*.[jt]s'],
      exclude: ['src/**/?(*.)unit.test.[jt]s', 'src/config.ts'],
      reportsDirectory: artifactRootDir,
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
    provide: {
      isContinuousIntegrationEnvironment,
    },
    attachmentsDir: path.join(artifactRootDir, 'attachments'),
  },
})

export default config
