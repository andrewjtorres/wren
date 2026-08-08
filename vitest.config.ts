import { defineConfig } from 'vitest/config'

const config = defineConfig({
  test: {
    projects: ['config/vitest/vitest.config.unit.ts'],
  },
})

export default config
