import type { Meta, StoryObj } from '@storybook/react-vite'
import type { JSX } from 'react'

import { withRouter } from '#src/utils/decorator.tsx'
import { isSupportedLanguageTag } from '#src/utils/i18n.ts'
import { ErrorBoundary as ErrorBoundaryComponent } from './index.tsx'

export type ErrorBoundaryMeta = Meta<typeof ErrorBoundaryComponent>

export type ErrorBoundaryStory = StoryObj<ErrorBoundaryMeta>

const meta: ErrorBoundaryMeta = {
  title: 'Status/Error Boundary',
  component: ErrorBoundaryComponent,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    defaultErrorResponseHandler: {
      control: false,
    },
    errorHandler: {
      control: false,
    },
    errorResponseHandlers: {
      control: false,
    },
  },
}

export const ErrorBoundary: ErrorBoundaryStory = {
  decorators(BaseStory, { globals: { locale } }) {
    function Story(): JSX.Element {
      return (
        <div className="flex min-h-full flex-col overflow-x-hidden">
          <BaseStory />
        </div>
      )
    }

    return withRouter({
      ...(isSupportedLanguageTag(locale) && {
        locale: locale,
      }),
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
          Component: Story,
          ErrorBoundary: Story,
        },
      ],
    })
  },
}

export default meta
