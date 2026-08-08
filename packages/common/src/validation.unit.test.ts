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
    },
  ])('isNonZeroValueBigInt($value) -> false', ({ value }) => {
    expect(isNonZeroValueBigInt(value)).toBeFalsy()
  })

  test.each([
    {
      value: 42n,
    },
  ])('isNonZeroValueBigInt($value) -> true', ({ value }) => {
    expect(isNonZeroValueBigInt(value)).toBeTruthy()
  })
})

describe('should return true if the provided value is a non-zero value boolean; otherwise, return false', () => {
  test.each([
    {
      value: false,
    },
  ])('isNonZeroValueBoolean($value) -> false', ({ value }) => {
    expect(isNonZeroValueBoolean(value)).toBeFalsy()
  })

  test.each([
    {
      value: true,
    },
  ])('isNonZeroValueBoolean($value) -> true', ({ value }) => {
    expect(isNonZeroValueBoolean(value)).toBeTruthy()
  })
})

describe('should return true if the provided value is a non-zero value number; otherwise, return false', () => {
  test.each([
    {
      value: 0,
    },
  ])('isNonZeroValueNumber($value) -> false', ({ value }) => {
    expect(isNonZeroValueNumber(value)).toBeFalsy()
  })

  test.each([
    {
      value: 42,
    },
  ])('isNonZeroValueNumber($value) -> true', ({ value }) => {
    expect(isNonZeroValueNumber(value)).toBeTruthy()
  })
})

describe('should return true if the provided value is a non-zero value string; otherwise, return false', () => {
  test.each([
    {
      value: '',
    },
  ])('isNonZeroValueString($value) -> false', ({ value }) => {
    expect(isNonZeroValueString(value)).toBeFalsy()
  })

  test.each([
    {
      value: 'forty-two',
    },
  ])('isNonZeroValueString($value) -> true', ({ value }) => {
    expect(isNonZeroValueString(value)).toBeTruthy()
  })
})

describe('should return true if the provided value is an empty object; otherwise, return false', () => {
  test.each([
    {
      value: {
        data: undefined,
      },
    },
    {
      value: {
        data: 42,
      },
    },
  ])('isEmptyObject($value) -> false', ({ value }) => {
    expect(isEmptyObject(value)).toBeFalsy()
  })

  test.each([
    {
      value: {},
    },
  ])('isEmptyObject($value) -> true', ({ value }) => {
    expect(isEmptyObject(value)).toBeTruthy()
  })
})

describe('should return true if the provided value is an uninitialized object; otherwise, return false', () => {
  test.each([
    {
      value: {
        data: 42,
      },
    },
  ])('isUninitializedObject($value) -> false', ({ value }) => {
    expect(isUninitializedObject(value)).toBeFalsy()
  })

  test.each([
    {
      value: {},
    },
    {
      value: {
        data: undefined,
      },
    },
  ])('isUninitializedObject($value) -> true', ({ value }) => {
    expect(isUninitializedObject(value)).toBeTruthy()
  })
})
