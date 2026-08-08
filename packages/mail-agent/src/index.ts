import { env } from 'node:process'

import { logLevel } from './config.ts'
import { createLogger } from './utils/log.ts'

export function main(): void {
  const logger = createLogger({
    level: logLevel,
  })

  logger.info({
    message: 'Build information',
    info: {
      gitCommitReference: env.GIT_COMMIT_REFERENCE,
      gitCommitHash: env.GIT_COMMIT_HASH,
      gitCommitTimestamp: env.GIT_COMMIT_TIMESTAMP,
    },
  })

  logger.info({
    message: 'Active configuration',
    config: {
      logLevel,
    },
  })
}

main() // eslint-disable-line unicorn/no-top-level-side-effects
