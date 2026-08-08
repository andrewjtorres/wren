import type { Messages, SupportedLanguageTag } from 'react-intl'
import { matchPath } from 'react-router'

import { isSupportedLanguageTag } from './i18n.ts'

function getLanguageTagFromUrl(request: Request): SupportedLanguageTag | undefined {
  const url = new URL(request.url)
  let languageTag = matchPath(':lang?', url.pathname)?.params.lang

  try {
    languageTag = Intl.getCanonicalLocales(languageTag)[0]
  } catch {
    return
  }

  return isSupportedLanguageTag(languageTag) ? languageTag : undefined
}

function getLanguageTagFromHeader(request: Request): SupportedLanguageTag | undefined {
  const languageRanges = request.headers.get('accept-language')?.split(',') ?? []
  const languageTagQualityPairs: [SupportedLanguageTag, number][] = []

  for (const languageRange of languageRanges) {
    const languageRangeParts = languageRange.trim().split(';')

    let languageTag = languageRangeParts[0]?.trim()

    if (languageTag === '*') {
      break
    }

    try {
      languageTag = Intl.getCanonicalLocales(languageTag)[0]
    } catch {
      continue
    }

    if (!isSupportedLanguageTag(languageTag)) {
      continue
    }

    const quality = Number(languageRangeParts[1]?.split('=', 2)[1]?.trim() ?? '1')

    if (Number.isNaN(quality)) {
      continue
    }

    if (quality === 1) {
      return languageTag
    }

    languageTagQualityPairs.push([languageTag, quality])
  }

  return languageTagQualityPairs.toSorted(([, a], [, b]) => b - a)[0]?.[0]
}

export function getLanguageTag(request: Request): SupportedLanguageTag | undefined {
  return getLanguageTagFromUrl(request) ?? getLanguageTagFromHeader(request)
}

export async function getTranslations(languageTag: SupportedLanguageTag): Promise<Messages> {
  switch (languageTag) {
    case 'en': {
      const { default: translations } = await import('#src/i18n/en.json')

      return translations
    }
    case 'es': {
      const { default: translations } = await import('#src/i18n/es.json')

      return translations
    }
  }
}
