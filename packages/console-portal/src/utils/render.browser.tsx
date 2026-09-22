import type { JSX, ReactElement, ReactNode } from 'react'
import type { RootOptions } from 'react-dom/client'
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
import {
  type RenderOptions as BaseRenderOptions,
  type RenderResult as BaseRenderResult,
  render as baseRender,
} from 'vitest-browser-react/pure'

import { i18nDefaultLanguageTag } from '#src/config.ts'
import enTranslations from '#src/i18n/en.json' with { type: 'json' }
import esTranslations from '#src/i18n/es.json' with { type: 'json' }

// NOTE: This config should match the future config declared in the sibling
// decorator.tsx and render.dom.tsx files and the react-router.config.ts file
// located in the root directory of the project.
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

export type RenderOptions = Omit<BaseRenderOptions, 'createRootOptions'> & RootOptions

export type RenderResult = Pick<BaseRenderResult, 'container' | 'baseElement' | 'debug' | 'unmount' | 'asFragment'>

export async function render(
  ui: ReactElement,
  { identifierPrefix, onUncaughtError, onRecoverableError, onCaughtError, ...restOptions }: RenderOptions = {},
): Promise<RenderResult> {
  const { container, baseElement, debug, unmount, asFragment } = await baseRender(ui, {
    ...restOptions,
    createRootOptions: {
      identifierPrefix,
      onUncaughtError,
      onRecoverableError,
      onCaughtError,
    },
  })

  return {
    container,
    baseElement,
    debug,
    unmount,
    asFragment,
  }
}

type WrapperProps = {
  children: ReactNode
}

export type RenderWithContextOptions = Omit<RenderOptions, 'wrapper'> & Partial<IntlProviderProps>

export function renderWithContext(
  ui: ReactElement,
  {
    locale = i18nDefaultLanguageTag,
    timeZone,
    fallbackOnEmptyString,
    formats,
    messages = getTranslations(locale),
    defaultLocale,
    defaultFormats,
    defaultRichTextElements,
    onError,
    onWarn,
    textComponent,
    wrapRichTextChunksInFragment,
    ...restOptions
  }: RenderWithContextOptions = {},
): Promise<RenderResult> {
  function Wrapper({ children }: WrapperProps): JSX.Element {
    return (
      <IntlProvider
        defaultFormats={defaultFormats}
        defaultLocale={defaultLocale}
        defaultRichTextElements={defaultRichTextElements}
        fallbackOnEmptyString={fallbackOnEmptyString}
        formats={formats}
        locale={locale}
        messages={messages}
        onError={onError}
        onWarn={onWarn}
        textComponent={textComponent}
        timeZone={timeZone}
        wrapRichTextChunksInFragment={wrapRichTextChunksInFragment}
      >
        {children}
      </IntlProvider>
    )
  }

  return render(ui, {
    wrapper: Wrapper,
    ...restOptions,
  })
}

export type RenderWithRouterOptions = {
  routes: StubRouteObject[]
  context?: RouterContextProvider
} & RenderWithContextOptions &
  Omit<RoutesTestStubProps, 'future'>

export function renderWithRouter({
  routes,
  context,
  initialEntries,
  initialIndex,
  hydrationData,
  ...restOptions
}: RenderWithRouterOptions): Promise<RenderResult> {
  const RoutesStub = createRoutesStub(routes, context)

  return renderWithContext(
    <RoutesStub
      future={reactRouterFutureConfig}
      hydrationData={hydrationData}
      initialEntries={initialEntries}
      initialIndex={initialIndex}
    />,
    restOptions,
  )
}
