import { expect, inject, test } from 'vitest'
import { page } from 'vitest/browser'

import { renderWithRouter } from '#src/utils/render.browser.tsx'
import { ErrorBoundary, NotFoundErrorHandler } from './index.tsx'

const isContinuousIntegrationEnvironment = inject('isContinuousIntegrationEnvironment')

test(
  'should render the output from the default error response handler in english',
  {
    skip: !isContinuousIntegrationEnvironment,
  },
  async () => {
    await renderWithRouter({
      locale: 'en',
      initialEntries: ['/en'],
      routes: [
        {
          path: '/en',
          loader() {
            throw new Response(undefined, {
              status: 418,
              statusText: "I'm a teapot",
            })
          },
          ErrorBoundary() {
            return (
              <div className="flex min-h-screen flex-col overflow-x-hidden" data-testid="v4wh9lmht2">
                <ErrorBoundary />
              </div>
            )
          },
        },
      ],
    })

    await expect.element(page.getByTestId('v4wh9lmht2')).toBeVisible()
    await expect(page).toMatchScreenshot()
  },
)

test(
  'should render the output from the error handler in english',
  {
    skip: !isContinuousIntegrationEnvironment,
  },
  async () => {
    await renderWithRouter({
      locale: 'en',
      initialEntries: ['/en'],
      routes: [
        {
          path: '/en',
          loader() {
            throw new Error('something went wrong')
          },
          ErrorBoundary() {
            return (
              <div className="flex min-h-screen flex-col overflow-x-hidden" data-testid="4d9w9fpfbq">
                <ErrorBoundary />
              </div>
            )
          },
        },
      ],
    })

    await expect.element(page.getByTestId('4d9w9fpfbq')).toBeVisible()
    await expect(page).toMatchScreenshot()
  },
)

test(
  'should render the output from the associated error response handler in english',
  {
    skip: !isContinuousIntegrationEnvironment,
  },
  async () => {
    await renderWithRouter({
      locale: 'en',
      initialEntries: ['/en/not-found'],
      routes: [
        {
          path: '/en',
          ErrorBoundary() {
            return (
              <div className="flex min-h-screen flex-col overflow-x-hidden" data-testid="r696xrgj4h">
                <ErrorBoundary
                  errorResponseHandlers={{
                    404: NotFoundErrorHandler,
                  }}
                />
              </div>
            )
          },
        },
      ],
    })

    await expect.element(page.getByTestId('r696xrgj4h')).toBeVisible()
    await expect(page).toMatchScreenshot()
  },
)

test(
  'should render the output from the default error response handler in spanish',
  {
    skip: !isContinuousIntegrationEnvironment,
  },
  async () => {
    await renderWithRouter({
      locale: 'es',
      initialEntries: ['/es'],
      routes: [
        {
          path: '/es',
          loader() {
            throw new Response(undefined, {
              status: 418,
              statusText: "I'm a teapot",
            })
          },
          ErrorBoundary() {
            return (
              <div className="flex min-h-screen flex-col overflow-x-hidden" data-testid="ng5rbsvzcz">
                <ErrorBoundary />
              </div>
            )
          },
        },
      ],
    })

    await expect.element(page.getByTestId('ng5rbsvzcz')).toBeVisible()
    await expect(page).toMatchScreenshot()
  },
)

test(
  'should render the output from the error handler in spanish',
  {
    skip: !isContinuousIntegrationEnvironment,
  },
  async () => {
    await renderWithRouter({
      locale: 'es',
      initialEntries: ['/es'],
      routes: [
        {
          path: '/es',
          loader() {
            throw new Error('something went wrong')
          },
          ErrorBoundary() {
            return (
              <div className="flex min-h-screen flex-col overflow-x-hidden" data-testid="wllsw7ccr6">
                <ErrorBoundary />
              </div>
            )
          },
        },
      ],
    })

    await expect.element(page.getByTestId('wllsw7ccr6')).toBeVisible()
    await expect(page).toMatchScreenshot()
  },
)

test(
  'should render the output from the associated error response handler in spanish',
  {
    skip: !isContinuousIntegrationEnvironment,
  },
  async () => {
    await renderWithRouter({
      locale: 'es',
      initialEntries: ['/es/not-found'],
      routes: [
        {
          path: '/es',
          ErrorBoundary() {
            return (
              <div className="flex min-h-screen flex-col overflow-x-hidden" data-testid="jzlsbjkgsj">
                <ErrorBoundary
                  errorResponseHandlers={{
                    404: NotFoundErrorHandler,
                  }}
                />
              </div>
            )
          },
        },
      ],
    })

    await expect.element(page.getByTestId('jzlsbjkgsj')).toBeVisible()
    await expect(page).toMatchScreenshot()
  },
)
