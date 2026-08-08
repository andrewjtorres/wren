import { defineConfig } from 'eslint/config'

import { baseConfig, prettierConfig, typescriptConfig, vitestConfig } from '../../eslint.config.ts'

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

      // Test and Code Coverage
      'test-reports',
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
    ...vitestConfig,
    files: ['**/?(*.)unit.test.[jt]s'],
  },
  {
    ...prettierConfig,
    files: ['**/*.[jt]s'],
  },
])

export default config
