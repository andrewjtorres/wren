import type { Config } from 'stylelint'

declare module 'stylelint' {
  type ConfigOverride = Omit<Config, 'overrides'> & {
    files: string | string[]
  }
}
