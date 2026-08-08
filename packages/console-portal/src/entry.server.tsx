import { createReadableStreamFromReadable } from '@react-router/node'
import { asError } from '@wren/common/error'
import { status500Code } from '@wren/common/http'
import { isbot } from 'isbot'
import { PassThrough } from 'node:stream'
import { StrictMode } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { IntlProvider } from 'react-intl'
import {
  type ActionFunctionArgs,
  type EntryContext,
  type LoaderFunctionArgs,
  type RouterContextProvider,
  ServerRouter,
  isRouteErrorResponse,
} from 'react-router'

import { ContentSecurityPolicyNonceProvider } from './components/content-security-policy-nonce-provider.tsx'
import { i18nDefaultLanguageTag } from './config.ts'
import { contentSecurityPolicyNonceContext, loggerContext } from './context.ts'
import { getTimeZoneCookieValue } from './utils/client-hint.ts'
import { isResponse } from './utils/http.ts'
import { getLanguageTag, getTranslations } from './utils/i18n.server.ts'

export function handleError(value: unknown, { request, context }: ActionFunctionArgs | LoaderFunctionArgs): void {
  if (request.signal.aborted) {
    return
  }

  if (isResponse(value) || isRouteErrorResponse(value)) {
    return
  }

  const error = asError(value)
  const logger = context.get(loggerContext)

  logger?.error({
    message: 'React Router data function encountered an error',
    error,
  })
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  contextProvider: RouterContextProvider,
): Promise<Response> {
  const headers = new Headers(responseHeaders)

  if (request.method.toUpperCase() === 'HEAD') {
    return new Response(undefined, {
      headers,
      status: responseStatusCode,
    })
  }

  const logger = contextProvider.get(loggerContext)
  const contentSecurityPolicyNonce = contextProvider.get(contentSecurityPolicyNonceContext)

  const handledErrors = new Set<unknown>()
  let hasHandledError = false

  function handleError(value: unknown): void {
    if (handledErrors.has(value)) {
      return
    }

    handledErrors.add(value)

    const error = asError(value)

    logger?.error({
      message: 'React server render encountered an error',
      error,
    })
  }

  const languageTag = getLanguageTag(request) ?? i18nDefaultLanguageTag
  const translations = await getTranslations(languageTag)

  function handleIntlError(value: unknown): void {
    const error = asError(value)

    logger?.error({
      message: 'React Intl encountered an error',
      error,
    })
  }

  function handleIntlWarning(message: string): void {
    logger?.warn({
      message,
    })
  }

  return new Promise<Response>((resolve, reject) => {
    let timeout: NodeJS.Timeout | undefined = setTimeout(() => {
      abort()
    }, 6000 /* 6 seconds */)

    const { abort, pipe } = renderToPipeableStream(
      <StrictMode>
        <ContentSecurityPolicyNonceProvider nonce={contentSecurityPolicyNonce ?? ''}>
          <IntlProvider
            defaultLocale={i18nDefaultLanguageTag}
            locale={languageTag}
            messages={translations}
            onError={handleIntlError}
            onWarn={handleIntlWarning}
            timeZone={getTimeZoneCookieValue(request.headers.get('cookie') ?? '')}
          >
            <ServerRouter context={entryContext} nonce={contentSecurityPolicyNonce} url={request.url} />
          </IntlProvider>
        </ContentSecurityPolicyNonceProvider>
      </StrictMode>,
      {
        nonce: contentSecurityPolicyNonce,
        [isbot(request.headers.get('user-agent')) || entryContext.isSpaMode ? 'onAllReady' : 'onShellReady']() {
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeout)

              timeout = undefined

              callback()
            },
          })

          headers.set('content-type', 'text/html')

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers,
              status: hasHandledError ? status500Code : responseStatusCode,
            }),
          )

          pipe(body)
        },
        onShellError(error) {
          handleError(error)

          reject(asError(error))
        },
        onError(error) {
          hasHandledError = true

          handleError(error)
        },
      },
    )
  })
}
