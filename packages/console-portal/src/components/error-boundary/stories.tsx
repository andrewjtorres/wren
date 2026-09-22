import { withRouter } from '#src/utils/decorator.tsx'
import { isSupportedLanguageTag } from '#src/utils/i18n.ts'
import preview from '#.storybook/preview.ts'
import { ErrorBoundary, NotFoundErrorHandler } from './index.tsx'

const meta = preview.meta({
  title: 'Status/Error Boundary',
  component: ErrorBoundary,
  decorators: [
    (Story) => (
      <div className="flex min-h-full flex-col overflow-x-hidden">
        <Story />
      </div>
    ),
  ],
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
})

export const Default = meta.story({
  name: 'Default',
  decorators: [
    (Story, { globals: { locale } }) => {
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
            ErrorBoundary: Story,
          },
        ],
      })
    },
  ],
})

export const GenericError = meta.story({
  name: 'Error',
  decorators: [
    (Story, { globals: { locale } }) => {
      return withRouter({
        ...(isSupportedLanguageTag(locale) && {
          locale: locale,
        }),
        initialEntries: ['/'],
        routes: [
          {
            path: '/',
            loader() {
              throw new Error('something went wrong')
            },
            ErrorBoundary: Story,
          },
        ],
      })
    },
  ],
})

export const NotFound = meta.story({
  name: '404 Not Found',
  decorators: [
    (Story, { globals: { locale } }) => {
      return withRouter({
        ...(isSupportedLanguageTag(locale) && {
          locale: locale,
        }),
        initialEntries: ['/not-found'],
        routes: [
          {
            path: '/',
            ErrorBoundary: Story,
          },
        ],
      })
    },
  ],
  args: {
    errorResponseHandlers: {
      404: NotFoundErrorHandler,
    },
  },
})

export default meta
