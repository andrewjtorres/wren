import { zeroValueStringToUndefined } from '@wren/common/transformation'
import type { SupportedLanguageTag } from 'react-intl'
import { z } from 'zod'

const env = (typeof document === 'undefined' ? process : window.meta).env // eslint-disable-line unicorn/prefer-global-this

// Internationalization
export const i18nDefaultLanguageTag: SupportedLanguageTag = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .pipe(z.literal(['en', 'es']).default('en'))
  .parse(env.I18N_DEFAULT_LANGUAGE_TAG)

// Development
export const debug = z
  .string()
  .transform(zeroValueStringToUndefined)
  .optional()
  .parse(env.DEBUG) // prettier-ignore
