import type { Options } from 'prettier'

import { baseConfig, tailwindcssConfig } from '../../prettier.config.ts'

const config: Options = {
  overrides: [
    {
      ...baseConfig,
      files: ['**/*.@(css|[jt]s?(x)|json|md|webmanifest|yml)'],
    },
    {
      ...tailwindcssConfig,
      files: ['**/*.[jt]s?(x)'],
    },
  ],
}

export default config
