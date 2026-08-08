import type { Options } from 'prettier'

import { baseConfig } from '../../prettier.config.ts'

const config: Options = {
  overrides: [
    {
      ...baseConfig,
      files: ['**/*.@([jt]s|json|md|yml)'],
    },
  ],
}

export default config
