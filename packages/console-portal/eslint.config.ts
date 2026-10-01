import { defineConfig } from 'eslint/config'

import {
  baseConfig,
  playwrightConfig,
  prettierConfig,
  reactConfig,
  reactTestingLibraryConfig,
  reactTypescriptConfig,
  storybookMainConfig,
  storybookStoriesConfig,
  typescriptConfig,
  vitestConfig,
  vitestTypeCheckedConfig,
} from '../../eslint.config.ts'

const config = defineConfig([
  {
    name: 'ignore',
    ignores: [
      // Miscellaneous
      '!**/.*',

      // Artifacts and Compiled Output
      '.react-router',
      '.turbo',
      'dist',
      'tmp',

      // Dependencies
      'node_modules',

      // Editors and IDEs
      '.cursor',
      '.vscode',

      // Styles and Assets
      'public',

      // Test and Code Coverage
      'test-reports',
      'test-results',
    ],
  },
  {
    ...baseConfig,
    files: ['**/*.[jt]s?(x)'],
  },
  {
    ...typescriptConfig,
    files: ['**/*.ts?(x)'],
    rules: {
      ...typescriptConfig.rules,
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'lib',
              name: 'Response',
            },
          ],
          allowRethrowing: true,
          allowThrowingAny: true,
          allowThrowingUnknown: true,
        },
      ],
    },
  },
  {
    ...reactConfig,
    files: ['**/*.[jt]s?(x)'],
  },
  {
    ...reactTypescriptConfig,
    files: ['**/*.[jt]s?(x)'],
  },
  {
    ...storybookMainConfig,
    files: ['.storybook/main.[jt]s'],
  },
  {
    ...storybookStoriesConfig,
    files: ['**/?(*.)stories.[jt]s?(x)'],
  },
  {
    ...playwrightConfig,
    files: ['**/?(*.)end-to-end.test.[jt]s'],
  },
  {
    ...vitestConfig,
    files: ['**/?(*.)@(integration|unit).test.[jt]s', '**/?(*.)@(component|visual-regression).test.[jt]s?(x)'],
  },
  {
    ...vitestTypeCheckedConfig,
    files: ['**/?(*.)@(integration|unit).test.[jt]s', '**/?(*.)@(component|visual-regression).test.[jt]s?(x)'],
  },
  {
    ...reactTestingLibraryConfig,
    files: ['**/?(*.)component.test.[jt]s?(x)'],
  },
  {
    ...prettierConfig,
    files: ['**/*.[jt]s?(x)'],
  },
])

export default config
