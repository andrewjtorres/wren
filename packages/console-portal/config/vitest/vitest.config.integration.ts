import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vitest/config'

import { baseConfig, packageDirUrl } from './vitest.config.base.ts'

const config = mergeConfig(baseConfig, {
  test: {
    name: 'wren-console-portal-integration',
    include: ['src/**/?(*.)integration.test.[jt]s'],
    reporters: [
      [
        'html',
        {
          outputDir: fileURLToPath(new URL('test-reports/integration/', packageDirUrl)),
        },
      ],
    ],
  },
})

export default config
