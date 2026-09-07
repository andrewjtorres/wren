import { env } from 'node:process'
import { fileURLToPath } from 'node:url'
import { type Plugin, defineConfig } from 'vitest/config'
import { z } from 'zod'

export const packageDirUrl = new URL('../..', import.meta.url)

export const packageDirPath = fileURLToPath(packageDirUrl)

const booleanPattern = /^(?:1|enabled|on|true|y|yes)$/i
const logMessageBlockPattern = /^(?:)/i

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

export function assertHostPlugin(host: string): Plugin {
  return {
    name: 'wren-console-portal:assert-host',
    configResolved(config) {
      if (config.server.host !== undefined && config.server.host !== host) {
        throw new Error(`@wren/console-portal listeners must bind to ${host}`)
      }
    },
  }
}

export const baseConfig = defineConfig({
  root: packageDirPath,
  plugins: [assertHostPlugin('127.0.0.1')],
  server: {
    host: '127.0.0.1',
  },
  test: {
    reporters: [[isContinuousIntegrationEnvironment ? 'github-actions' : 'default']],
    environment: 'node',
    watch: false,
    root: packageDirPath,
    setupFiles: ['config/vitest/setup.ts'],
    coverage: {
      include: ['src/**/*.[jt]s?(x)'],
      exclude: [
        'src/**/?(*.)@(component|end-to-end|integration).test.[jt]s',
        'src/**/?(*.)@(stories|unit.test).[jt]s?(x)',
        'src/utils/@(decorator|render).tsx',
        'src/config?(.server).ts',
        'src/index.ts',
        'src/routes.ts',
      ],
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
      DEBUG: '-wren-console-portal',
    },
    onConsoleLog(message) {
      return logMessageBlockPattern.test(message) ? false : undefined
    },
  },
})
