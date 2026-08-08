import type { Config } from 'stylelint'

import { baseConfig, prettierConfig, tailwindcssConfig } from '../../stylelint.config.ts'

const config: Config = {
  rules: {},
  overrides: [
    {
      ...baseConfig,
      files: ['**/*.css'],
    },
    {
      ...tailwindcssConfig,
      files: ['**/*.css'],
    },
    {
      ...prettierConfig,
      files: ['**/*.css'],
    },
  ],
}

export default config
