import { afterEach, vi } from 'vitest'

if (typeof document !== 'undefined') {
  const { cleanup } = await import('@testing-library/react')
  await import('@testing-library/jest-dom/vitest')

  const windowMeta: WindowMeta = {
    env: {},
    i18n: {},
    buildInfo() {}, // eslint-disable-line @typescript-eslint/no-empty-function
  }

  vi.stubGlobal('meta', windowMeta)

  afterEach(() => {
    cleanup()
  })
}
