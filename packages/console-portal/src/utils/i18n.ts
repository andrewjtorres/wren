import type { SupportedLanguageTag } from 'react-intl'

const supportedLanguageTags: SupportedLanguageTag[] = ['en', 'es'] as const

export function isSupportedLanguageTag(value: unknown): value is SupportedLanguageTag {
  return typeof value === 'string' && supportedLanguageTags.includes(value)
}
