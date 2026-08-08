import { customAlphabet } from 'nanoid'
import type { IntRange } from 'type-fest'

export type Length = IntRange<2, 256>

// Approximately ~66 billion years or ~574,558 trillion IDs are needed to have a
// 1% probability of at least one collision.
const baseCreateSafeAlphanumericLowercaseId = customAlphabet('bcdfghjklmnpqrstvwxz2456789', 26)

export function createSafeAlphanumericLowercaseId(length?: Length): string {
  return baseCreateSafeAlphanumericLowercaseId(length)
}
