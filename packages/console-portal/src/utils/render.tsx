import {
  type RenderOptions as BaseRenderOptions,
  type RenderResult as BaseRenderResult,
  render as baseRender,
  type queries,
} from '@testing-library/react'
import { type UserEvent, userEvent } from '@testing-library/user-event'
import type { JSX, ReactElement, ReactNode } from 'react'
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

export type RenderOptions<
  TContainer extends Document | DocumentFragment | Element = HTMLElement,
  TBaseElement extends Document | DocumentFragment | Element = TContainer,
> = Omit<BaseRenderOptions<typeof queries, TContainer, TBaseElement>, 'queries'>

export type RenderResult<
  TContainer extends Document | DocumentFragment | Element = HTMLElement,
  TBaseElement extends Document | DocumentFragment | Element = TContainer,
> = {
  userEvent: UserEvent
} & Pick<
  BaseRenderResult<typeof queries, TContainer, TBaseElement>,
  'container' | 'baseElement' | 'debug' | 'unmount' | 'asFragment'
>

export type RenderWithContextOptions<
  TContainer extends Document | DocumentFragment | Element = HTMLElement,
  TBaseElement extends Document | DocumentFragment | Element = TContainer,
> = Omit<RenderOptions<TContainer, TBaseElement>, 'wrapper'> & Partial<IntlProviderProps>

export type RenderWithRouterOptions<
  TContainer extends Document | DocumentFragment | Element = HTMLElement,
  TBaseElement extends Document | DocumentFragment | Element = TContainer,
> = {
  routes: StubRouteObject[]
  context?: RouterContextProvider
} & RenderWithContextOptions<TContainer, TBaseElement> &
  Omit<RoutesTestStubProps, 'future'>

export type WrapperProps = {
  children: ReactNode
}

// NOTE: This config should match the future config declared in the sibling
// decorator.tsx file and the react-router.config.ts file located in the root
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

export function render<
  TContainer extends Document | DocumentFragment | Element = HTMLElement,
  TBaseElement extends Document | DocumentFragment | Element = TContainer,
>(ui: ReactElement, options: RenderOptions<TContainer, TBaseElement> = {}): RenderResult<TContainer, TBaseElement> {
  const { container, baseElement, debug, unmount, asFragment } = baseRender(ui, options)

  return {
    userEvent: userEvent.setup(),
    container,
    baseElement,
    debug,
    unmount,
    asFragment,
  }
}

export function renderWithContext<
  TContainer extends Document | DocumentFragment | Element = HTMLElement,
  TBaseElement extends Document | DocumentFragment | Element = TContainer,
>(
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
  }: RenderWithContextOptions<TContainer, TBaseElement> = {},
): RenderResult<TContainer, TBaseElement> {
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

export function renderWithRouter<
  TContainer extends Document | DocumentFragment | Element = HTMLElement,
  TBaseElement extends Document | DocumentFragment | Element = TContainer,
>({
  routes,
  context,
  initialEntries,
  initialIndex,
  hydrationData,
  ...restOptions
}: RenderWithRouterOptions<TContainer, TBaseElement>): RenderResult<TContainer, TBaseElement> {
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
