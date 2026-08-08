import { asError } from '@wren/common/error'
import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'
import type { RouterErrorInfo } from 'react-router'
import { HydratedRouter } from 'react-router/dom'

import { i18nDefaultLanguageTag } from './config.ts'
import { getTimeZoneCookieValue } from './utils/client-hint.ts'
import { log } from './utils/log.ts'

function handleIntlError(value: unknown): void {
  const error = asError(value)

  log(error)
}

function handleIntlWarning(message: string): void {
  log(message)
}

function handleRouterError(value: unknown, info: RouterErrorInfo) {
  const error = asError(value)

  log(error, info)
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <IntlProvider
        defaultLocale={i18nDefaultLanguageTag}
        /* eslint-disable-next-line unicorn/prefer-global-this */
        locale={window.meta.i18n.languageTag ?? i18nDefaultLanguageTag}
        /* eslint-disable-next-line unicorn/prefer-global-this */
        messages={window.meta.i18n.translations}
        onError={handleIntlError}
        onWarn={handleIntlWarning}
        timeZone={getTimeZoneCookieValue(document.cookie)}
      >
        <HydratedRouter onError={handleRouterError} />
      </IntlProvider>
    </StrictMode>,
  )
})
