import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vitest/config'

import { baseConfig, packageDirUrl } from './vitest.config.base.ts'

const config = mergeConfig(baseConfig, {
  test: {
    name: 'wren-console-portal-unit',
    include: ['src/**/?(*.)unit.test.[jt]s?(x)'],
    reporters: [
      [
        'html',
        {
          outputDir: fileURLToPath(new URL('test-reports/unit/', packageDirUrl)),
        },
      ],
    ],
  },
})

export default config
