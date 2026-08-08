import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

import {
  baseConfig,
  isContinuousIntegrationEnvironment,
  packageDirPath,
  packageDirUrl,
} from './playwright.config.base.ts'

const portalHttpPort = 5006

const config = defineConfig(baseConfig, {
  testMatch: ['src/**/?(*.)component.test.[jt]s'],
  reporter: [
    [isContinuousIntegrationEnvironment ? 'github' : 'list'],
    [
      'html',
      {
        outputFolder: fileURLToPath(new URL('test-reports/component/', packageDirUrl)),
      },
    ],
  ],
  use: {
    baseURL: `http://localhost:${portalHttpPort}`,
  },
  webServer: [
    {
      command: `yarn run turbo run build:studio --force -- --test && yarn run vite preview --outDir=dist/studio --port=${portalHttpPort}`,
      url: `http://localhost:${portalHttpPort}`,
      reuseExistingServer: !isContinuousIntegrationEnvironment,
      cwd: packageDirPath,
      env: {
        NODE_ENV: 'test',
        DEBUG: '-wren-console-portal',
      },
    },
  ],
})

export default config
