import { describe, expect, test } from 'vitest'

import {
  isEmptyObject,
  isNonZeroValueBigInt,
  isNonZeroValueBoolean,
  isNonZeroValueNumber,
  isNonZeroValueString,
  isUninitializedObject,
} from './validation.ts'

describe('should return true if the provided value is a non-zero value bigint; otherwise, return false', () => {
  test.each([
    {
      value: 0n,
      expected: false,
    },
    {
      value: 42n,
      expected: true,
    },
  ])('isNonZeroValueBigInt($value) -> $expected', ({ value, expected }) => {
    expect(isNonZeroValueBigInt(value)).toBe(expected)
  })
})

describe('should return true if the provided value is a non-zero value boolean; otherwise, return false', () => {
  test.each([
    {
      value: false,
      expected: false,
    },
    {
      value: true,
      expected: true,
    },
  ])('isNonZeroValueBoolean($value) -> $expected', ({ value, expected }) => {
    expect(isNonZeroValueBoolean(value)).toBe(expected)
  })
})

describe('should return true if the provided value is a non-zero value number; otherwise, return false', () => {
  test.each([
    {
      value: 0,
      expected: false,
    },
    {
      value: 42,
      expected: true,
    },
  ])('isNonZeroValueNumber($value) -> $expected', ({ value, expected }) => {
    expect(isNonZeroValueNumber(value)).toBe(expected)
  })
})

describe('should return true if the provided value is a non-zero value string; otherwise, return false', () => {
  test.each([
    {
      value: '',
      expected: false,
    },
    {
      value: 'forty-two',
      expected: true,
    },
  ])('isNonZeroValueString($value) -> $expected', ({ value, expected }) => {
    expect(isNonZeroValueString(value)).toBe(expected)
  })
})

describe('should return true if the provided value is an empty object; otherwise, return false', () => {
  test.each([
    {
      value: {
        data: undefined,
      },
      expected: false,
    },
    {
      value: {
        data: 42,
      },
      expected: false,
    },
    {
      value: {},
      expected: true,
    },
  ])('isEmptyObject($value) -> $expected', ({ value, expected }) => {
    expect(isEmptyObject(value)).toBe(expected)
  })
})

describe('should return true if the provided value is an uninitialized object; otherwise, return false', () => {
  test.each([
    {
      value: {
        data: 42,
      },
      expected: false,
    },
    {
      value: {},
      expected: true,
    },
    {
      value: {
        data: undefined,
      },
      expected: true,
    },
  ])('isUninitializedObject($value) -> $expected', ({ value, expected }) => {
    expect(isUninitializedObject(value)).toBe(expected)
  })
})
