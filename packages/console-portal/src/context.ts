import type { DatabaseClient as CacheDatabaseClient } from '@wren/graph-manager/database/cache'
import type { DatabaseClient as StateDatabaseClient } from '@wren/graph-manager/database/state'
import type { Logger as PinoLogger } from 'pino'
import { createContext } from 'react-router'

export const loggerContext = createContext<PinoLogger | undefined>()

export const cacheDatabaseClientContext = createContext<CacheDatabaseClient | undefined>()

export const stateDatabaseClientContext = createContext<StateDatabaseClient | undefined>()

export const contentSecurityPolicyNonceContext = createContext<string | undefined>()
