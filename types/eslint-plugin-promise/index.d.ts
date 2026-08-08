declare module 'eslint-plugin-promise' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    rulesConfig: Record<string, number>
    configs: {
      'flat/recommended': Linter.Config
      recommended: Linter.LegacyConfig
    }
  }

  export default plugin
}
