import { describe, expect, test } from 'vitest'

import { isTimingSafeEqual } from './crypto.ts'

describe('should return true if both values hold the same bytes; otherwise, return false', () => {
  test.each([
    {
      value: Uint8Array.from([4, 2]),
      other: Uint8Array.from([4, 3]),
      expected: false,
    },
    {
      value: 'answer',
      other: 'answeR',
      expected: false,
    },
    {
      value: 'answer',
      other: 'rewsna',
      expected: false,
    },
    {
      value: '42',
      other: Uint8Array.from([52, 51]),
      expected: false,
    },
    {
      value: Uint8Array.from([]),
      other: Uint8Array.from([4, 2]),
      expected: false,
    },
    {
      value: Uint8Array.from([4, 2]),
      other: Uint8Array.from([]),
      expected: false,
    },
    {
      value: '',
      other: 'answer',
      expected: false,
    },
    {
      value: 'answer',
      other: '',
      expected: false,
    },
    {
      value: 'a',
      other: 'é',
      expected: false,
    },
    {
      value: 'answer',
      other: 'answers',
      expected: false,
    },
    {
      value: Uint8Array.from([]),
      other: Uint8Array.from([]),
      expected: true,
    },
    {
      value: Uint8Array.from([4, 2]),
      other: Uint8Array.from([4, 2]),
      expected: true,
    },
    {
      value: '',
      other: '',
      expected: true,
    },
    {
      value: 'é',
      other: 'é',
      expected: true,
    },
    {
      value: 'answer',
      other: 'answer',
      expected: true,
    },
    {
      value: '42',
      other: Uint8Array.from([52, 50]),
      expected: true,
    },
  ])('isTimingSafeEqual($value, $other) -> $expected', ({ value, other, expected }) => {
    expect(() => isTimingSafeEqual(value, other)).not.toThrow()
    expect(isTimingSafeEqual(value, other)).toBe(expected)
  })
})
