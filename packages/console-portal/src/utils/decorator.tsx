import type { JSX, ReactElement } from 'react'
import {
  IntlProvider,
  type IntlConfig as IntlProviderProps,
  type Messages,
  type SupportedLanguageTag,
} from 'react-intl'
import {
  type FutureConfig,
  type RouterContextProvider,
  type RoutesTestStubProps,
  type StubRouteObject,
  createRoutesStub,
} from 'react-router'

import { i18nDefaultLanguageTag } from '#src/config.ts'
import enTranslations from '#src/i18n/en.json' with { type: 'json' }
import esTranslations from '#src/i18n/es.json' with { type: 'json' }

export type WithContextOptions = Partial<IntlProviderProps>

export type WithRouterOptions = {
  routes: StubRouteObject[]
  context?: RouterContextProvider
} & WithContextOptions &
  Omit<RoutesTestStubProps, 'future'>

// NOTE: This config should match the future config declared in the sibling
// render.tsx file and the react-router.config.ts file located in the root
// directory of the project.
const reactRouterFutureConfig: Partial<FutureConfig> = {}

function getTranslations(languageTag: SupportedLanguageTag): Messages {
  switch (languageTag) {
    case 'en': {
      return enTranslations
    }
    case 'es': {
      return esTranslations
    }
  }
}

export function withContext(
  element: ReactElement,
  { locale = i18nDefaultLanguageTag, messages = getTranslations(locale), ...restOptions }: WithContextOptions = {},
): JSX.Element {
  return (
    <IntlProvider locale={locale} messages={messages} {...restOptions}>
      {element}
    </IntlProvider>
  )
}

export function withRouter({
  routes,
  context,
  initialEntries,
  initialIndex,
  hydrationData,
  ...restOptions
}: WithRouterOptions): JSX.Element {
  const RoutesStub = createRoutesStub(routes, context)

  return withContext(
    <RoutesStub
      future={reactRouterFutureConfig}
      hydrationData={hydrationData}
      initialEntries={initialEntries}
      initialIndex={initialIndex}
    />,
    restOptions,
  )
}
