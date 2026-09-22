import { afterEach, vi } from 'vitest'
import { cleanup } from 'vitest-browser-react/pure'

import '#src/styles/font.css'
import '#src/styles/tailwind.css'

const windowMeta: WindowMeta = {
  env: {},
  i18n: {},
  buildInfo() {}, // eslint-disable-line @typescript-eslint/no-empty-function
}

vi.stubGlobal('meta', windowMeta)

afterEach(async () => {
  await cleanup()
})
