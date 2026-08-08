import { asError } from '@wren/common/error'
import type { ServerBuild } from 'react-router'
import { createServer } from 'vite'

import type * as IndexModule from './src/index.ts'

const server = await createServer({
  server: {
    middlewareMode: true,
  },
  appType: 'custom',
})

const { main } = (await server.ssrLoadModule('./src/index.ts')) as typeof IndexModule

await main({
  build() {
    return server.ssrLoadModule('virtual:react-router/server-build') as Promise<ServerBuild>
  },
  async interceptorMiddleware(context, next) {
    await new Promise<void>((resolve, reject) => {
      server.middlewares(context.env.incoming, context.env.outgoing, (error?: unknown) => {
        if (error) {
          reject(asError(error))
        } else {
          resolve()
        }
      })
    })

    if (!context.env.outgoing.writableEnded && !context.env.outgoing.headersSent) {
      await next()
    }
  },
  prepareError(error) {
    server.ssrFixStacktrace(error)
  },
})
