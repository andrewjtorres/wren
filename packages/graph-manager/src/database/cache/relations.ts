import { defineRelations } from 'drizzle-orm'

import { schema } from './schema.ts'

export type Relations = typeof relations

export const relations = defineRelations(schema, (helpers) => ({
  // ===========================================================================
  // Graph
  // ===========================================================================

  // Graphs
  // -------------------------------------------------------

  graphs: {
    nodes: helpers.many.nodes(),
  },

  // Nodes
  // -------------------------------------------------------

  nodes: {
    graph: helpers.one.graphs({
      from: helpers.nodes.graphId,
      to: helpers.graphs.id,
    }),
  },
}))
