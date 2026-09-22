import tailwindcssPlugin from '@tailwindcss/vite'
import { playwright } from '@vitest/browser-playwright'
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
    name: 'wren-console-portal:assert-host',
    configResolved(config) {
      if (config.server.host !== undefined && config.server.host !== host) {
        throw new Error(`@wren/console-portal listeners must bind to ${host}`)
      }
    },
  }
}

const config = defineConfig({
  root: packageDirPath,
  plugins: [assertHostPlugin('127.0.0.1'), tailwindcssPlugin()],
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
      {
        test: {
          name: 'component',
          include: ['src/**/?(*.)component.test.[jt]s?(x)'],
          environment: 'happy-dom',
          setupFiles: ['config/vitest/setup.component.ts'],
        },
      },
      {
        test: {
          name: 'visual-regression',
          include: ['src/**/?(*.)visual-regression.test.[jt]s?(x)'],
          setupFiles: ['config/vitest/setup.visual-regression.ts'],
          browser: {
            enabled: true,
            instances: [
              {
                browser: 'chromium',
              },
              {
                browser: 'firefox',
              },
              {
                browser: 'webkit',
              },
            ],
            provider: playwright(),
            headless: true,
            viewport: {
              width: 1280,
              height: 720,
            },
          },
        },
      },
      {
        test: {
          name: 'integration',
          include: ['src/**/?(*.)integration.test.[jt]s'],
        },
      },
    ],
    watch: false,
    root: packageDirPath,
    coverage: {
      include: ['src/**/*.[jt]s?(x)'],
      exclude: [
        'src/**/?(*.)@(end-to-end|integration|unit).test.[jt]s',
        'src/**/?(*.)@(stories|@(component|visual-regression).test).[jt]s?(x)',
        'src/utils/@(decorator|render.@(browser|dom)).tsx',
        'src/config?(.server).ts',
        'src/index.ts',
        'src/routes.ts',
      ],
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
    browser: {
      expect: {
        toMatchScreenshot: {
          screenshotDirectory: 'snapshots',
          resolveScreenshotPath({ arg, ext, browserName, screenshotDirectory, root, testFileDirectory }) {
            return path.resolve(root, testFileDirectory, screenshotDirectory, `${arg}-${browserName}${ext}`)
          },
        },
      },
    },
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
    provide: {
      isContinuousIntegrationEnvironment,
    },
    attachmentsDir: path.join(artifactRootDir, 'attachments'),
  },
})

export default config
