import type { Config } from '@react-router/dev/config'

const config: Config = {
  appDirectory: 'src',
  ssr: true,
  buildDirectory: 'dist',
  serverModuleFormat: 'esm',
  // NOTE: This config should match the future config declared in the
  // decorator.tsx and the render.tsx files located in the src/utils
  // directory of the project.
  future: {
    unstable_enableNodeReadableStream: false,
    unstable_optimizeDeps: false,
  },
}

export default config
