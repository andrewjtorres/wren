import { type BinaryOperator, type SQLWrapper, bindIfParam, sql } from 'drizzle-orm'

// eslint-disable-next-line unicorn/consistent-boolean-name
export const isDistinctFrom: BinaryOperator = (left: SQLWrapper, right: unknown) => {
  return sql`${left} is distinct from ${bindIfParam(right, left)}`
}

// eslint-disable-next-line unicorn/consistent-boolean-name
export const isNotDistinctFrom: BinaryOperator = (left: SQLWrapper, right: unknown) => {
  return sql`${left} is not distinct from ${bindIfParam(right, left)}`
}
