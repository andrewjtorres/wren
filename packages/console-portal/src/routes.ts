import { flatRoutes } from '@react-router/fs-routes'

const config = flatRoutes({
  ignoredRouteFiles: ['**/snapshots/**/*', '**/?(*.)@(stories|@(component|end-to-end|unit).test).[jt]s?(x)', '**/.*'],
})

export default config
