import { flatRoutes } from '@react-router/fs-routes'

const config = flatRoutes({
  ignoredRouteFiles: [
    '**/snapshots/**/*',
    '**/?(*.)@(end-to-end|integration|unit).test.[jt]s',
    '**/?(*.)@(stories|@(component|visual-regression).test).[jt]s?(x)',
    '**/.*',
  ],
})

export default config
