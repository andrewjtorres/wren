import { type HasDefault, type NotNull, isNotNull, sql } from 'drizzle-orm'
import {
  type SQLiteTextBuilder,
  type SQLiteTimestampBuilder,
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

type IdMixin = {
  id: HasDefault<NotNull<SQLiteTextBuilder<[string, ...string[]]>>>
}

const idMixin: IdMixin = {
  id: text('id', {
    mode: 'text',
  })
    .notNull()
    .default(sql`(uuid_str(uuid7()))`),
}

type CreatedAtMixin = {
  createdAt: HasDefault<NotNull<SQLiteTimestampBuilder>>
}

const createdAtMixin: CreatedAtMixin = {
  createdAt: integer('created_at', {
    mode: 'timestamp_ms',
  })
    .notNull()
    .default(sql`(time_to_milli(time_now()))`),
}

type UpdatedAtMixin = {
  updatedAt: SQLiteTimestampBuilder
}

const updatedAtMixin: UpdatedAtMixin = {
  updatedAt: integer('updated_at', {
    mode: 'timestamp_ms',
  }),
}

type TimeMixin = CreatedAtMixin & UpdatedAtMixin

const timeMixin: TimeMixin = {
  ...createdAtMixin,
  ...updatedAtMixin,
}

// =============================================================================
// Graph
// =============================================================================

// Graphs
// ---------------------------------------------------------

export const graphs = sqliteTable(
  'graphs',
  {
    ...idMixin,
    name: text('name', {
      mode: 'text',
    }).notNull(),
    ...timeMixin,
  },
  (table) => [
    primaryKey({
      name: 'graphs_pkey',
      columns: [table.id],
    }),
    index('graphs_created_at_id_idx').on(table.createdAt, table.id),
    index('graphs_updated_at_id_idx').on(table.updatedAt, table.id).where(isNotNull(table.updatedAt)),
  ],
)

export type GraphQueryDatum = typeof graphs.$inferSelect

export type GraphMutationDatum = typeof graphs.$inferInsert

// Nodes
// ---------------------------------------------------------

export const nodes = sqliteTable(
  'nodes',
  {
    ...idMixin,
    label: text('label', {
      mode: 'text',
    }).notNull(),
    graphId: text('graph_id', {
      mode: 'text',
    }).notNull(),
    ...timeMixin,
  },
  (table) => [
    primaryKey({
      name: 'nodes_pkey',
      columns: [table.id],
    }),
    foreignKey({
      name: 'nodes_graph_id_fkey',
      columns: [table.graphId],
      foreignColumns: [graphs.id],
    }),
    index('nodes_graph_id_id_idx').on(table.graphId, table.id),
    index('nodes_created_at_id_idx').on(table.createdAt, table.id),
    index('nodes_updated_at_id_idx').on(table.updatedAt, table.id).where(isNotNull(table.updatedAt)),
  ],
)

export type NodeQueryDatum = typeof nodes.$inferSelect

export type NodeMutationDatum = typeof nodes.$inferInsert

export type Schema = typeof schema

export const schema = {
  graphs,
  nodes,
}
