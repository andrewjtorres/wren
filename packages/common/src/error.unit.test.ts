import { describe, expect, test } from 'vitest'

import { asError } from './error.ts'

describe('should return the provided value if it is an error', () => {
  test.each([
    {
      value: new Error('forty-two'),
    },
  ])('asError(Error) -> Error', ({ value }) => {
    expect(asError(value)).toBe(value)
  })
})

describe('should return an error with a message property set to the provided value coerced to a string', () => {
  test.each([
    {
      value: 42n,
      expected: new Error('42'),
    },
    {
      value: 42,
      expected: new Error('42'),
    },
    {
      value: 'forty-two',
      expected: new Error('forty-two'),
    },
  ])('asError($value) -> Error', ({ value, expected }) => {
    expect(asError(value)).toEqual(expected)
  })
})
