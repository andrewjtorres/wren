import { expect, inject, test } from 'vitest'
import { page } from 'vitest/browser'

import { renderWithRouter } from '#src/utils/render.browser.tsx'
import Route from './($lang)._index.tsx'

const isContinuousIntegrationEnvironment = inject('isContinuousIntegrationEnvironment')

test(
  'should render the root index route in english',
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
          Component: Route,
        },
      ],
    })

    await expect.element(page.getByTestId('2r85lcpfl9')).toBeVisible()
    await expect(page).toMatchScreenshot()
  },
)

test(
  'should render the root index route in spanish',
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
          Component: Route,
        },
      ],
    })

    await expect.element(page.getByTestId('2r85lcpfl9')).toBeVisible()
    await expect(page).toMatchScreenshot()
  },
)
