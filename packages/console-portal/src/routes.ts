import { flatRoutes } from '@react-router/fs-routes'

const config = flatRoutes({
  ignoredRouteFiles: [
    '**/snapshots/**/*',
    '**/?(*.)@(component|end-to-end|integration).test.[jt]s',
    '**/?(*.)@(stories|unit.test).[jt]s?(x)',
    '**/.*',
  ],
})

export default config
