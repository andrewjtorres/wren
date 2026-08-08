import type { Options } from 'prettier'

declare module 'prettier' {
  type OptionsOverride = {
    files: string | string[]
    excludeFiles?: string | string[]
    options?: Options
  }
}
