import type { StorybookConfig } from '@storybook/react-vite'
import type { Messages, SupportedLanguageTag } from 'react-intl'
import { mergeConfig } from 'vite'

import { debug, i18nDefaultLanguageTag } from '#src/config.ts'
import enTranslations from '#src/i18n/en.json' with { type: 'json' }
import esTranslations from '#src/i18n/es.json' with { type: 'json' }

function getTranslations(languageTag: SupportedLanguageTag): Messages {
  switch (languageTag) {
    case 'en': {
      return enTranslations
    }
    case 'es': {
      return esTranslations
    }
  }
}

const windowMetaEnv: WindowMetaEnv = {
  I18N_DEFAULT_LANGUAGE_TAG: i18nDefaultLanguageTag,
  DEBUG: debug,
}

const windowMetaI18n: WindowMetaI18n = {
  languageTag: i18nDefaultLanguageTag,
  translations: getTranslations(i18nDefaultLanguageTag),
}

const config: StorybookConfig = {
  stories: ['../src/**/?(*.)stories.[jt]s?(x)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@storybook/addon-vitest',
    'storybook-i18n',
  ],
  features: {
    disallowImplicitActionsInRenderV8: true,
  },
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
      strictMode: true,
    },
  },
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      tsconfigPath: 'config/typescript/tsconfig.storybook.json',
    },
  },
  docs: {
    defaultName: 'Documentation',
  },
  previewHead(head = '') {
    return `
      ${head}
      <style>
        html,body,.sb-main-fullscreen > #storybook-root{height:100%}
      </style>
      <script>
        window.meta={env:${JSON.stringify(windowMetaEnv)},i18n:${JSON.stringify(windowMetaI18n)},buildInfo(){}},${windowMetaEnv.DEBUG ? `localStorage.setItem("debug",${JSON.stringify(windowMetaEnv.DEBUG)})` : 'localStorage.removeItem("debug")'};
      </script>
    `
  },
  viteFinal(config, options) {
    if (options.configType === 'DEVELOPMENT' && options.host !== '127.0.0.1') {
      throw new Error('@wren/console-portal listeners must bind to 127.0.0.1; pass --host=127.0.0.1 or run "yarn studio"') // prettier-ignore
    }

    return mergeConfig(config, {
      build: {
        target: 'es2025',
        chunkSizeWarningLimit: 1000,
      },
    })
  },
}

export default config
