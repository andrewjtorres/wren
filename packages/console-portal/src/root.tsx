import { status302Code, status302Message, status404Code, status404Message } from '@wren/common/http'
import { env } from 'node:process'
import { type JSX, type ReactNode, useEffect } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import {
  type LinkDescriptor,
  Links,
  type LoaderFunctionArgs,
  Meta,
  type MetaDescriptor,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRevalidator,
  useRouteLoaderData,
} from 'react-router'

import { useContentSecurityPolicyNonce } from './components/content-security-policy-nonce-provider.tsx'
import { ErrorBoundary as BaseErrorBoundary, type ErrorResponseHandlers } from './components/error-boundary/index.tsx'
import { debug, i18nDefaultLanguageTag } from './config.ts'
import fontStyleSheetUrl from './styles/font.css?url'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import {
  clientHintCheckScript,
  subscribeToPrefersColorSchemeChange,
  subscribeToPrefersReducedMotionChange,
} from './utils/client-hint.ts'
import { getLanguageTag } from './utils/i18n.server.ts'
import { isSupportedLanguageTag } from './utils/i18n.ts'

export type BuildInfo = {
  gitCommitReference?: string
  gitCommitHash?: string
  gitCommitTimestamp?: string
}

export type LoaderData = {
  buildInfo: BuildInfo
  windowMetaEnv: WindowMetaEnv
}

export function loader({ request, params }: LoaderFunctionArgs): LoaderData {
  if (params['lang'] !== undefined && !isSupportedLanguageTag(params['lang'])) {
    throw new Response(undefined, {
      status: status404Code,
      statusText: status404Message,
    })
  }

  const languageTag = getLanguageTag(request) ?? i18nDefaultLanguageTag
  const url = new URL(request.url)

  if (languageTag !== i18nDefaultLanguageTag && !url.pathname.startsWith(`/${languageTag}`)) {
    throw new Response(undefined, {
      status: status302Code,
      statusText: status302Message,
      headers: {
        location: `/${languageTag}${url.pathname}${url.search}`,
      },
    })
  }

  return {
    buildInfo: {
      gitCommitReference: env.GIT_COMMIT_REFERENCE,
      gitCommitHash: env.GIT_COMMIT_HASH,
      gitCommitTimestamp: env.GIT_COMMIT_TIMESTAMP,
    },
    windowMetaEnv: {
      I18N_DEFAULT_LANGUAGE_TAG: i18nDefaultLanguageTag,
      DEBUG: debug,
    },
  }
}

export function links(): LinkDescriptor[] {
  return [
    {
      rel: 'preload',
      as: 'style',
      href: fontStyleSheetUrl,
    },
    {
      rel: 'preload',
      as: 'style',
      href: tailwindStyleSheetUrl,
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      sizes: '48x48',
      href: '/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
    {
      rel: 'stylesheet',
      href: fontStyleSheetUrl,
    },
    {
      rel: 'stylesheet',
      href: tailwindStyleSheetUrl,
    },
  ]
}

export function meta(): MetaDescriptor[] {
  return [
    {
      title: 'Wren',
    },
    {
      name: 'author',
      content: 'Andrew J. Torres',
    },
    {
      name: 'description',
      content: 'Control surface and runtime',
    },
    {
      name: 'theme-color',
      content: '#ffffff',
    },
  ]
}

const notFoundErrorHandlerMessages = defineMessages({
  title: {
    id: 'Zu62i1gQ2Z',
    description: 'Not found error handler title',
    defaultMessage: '404',
  },
})

function NotFoundErrorHandler(): JSX.Element {
  const intl = useIntl()

  return (
    <div className="bg-blue-9 text-blue-contrast selection:bg-blue-7 selection:text-blue-12 flex flex-1 flex-col justify-center">
      <div className="text-center leading-none">
        <h1 className="font-mono text-[25vw]">{intl.formatMessage(notFoundErrorHandlerMessages.title)}</h1>
      </div>
    </div>
  )
}

const errorResponseHandlers: ErrorResponseHandlers = {
  404: NotFoundErrorHandler,
}

export function ErrorBoundary(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden" data-testid="nh9h797tr2">
      <BaseErrorBoundary errorResponseHandlers={errorResponseHandlers} />
    </main>
  )
}

export type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps): JSX.Element {
  const contentSecurityPolicyNonce = useContentSecurityPolicyNonce()
  const intl = useIntl()
  const { revalidate } = useRevalidator()

  const { buildInfo = {}, windowMetaEnv = {} } = useRouteLoaderData<typeof loader>('root') ?? {}

  const windowMetaI18n: WindowMetaI18n = {
    languageTag: intl.locale,
    translations: intl.messages,
  }

  useEffect(
    () =>
      subscribeToPrefersColorSchemeChange(() => {
        void revalidate()
      }),
    [revalidate],
  )

  useEffect(
    () =>
      subscribeToPrefersReducedMotionChange(() => {
        void revalidate()
      }),
    [revalidate],
  )

  return (
    <html className="h-full" lang={intl.locale}>
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <meta content="initial-scale=1.0,viewport-fit=cover,width=device-width" name="viewport" />
        <Links nonce={contentSecurityPolicyNonce} />
        <script
          dangerouslySetInnerHTML={{
            __html: clientHintCheckScript,
          }}
          nonce={contentSecurityPolicyNonce}
        />
      </head>
      <body className="m-0 h-full min-h-full">
        {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
        <noscript>You need to enable JavaScript to run this application.</noscript>
        {children}
        <ScrollRestoration nonce={contentSecurityPolicyNonce} />
        <Scripts nonce={contentSecurityPolicyNonce} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.meta={env:${JSON.stringify(windowMetaEnv)},i18n:${JSON.stringify(windowMetaI18n)},buildInfo(){const o=${JSON.stringify(buildInfo)};let n="";for(const[e,l]of Object.entries(o))l&&(n+=\`\${e}: \${String(l)}\\n\`);n&&(console.groupCollapsed("[app] build info"),console.info(n),console.groupEnd())}},window.meta.buildInfo(),${windowMetaEnv.DEBUG ? `localStorage.setItem("debug",${JSON.stringify(windowMetaEnv.DEBUG)})` : 'localStorage.removeItem("debug")'};`,
          }}
          nonce={contentSecurityPolicyNonce}
        />
      </body>
    </html>
  )
}

export default function Route(): JSX.Element {
  return <Outlet />
}
