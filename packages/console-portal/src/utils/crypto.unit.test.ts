import { describe, expect, test } from 'vitest'

import { isTimingSafeEqual } from './crypto.ts'

describe('should return true if both values hold the same bytes', () => {
  test.each([
    {
      value: Uint8Array.from([]),
      other: Uint8Array.from([]),
    },
    {
      value: Uint8Array.from([4, 2]),
      other: Uint8Array.from([4, 2]),
    },
    {
      value: '',
      other: '',
    },
    {
      value: 'é',
      other: 'é',
    },
    {
      value: 'answer',
      other: 'answer',
    },
    {
      value: '42',
      other: Uint8Array.from([52, 50]),
    },
  ])('isTimingSafeEqual($value, $other) -> true', ({ value, other }) => {
    expect(isTimingSafeEqual(value, other)).toBeTruthy()
  })
})

describe('should return false if the values differ in content but not in byte length', () => {
  test.each([
    {
      value: Uint8Array.from([4, 2]),
      other: Uint8Array.from([4, 3]),
    },
    {
      value: 'answer',
      other: 'answeR',
    },
    {
      value: 'answer',
      other: 'rewsna',
    },
    {
      value: '42',
      other: Uint8Array.from([52, 51]),
    },
  ])('isTimingSafeEqual($value, $other) -> false', ({ value, other }) => {
    expect(isTimingSafeEqual(value, other)).toBeFalsy()
  })
})

describe('should return false rather than throw if the values differ in byte length', () => {
  test.each([
    {
      value: Uint8Array.from([]),
      other: Uint8Array.from([4, 2]),
    },
    {
      value: Uint8Array.from([4, 2]),
      other: Uint8Array.from([]),
    },
    {
      value: '',
      other: 'answer',
    },
    {
      value: 'answer',
      other: '',
    },
    {
      value: 'a',
      other: 'é',
    },
    {
      value: 'answer',
      other: 'answers',
    },
  ])('isTimingSafeEqual($value, $other) -> false', ({ value, other }) => {
    expect(() => isTimingSafeEqual(value, other)).not.toThrow()
    expect(isTimingSafeEqual(value, other)).toBeFalsy()
  })
})
