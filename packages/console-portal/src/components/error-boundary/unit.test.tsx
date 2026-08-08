import { screen } from '@testing-library/react'
import type { JSX } from 'react'
import { expect, test } from 'vitest'

import { renderWithRouter } from '#src/utils/render.tsx'
import { ErrorBoundary } from './index.tsx'

test('should trigger the associated error response handler when an error response is encountered', async () => {
  renderWithRouter({
    initialEntries: ['/not-found'],
    routes: [
      {
        path: '/',
        Component() {
          return <div>root</div>
        },
        ErrorBoundary() {
          return (
            <ErrorBoundary
              defaultErrorResponseHandler={function DefaultErrorResponseHandler(): JSX.Element {
                return <div>default error response</div>
              }}
              errorHandler={function ErrorHandler(): JSX.Element {
                return <div>error</div>
              }}
              errorResponseHandlers={{
                404() {
                  return <div>404 error response</div>
                },
              }}
            />
          )
        },
      },
    ],
  })

  expect(await screen.findByText('404 error response')).toBeInTheDocument()
  expect(screen.queryByText('root')).not.toBeInTheDocument()
  expect(screen.queryByText('default error response')).not.toBeInTheDocument()
  expect(screen.queryByText('error')).not.toBeInTheDocument()
})

test('should trigger the default error response handler when an error response is encountered', async () => {
  renderWithRouter({
    initialEntries: ['/'],
    routes: [
      {
        path: '/',
        loader() {
          throw new Response(undefined, {
            status: 418,
            statusText: "I'm a teapot",
          })
        },
        Component() {
          return <div>root</div>
        },
        ErrorBoundary() {
          return (
            <ErrorBoundary
              defaultErrorResponseHandler={function DefaultErrorResponseHandler(): JSX.Element {
                return <div>default error response</div>
              }}
              errorHandler={function ErrorHandler(): JSX.Element {
                return <div>error</div>
              }}
              errorResponseHandlers={{
                404() {
                  return <div>404 error response</div>
                },
              }}
            />
          )
        },
      },
    ],
  })

  expect(await screen.findByText('default error response')).toBeInTheDocument()
  expect(screen.queryByText('root')).not.toBeInTheDocument()
  expect(screen.queryByText('404 error response')).not.toBeInTheDocument()
  expect(screen.queryByText('error')).not.toBeInTheDocument()
})

test('should trigger the error handler when an error is encountered', async () => {
  renderWithRouter({
    initialEntries: ['/'],
    routes: [
      {
        path: '/',
        loader() {
          throw new Error("I'm a teapot")
        },
        Component() {
          return <div>root</div>
        },
        ErrorBoundary() {
          return (
            <ErrorBoundary
              defaultErrorResponseHandler={function DefaultErrorResponseHandler(): JSX.Element {
                return <div>default error response</div>
              }}
              errorHandler={function ErrorHandler(): JSX.Element {
                return <div>error</div>
              }}
              errorResponseHandlers={{
                404() {
                  return <div>404 error response</div>
                },
              }}
            />
          )
        },
      },
    ],
  })

  expect(await screen.findByText('error')).toBeInTheDocument()
  expect(screen.queryByText('root')).not.toBeInTheDocument()
  expect(screen.queryByText('404 error response')).not.toBeInTheDocument()
  expect(screen.queryByText('default error response')).not.toBeInTheDocument()
})
