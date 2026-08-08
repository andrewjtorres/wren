import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})

const windowMeta: WindowMeta = {
  env: {},
  i18n: {},
  buildInfo() {}, // eslint-disable-line @typescript-eslint/no-empty-function
}

vi.stubGlobal('meta', windowMeta)
