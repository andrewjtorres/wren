import eslint from '@eslint/js'
import stylisticPlugin from '@stylistic/eslint-plugin'
import vitestPlugin from '@vitest/eslint-plugin'
import type { Linter } from 'eslint'
import { defineConfig } from 'eslint/config'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import formatjsPlugin from 'eslint-plugin-formatjs'
import { flatConfigs as importXPluginConfigs } from 'eslint-plugin-import-x'
import jestDomPlugin from 'eslint-plugin-jest-dom'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import { configs as perfectionistConfigs } from 'eslint-plugin-perfectionist'
import playwrightPlugin from 'eslint-plugin-playwright'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import promisePlugin from 'eslint-plugin-promise'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import { configs as storybookConfigs } from 'eslint-plugin-storybook'
import testingLibraryPlugin from 'eslint-plugin-testing-library'
import unicornPlugin from 'eslint-plugin-unicorn'
import { configs as typescriptConfigs, parser as typescriptParser, plugin as typescriptPlugin } from 'typescript-eslint'

export const baseConfig: Linter.Config = {
  name: 'base',
  files: [],
  languageOptions: {
    ecmaVersion: 2025,
    sourceType: 'module',
  },
  plugins: {
    ...importXPluginConfigs.recommended.plugins,
    ...promisePlugin.configs['flat/recommended'].plugins,
    ...unicornPlugin.configs.recommended.plugins,
  },
  rules: {
    ...eslint.configs.recommended.rules,
    ...importXPluginConfigs.recommended.rules,
    ...promisePlugin.configs['flat/recommended'].rules,
    ...unicornPlugin.configs.recommended.rules,
    'func-style': [
      'error',
      'declaration',
      {
        allowArrowFunctions: true,
      },
    ],
    'no-console': 'error',
    'no-param-reassign': [
      'error',
      {
        props: true,
      },
    ],
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
      },
    ],
    'import-x/extensions': ['error', 'ignorePackages'],
    'import-x/first': 'error',
    'import-x/newline-after-import': 'error',
    'import-x/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index', 'unknown'],
        ],
        pathGroups: [
          {
            pattern: '#src/**',
            group: 'internal',
            position: 'before',
          },
        ],
        distinctGroup: false,
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          orderImportKind: 'asc',
        },
      },
    ],
    'unicorn/max-nested-calls': [
      'error',
      {
        max: 5,
      },
    ],
    'unicorn/name-replacements': 'off',
  },
  settings: {
    'import-x/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
    'import-x/internal-regex': '^#src',
    'import-x/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import-x/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import-x/resolver-next': [
      createTypeScriptImportResolver({
        alwaysTryTypes: true,
        project: 'tsconfig.json',
      }),
    ],
  },
}

export const reactConfig: Linter.Config = {
  name: 'react',
  files: [],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    ...stylisticPlugin.configs.recommended.plugins,
    ...formatjsPlugin.configs.recommended.plugins,
    ...jsxA11yPlugin.flatConfigs.recommended.plugins,
    ...perfectionistConfigs['recommended-natural'].plugins,
    ...reactPlugin.configs.flat['recommended']?.plugins,
    ...reactHooksPlugin.configs.flat['recommended-latest'].plugins,
  },
  rules: {
    ...formatjsPlugin.configs.recommended.rules,
    ...jsxA11yPlugin.flatConfigs.recommended.rules,
    ...reactPlugin.configs.flat['recommended']?.rules,
    ...reactPlugin.configs.flat['jsx-runtime']?.rules,
    ...reactHooksPlugin.configs.flat['recommended-latest'].rules,
    '@stylistic/jsx-curly-brace-presence': 'error',
    '@stylistic/jsx-newline': [
      'error',
      {
        prevent: true,
      },
    ],
    '@stylistic/jsx-self-closing-comp': 'error',
    'formatjs/enforce-id': [
      'error',
      {
        idInterpolationPattern: '[sha512:contenthash:base64:10]',
      },
    ],
    'perfectionist/sort-jsx-props': [
      'error',
      {
        type: 'natural',
        order: 'asc',
      },
    ],
  },
  settings: {
    react: {
      version: '19.2.0',
    },
    formComponents: [
      {
        name: 'Form',
        formAttribute: 'action',
      },
    ],
    linkComponents: [
      {
        name: 'Link',
        linkAttribute: 'to',
      },
      {
        name: 'NavLink',
        linkAttribute: 'to',
      },
    ],
  },
}

export const typescriptConfig: Linter.Config = {
  name: 'typescript',
  files: [],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      projectService: true,
    },
  },
  plugins: {
    '@typescript-eslint': typescriptPlugin,
    ...importXPluginConfigs.recommended.plugins,
  },
  rules: {
    ...typescriptConfigs.eslintRecommended.rules,
    ...typescriptConfigs.strictTypeChecked.at(-1)?.rules,
    ...typescriptConfigs.stylisticTypeChecked.at(-1)?.rules,
    ...importXPluginConfigs.typescript.rules,
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': {
          descriptionFormat: String.raw`^ TS\d{4,5}.*$`,
        },
        'ts-ignore': true,
        'ts-nocheck': true,
        'ts-check': false,
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
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
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowAny: false,
        allowArray: false,
        allowBoolean: true,
        allowNever: false,
        allowNullish: true,
        allowNumber: true,
        allowRegExp: true,
      },
    ],
    'import-x/no-duplicates': [
      'warn',
      {
        'prefer-inline': true,
      },
    ],
  },
}

export const storybookConfig: Linter.Config = {
  name: 'storybook',
  files: [],
  // @ts-expect-error TS2322
  plugins: {
    ...formatjsPlugin.configs.recommended.plugins,
    ...storybookConfigs['flat/recommended'].at(0)?.plugins,
  },
  rules: {
    ...storybookConfigs['flat/recommended'].at(0)?.rules,
    'formatjs/no-literal-string-in-jsx': 'off',
  },
}

export const playwrightConfig: Linter.Config = {
  name: 'playwright',
  files: [],
  plugins: {
    ...playwrightPlugin.configs['flat/recommended'].plugins,
  },
  rules: {
    ...playwrightPlugin.configs['flat/recommended'].rules,
  },
}

export const vitestConfig: Linter.Config = {
  name: 'vitest',
  files: [],
  plugins: {
    ...formatjsPlugin.configs.recommended.plugins,
    ...jestDomPlugin.configs['flat/recommended'].plugins,
    ...testingLibraryPlugin.configs['flat/react'].plugins,
    ...vitestPlugin.configs.recommended.plugins,
  },
  rules: {
    ...jestDomPlugin.configs['flat/recommended'].rules,
    ...testingLibraryPlugin.configs['flat/react'].rules,
    ...vitestPlugin.configs.recommended.rules,
    'formatjs/no-literal-string-in-jsx': 'off',
    'vitest/no-alias-methods': 'error',
    'vitest/no-conditional-expect': 'error',
    'vitest/no-disabled-tests': 'warn',
    'vitest/no-done-callback': 'error',
    'vitest/no-focused-tests': 'error',
    'vitest/no-interpolation-in-snapshots': 'error',
    'vitest/no-mocks-import': 'error',
    'vitest/no-standalone-expect': 'error',
    'vitest/no-test-prefixes': 'error',
    'vitest/prefer-to-be-falsy': 'error',
    'vitest/prefer-to-be-object': 'error',
    'vitest/prefer-to-be-truthy': 'error',
    'vitest/prefer-to-contain': 'error',
    'vitest/prefer-to-have-length': 'error',
  },
}

export const prettierConfig: Linter.Config = {
  name: 'prettier',
  files: [],
  plugins: {
    ...prettierPlugin.plugins,
  },
  rules: {
    ...prettierPlugin.rules,
  },
  linterOptions: {
    reportUnusedDisableDirectives: true,
    reportUnusedInlineConfigs: 'error',
  },
}

const config = defineConfig([
  {
    name: 'ignore',
    ignores: [
      // Miscellaneous
      '!**/.*',

      // Artifacts and Compiled Output
      '.turbo',

      // Dependencies
      '.yarn',
      'node_modules',

      // Editors and IDEs
      '.cursor',
      '.idea',
      '.vscode',

      // Version Control
      '.git',

      // Workspaces
      'packages',
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
