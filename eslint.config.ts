import javascriptPlugin from '@eslint/js'
import stylisticPlugin from '@stylistic/eslint-plugin'
import vitestPlugin from '@vitest/eslint-plugin'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import formatjsPlugin from 'eslint-plugin-formatjs'
import importXPlugin from 'eslint-plugin-import-x'
import jestDomPlugin from 'eslint-plugin-jest-dom'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import playwrightPlugin from 'eslint-plugin-playwright'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import promisePlugin from 'eslint-plugin-promise'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import storybookPlugin from 'eslint-plugin-storybook'
import testingLibraryPlugin from 'eslint-plugin-testing-library'
import unicornPlugin from 'eslint-plugin-unicorn'
import { type Config, defineConfig } from 'eslint/config'
import typescriptPlugin from 'typescript-eslint'

export const baseConfig: Config = {
  name: 'base',
  files: [],
  languageOptions: {
    ecmaVersion: 2025,
    sourceType: 'module',
  },
  linterOptions: {
    reportUnusedDisableDirectives: 'error',
    reportUnusedInlineConfigs: 'error',
  },
  plugins: {
    '@eslint/js': javascriptPlugin,
    ...importXPlugin.flatConfigs.recommended.plugins, // eslint-disable-line import-x/no-named-as-default-member
    ...perfectionistPlugin.configs['recommended-natural'].plugins, // eslint-disable-line import-x/no-named-as-default-member
    ...promisePlugin.configs['flat/recommended'].plugins,
    ...unicornPlugin.configs.recommended.plugins,
  },
  rules: {
    ...javascriptPlugin.configs.recommended.rules,
    ...importXPlugin.flatConfigs.recommended.rules, // eslint-disable-line import-x/no-named-as-default-member
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
        args: 'all',
        argsIgnorePattern: '^_',
        reportUsedIgnorePattern: true,
      },
    ],
    'import-x/extensions': [
      'error',
      'ignorePackages',
      {
        checkTypeImports: true,
      },
    ],
    'import-x/first': 'error',
    'import-x/newline-after-import': 'error',
    'perfectionist/sort-imports': [
      'error',
      {
        type: 'alphabetical',
        order: 'asc',
        fallbackSort: {
          type: 'type-import-first',
          order: 'asc',
        },
        ignoreCase: false,
        internalPattern: ['^#.+'],
        newlinesBetween: 1,
        newlinesInside: 0,
        groups: [
          ['builtin', 'external'],
          'subpath',
          {
            newlinesBetween: 0,
          },
          ['internal', 'parent', 'sibling', 'index', 'unknown'],
          'side-effect',
        ],
      },
    ],
    'perfectionist/sort-named-imports': [
      'error',
      {
        type: 'alphabetical',
        order: 'asc',
        ignoreCase: false,
        ignoreAlias: true,
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
    'import-x/extensions': ['.js', '.ts'],
    'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
    'import-x/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import-x/resolver-next': [
      createTypeScriptImportResolver({
        project: 'tsconfig.json',
        alwaysTryTypes: true,
      }),
    ],
  },
}

export const typescriptConfig: Config = {
  name: 'typescript',
  files: [],
  languageOptions: {
    parser: typescriptPlugin.parser, // eslint-disable-line import-x/no-named-as-default-member
    parserOptions: {
      projectService: true,
    },
  },
  plugins: {
    '@typescript-eslint': typescriptPlugin.plugin, // eslint-disable-line import-x/no-named-as-default-member
    ...importXPlugin.flatConfigs.typescript.plugins, // eslint-disable-line import-x/no-named-as-default-member
    ...promisePlugin.configs['flat/recommended'].plugins,
  },
  rules: {
    ...typescriptPlugin.configs.eslintRecommended.rules, // eslint-disable-line import-x/no-named-as-default-member
    ...typescriptPlugin.configs.strictTypeChecked[2]?.rules, // eslint-disable-line import-x/no-named-as-default-member
    ...typescriptPlugin.configs.stylisticTypeChecked[2]?.rules, // eslint-disable-line import-x/no-named-as-default-member
    ...importXPlugin.flatConfigs.typescript.rules, // eslint-disable-line import-x/no-named-as-default-member
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
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        args: 'all',
        argsIgnorePattern: '^_',
        reportUsedIgnorePattern: true,
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
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    'import-x/no-duplicates': [
      'warn',
      {
        'prefer-inline': true,
      },
    ],
    'promise/catch-or-return': 'off',
  },
}

export const reactConfig: Config = {
  name: 'react',
  files: [],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      jsxPragma: null, // eslint-disable-line unicorn/no-null
    },
  },
  plugins: {
    ...stylisticPlugin.configs.recommended.plugins,
    ...formatjsPlugin.configs.strict.plugins,
    ...jsxA11yPlugin.flatConfigs.strict.plugins,
    ...perfectionistPlugin.configs['recommended-natural'].plugins, // eslint-disable-line import-x/no-named-as-default-member
    ...reactPlugin.configs.flat['recommended']?.plugins,
    ...reactHooksPlugin.configs.flat['recommended-latest'].plugins,
  },
  rules: {
    ...formatjsPlugin.configs.strict.rules,
    ...jsxA11yPlugin.flatConfigs.strict.rules,
    ...reactPlugin.configs.flat['recommended']?.rules,
    ...reactPlugin.configs.flat['jsx-runtime']?.rules,
    ...reactHooksPlugin.configs.flat['recommended-latest'].rules,
    '@stylistic/jsx-curly-brace-presence': [
      'error',
      {
        propElementValues: 'always',
      },
    ],
    '@stylistic/jsx-self-closing-comp': [
      'error',
      {
        component: true,
        html: true,
      },
    ],
    'formatjs/enforce-message-types': [
      'error',
      {
        generateTypes: true,
      },
    ],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link', 'NavLink'],
        specialLink: ['to'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],
    'jsx-a11y/no-aria-hidden-on-focusable': 'error',
    'perfectionist/sort-jsx-props': [
      'error',
      {
        type: 'natural',
        order: 'asc',
      },
    ],
  },
  settings: {
    'import-x/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import-x/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'jsx-a11y': {
      components: {
        Form: 'form',
        Link: 'a',
        NavLink: 'a',
      },
    },
    react: {
      version: '19.3.0',
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

export const reactTypescriptConfig: Config = {
  name: 'react/typescript',
  files: [],
  plugins: {
    ...reactPlugin.configs.flat['recommended']?.plugins,
  },
  rules: {
    'react/prop-types': 'off',
  },
}

export const storybookMainConfig: Config = {
  name: 'storybook/main',
  files: [],
  // @ts-expect-error TS2322
  plugins: {
    ...storybookPlugin.configs['flat/recommended'][0]?.plugins, // eslint-disable-line import-x/no-named-as-default-member
  },
  rules: {
    ...storybookPlugin.configs['flat/recommended'][2]?.rules, // eslint-disable-line import-x/no-named-as-default-member
  },
}

export const storybookStoriesConfig: Config = {
  name: 'storybook/stories',
  files: [],
  // @ts-expect-error TS2322
  plugins: {
    ...formatjsPlugin.configs.strict.plugins,
    ...storybookPlugin.configs['flat/recommended'][0]?.plugins, // eslint-disable-line import-x/no-named-as-default-member
  },
  rules: {
    ...storybookPlugin.configs['flat/recommended'][1]?.rules, // eslint-disable-line import-x/no-named-as-default-member
    'formatjs/no-literal-string-in-jsx': 'off',
  },
}

export const playwrightConfig: Config = {
  name: 'playwright',
  files: [],
  plugins: {
    ...playwrightPlugin.configs['flat/recommended'].plugins,
  },
  rules: {
    ...playwrightPlugin.configs['flat/recommended'].rules,
  },
}

export const vitestConfig: Config = {
  name: 'vitest',
  files: [],
  plugins: {
    ...formatjsPlugin.configs.strict.plugins,
    ...vitestPlugin.configs.recommended.plugins,
  },
  rules: {
    ...vitestPlugin.configs.recommended.rules,
    'formatjs/no-literal-string-in-jsx': 'off',
    'vitest/no-alias-methods': 'error',
    'vitest/no-done-callback': 'error',
    'vitest/no-test-prefixes': 'error',
    'vitest/prefer-to-be-object': 'error',
    'vitest/prefer-to-contain': 'error',
    'vitest/prefer-to-have-length': 'error',
  },
}

export const vitestTypeCheckedConfig: Config = {
  name: 'vitest/type-checked',
  files: [],
  plugins: {
    '@typescript-eslint': typescriptPlugin.plugin, // eslint-disable-line import-x/no-named-as-default-member
    ...vitestPlugin.configs.recommended.plugins,
  },
  rules: {
    '@typescript-eslint/unbound-method': 'off',
    'vitest/unbound-method': 'error',
  },
}

export const reactTestingLibraryConfig: Config = {
  name: 'react-testing-library',
  files: [],
  plugins: {
    ...jestDomPlugin.configs['flat/recommended'].plugins,
    ...testingLibraryPlugin.configs['flat/react'].plugins,
  },
  rules: {
    ...jestDomPlugin.configs['flat/recommended'].rules,
    ...testingLibraryPlugin.configs['flat/react'].rules,
  },
}

export const prettierConfig: Config = {
  name: 'prettier',
  files: [],
  plugins: {
    ...prettierPlugin.plugins,
  },
  rules: {
    ...prettierPlugin.rules,
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
