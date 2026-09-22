import a11yAddon from '@storybook/addon-a11y'
import docsAddon from '@storybook/addon-docs'
import linksAddon from '@storybook/addon-links'
import { definePreview } from '@storybook/react-vite'
import i18nAddon from 'storybook-i18n'

import { i18nDefaultLanguageTag } from '#src/config.ts'

import '#src/styles/font.css'
import '#src/styles/tailwind.css'

const colorControlMatcherPattern = /(?:background|color)$/i
const dateControlMatcherPattern = /date$/i

const preview = definePreview({
  addons: [a11yAddon(), docsAddon(), linksAddon(), i18nAddon()],
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
})

export default preview
