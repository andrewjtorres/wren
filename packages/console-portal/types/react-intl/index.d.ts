import type { MessageFormatElement, SupportedLanguageTag } from 'react-intl'

declare global {
  namespace FormatjsIntl {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface IntlConfig {
      locale: SupportedLanguageTag
    }
  }
}

declare module 'react-intl' {
  type SupportedLanguageTag = 'en' | 'es'

  type Messages = Record<string, string> | Record<string, MessageFormatElement[]>
}
