import { defineConfig } from 'vitest/config'

const config = defineConfig({
  test: {
    projects: ['config/vitest/vitest.config.@(integration|unit).ts'],
  },
})

export default config
