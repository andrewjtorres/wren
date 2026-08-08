import type { Database } from '@tursodatabase/database'
import type { TursoDatabaseDatabase } from 'drizzle-orm/tursodatabase'

import type { Relations } from './relations.ts'

export * from './relations.ts'
export * from './schema.ts'

export type DatabaseClient<TClient extends Database = Database> = TursoDatabaseDatabase<Relations> & {
  $client: TClient
}
