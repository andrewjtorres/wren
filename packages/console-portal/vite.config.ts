import formatjsPlugin from '@formatjs/unplugin/vite'
import { reactRouter as reactRouterPlugin } from '@react-router/dev/vite'
import tailwindcssPlugin from '@tailwindcss/vite'
import reactPlugin from '@vitejs/plugin-react'
import { argv } from 'node:process'
import { fileURLToPath } from 'node:url'
import { replacePlugin } from 'rolldown/plugins'
import { type Plugin, defineConfig, loadEnv, perEnvironmentPlugin } from 'vite'

const packageDirUrl = new URL('.', import.meta.url)

const packageDirPath = fileURLToPath(packageDirUrl)

const isAllPluginsDisabled = /(?:\.bin|node_modules)\/vite/i.test(argv[1] ?? '') && /^preview$/i.test(argv[2] ?? '')
const isReactPluginEnabled = !isAllPluginsDisabled && /(?:\.bin|node_modules)\/(?:storybook|vitest)/i.test(argv[1] ?? '') // prettier-ignore
const isReactRouterPluginEnabled = !isAllPluginsDisabled && !isReactPluginEnabled

function stringify(value: string | undefined): string {
  return JSON.stringify(value ?? '')
}

function assertHostPlugin(host: string): Plugin {
  return {
    name: 'wren-console-portal:assert-host',
    configResolved(config) {
      if (
        (config.server.host !== undefined && config.server.host !== host) ||
        (config.server.hmr !== false && config.server.ws !== false && config.server.ws?.host !== host) ||
        (config.preview.host !== undefined && config.preview.host !== host)
      ) {
        throw new Error(`@wren/console-portal listeners must bind to ${host}`)
      }
    },
  }
}

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, packageDirPath, '')

  return {
    build: {
      target: 'es2025',
      emptyOutDir: false,
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@formatjs/icu-messageformat-parser': '@formatjs/icu-messageformat-parser/no-parser.js',
      },
    },
    root: packageDirPath,
    plugins: [
      assertHostPlugin('127.0.0.1'),
      perEnvironmentPlugin('wren-console-portal:replace-server-environment', (environment) => {
        if (environment.name !== 'ssr') {
          return false
        }

        return replacePlugin(
          {
            'env.NODE_ENV': stringify(env['NODE_ENV'] ?? 'production'),
          },
          {
            preventAssignment: true,
          },
        )
      }),
      formatjsPlugin({
        idInterpolationPattern: '[sha512:contenthash:base64:10]',
        removeDefaultMessage: true,
        ast: true,
      }),
      tailwindcssPlugin(),
      isReactPluginEnabled && reactPlugin(),
      isReactRouterPluginEnabled && reactRouterPlugin(),
    ],
    server: {
      host: '127.0.0.1',
      ws: {
        host: '127.0.0.1',
        port: env['SERVER_WS_PORT'] ? Number(env['SERVER_WS_PORT']) : 24_678,
      },
    },
    preview: {
      host: '127.0.0.1',
    },
    environments: {
      ssr: {
        build: {
          rollupOptions: {
            input: 'src/index.ts',
          },
        },
      },
    },
  }
})

export default config
