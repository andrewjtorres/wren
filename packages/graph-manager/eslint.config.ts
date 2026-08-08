import { defineConfig } from 'eslint/config'

import { baseConfig, prettierConfig, typescriptConfig } from '../../eslint.config.ts'

const config = defineConfig([
  {
    name: 'ignore',
    ignores: [
      // Miscellaneous
      '!**/.*',

      // Artifacts and Compiled Output
      '.turbo',
      'dist',

      // Dependencies
      'node_modules',

      // Editors and IDEs
      '.cursor',
      '.vscode',
    ],
  },
  {
    ...baseConfig,
    files: ['**/*.[jt]s'],
  },
  {
    ...typescriptConfig,
    files: ['**/*.ts'],
  },
  {
    ...prettierConfig,
    files: ['**/*.[jt]s'],
  },
])

export default config
