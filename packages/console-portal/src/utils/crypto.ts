import { timingSafeEqual } from 'node:crypto'

export function isTimingSafeEqual(value: Uint8Array | string, other: Uint8Array | string): boolean {
  const valueBuffer = Buffer.from(value)
  const otherBuffer = Buffer.from(other)

  return valueBuffer.byteLength === otherBuffer.byteLength && timingSafeEqual(valueBuffer, otherBuffer)
}
