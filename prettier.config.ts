import type { Options, OptionsOverride } from 'prettier'

export const baseConfig: OptionsOverride = {
  files: [],
  options: {
    printWidth: 120,
    semi: false,
    singleQuote: true,
  },
}

export const tailwindcssConfig: OptionsOverride = {
  files: [],
  options: {
    plugins: ['prettier-plugin-tailwindcss'],
  },
}

const config: Options = {
  overrides: [
    {
      ...baseConfig,
      files: ['**/*.@([jt]s|json|md|yml)'],
    },
  ],
}

export default config
