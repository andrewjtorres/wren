import type { Preview } from '@storybook/react-vite'

import { i18nDefaultLanguageTag } from '#src/config.ts'

import '#src/styles/font.css'
import '#src/styles/tailwind.css'

const colorControlMatcherPattern = /(?:background|color)$/i
const dateControlMatcherPattern = /date$/i

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: colorControlMatcherPattern,
        date: dateControlMatcherPattern,
      },
    },
  },
  initialGlobals: {
    locale: i18nDefaultLanguageTag,
    locales: {
      en: {
        title: 'English',
      },
      es: {
        title: 'Español',
      },
    },
  },
}

export default preview
