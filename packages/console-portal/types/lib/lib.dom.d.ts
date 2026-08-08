import type { Messages, SupportedLanguageTag } from 'react-intl'

declare global {
  type WindowMetaI18n = {
    readonly languageTag?: SupportedLanguageTag
    readonly translations?: Messages
  }

  type WindowMetaEnv = {
    readonly I18N_DEFAULT_LANGUAGE_TAG?: string
    readonly DEBUG?: string
  }

  type WindowMeta = {
    readonly env: WindowMetaEnv
    readonly i18n: WindowMetaI18n
    buildInfo(): void
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    readonly meta: WindowMeta
  }
}

export {}
