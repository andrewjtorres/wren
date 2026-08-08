import { asError } from '@wren/common/error'
import type { JSX } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { type ErrorResponse, type Params, isRouteErrorResponse, useParams, useRouteError } from 'react-router'

export type ErrorHandler = (error: Error) => JSX.Element | undefined

export type ErrorResponseHandler = (error: ErrorResponse, params: Params) => JSX.Element | undefined

export type ErrorResponseHandlers = Record<number, ErrorResponseHandler>

export type ErrorBoundaryProps = {
  defaultErrorResponseHandler?: ErrorResponseHandler
  errorHandler?: ErrorHandler
  errorResponseHandlers?: ErrorResponseHandlers
}

const defaultErrorHandlerMessages = defineMessages({
  title: {
    id: 'TDc0yu4YI3',
    description: 'Default error handler title',
    defaultMessage: 'Error',
  },
  description: {
    id: 'ZoA5ElZ83H',
    description: 'Default error handler description',
    defaultMessage: 'Something went wrong! Please try again later.',
  },
})

function DefaultErrorHandler(): JSX.Element {
  const intl = useIntl()

  return (
    <div
      className="bg-red-9 text-red-contrast selection:bg-red-7 selection:text-red-12 flex flex-1 flex-col justify-center"
      data-testid="9q2qd6swms"
    >
      <div className="text-center leading-none">
        <h1 className="text-[25vw]">{intl.formatMessage(defaultErrorHandlerMessages.title)}</h1>
        <div className="text-3xl">{intl.formatMessage(defaultErrorHandlerMessages.description)}</div>
      </div>
    </div>
  )
}

export function ErrorBoundary({
  defaultErrorResponseHandler = DefaultErrorHandler,
  errorHandler = DefaultErrorHandler,
  errorResponseHandlers = {},
}: ErrorBoundaryProps): JSX.Element | undefined {
  const error = useRouteError()
  const params = useParams()

  return isRouteErrorResponse(error)
    ? (errorResponseHandlers[error.status] ?? defaultErrorResponseHandler)(error, params)
    : errorHandler(asError(error))
}
