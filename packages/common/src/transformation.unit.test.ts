import { describe, expect, test } from 'vitest'

import {
  nullToUndefined,
  stringToBoolean,
  undefinedOrZeroValueBigIntToNull,
  undefinedOrZeroValueBooleanToNull,
  undefinedOrZeroValueNumberToNull,
  undefinedOrZeroValueStringToNull,
  zeroValueBigIntToNull,
  zeroValueBigIntToUndefined,
  zeroValueBooleanToNull,
  zeroValueBooleanToUndefined,
  zeroValueNumberToNull,
  zeroValueNumberToUndefined,
  zeroValueStringToNull,
  zeroValueStringToUndefined,
} from './transformation.ts'

describe('should return undefined if the provided value is a zero-value bigint; otherwise, return the provided value', () => {
  test.each([
    {
      value: 0n,
    },
  ])('zeroValueBigIntToUndefined($value) -> undefined', ({ value }) => {
    expect(zeroValueBigIntToUndefined(value)).toBeUndefined()
  })

  test.each([
    {
      value: 42n,
    },
  ])('zeroValueBigIntToUndefined($value) -> $value', ({ value }) => {
    expect(zeroValueBigIntToUndefined(value)).toBe(value)
  })
})

describe('should return null if the provided value is undefined or a zero-value bigint; otherwise, return the provided value', () => {
  test.each([
    {
      value: undefined,
    },
    {
      value: 0n,
    },
  ])('undefinedOrZeroValueBigIntToNull($value) -> null', ({ value }) => {
    expect(undefinedOrZeroValueBigIntToNull(value)).toBeNull()
  })

  test.each([
    {
      value: 42n,
    },
  ])('undefinedOrZeroValueBigIntToNull($value) -> $value', ({ value }) => {
    expect(undefinedOrZeroValueBigIntToNull(value)).toBe(value)
  })
})

describe('should return null if the provided value is a zero-value bigint; otherwise, return the provided value', () => {
  test.each([
    {
      value: 0n,
    },
  ])('zeroValueBigIntToNull($value) -> undefined', ({ value }) => {
    expect(zeroValueBigIntToNull(value)).toBeNull()
  })

  test.each([
    {
      value: 42n,
    },
  ])('zeroValueBigIntToNull($value) -> $value', ({ value }) => {
    expect(zeroValueBigIntToNull(value)).toBe(value)
  })
})

describe('should return undefined if the provided value is a zero-value boolean; otherwise, return the provided value', () => {
  test.each([
    {
      value: false,
    },
  ])('zeroValueBooleanToUndefined($value) -> undefined', ({ value }) => {
    expect(zeroValueBooleanToUndefined(value)).toBeUndefined()
  })

  test.each([
    {
      value: true,
    },
  ])('zeroValueBooleanToUndefined($value) -> $value', ({ value }) => {
    expect(zeroValueBooleanToUndefined(value)).toBe(value)
  })
})

describe('should return null if the provided value is undefined or a zero-value boolean; otherwise, return the provided value', () => {
  test.each([
    {
      value: undefined,
    },
    {
      value: false,
    },
  ])('undefinedOrZeroValueBooleanToNull($value) -> null', ({ value }) => {
    expect(undefinedOrZeroValueBooleanToNull(value)).toBeNull()
  })

  test.each([
    {
      value: true,
    },
  ])('undefinedOrZeroValueBooleanToNull($value) -> $value', ({ value }) => {
    expect(undefinedOrZeroValueBooleanToNull(value)).toBe(value)
  })
})

describe('should return null if the provided value is a zero-value boolean; otherwise, return the provided value', () => {
  test.each([
    {
      value: false,
    },
  ])('zeroValueBooleanToNull($value) -> undefined', ({ value }) => {
    expect(zeroValueBooleanToNull(value)).toBeNull()
  })

  test.each([
    {
      value: true,
    },
  ])('zeroValueBooleanToNull($value) -> $value', ({ value }) => {
    expect(zeroValueBooleanToNull(value)).toBe(value)
  })
})

describe('should return undefined if the provided value is a zero-value number; otherwise, return the provided value', () => {
  test.each([
    {
      value: 0,
    },
  ])('zeroValueNumberToUndefined($value) -> undefined', ({ value }) => {
    expect(zeroValueNumberToUndefined(value)).toBeUndefined()
  })

  test.each([
    {
      value: 42,
    },
  ])('zeroValueNumberToUndefined($value) -> $value', ({ value }) => {
    expect(zeroValueNumberToUndefined(value)).toBe(value)
  })
})

describe('should return null if the provided value is undefined or a zero-value number; otherwise, return the provided value', () => {
  test.each([
    {
      value: undefined,
    },
    {
      value: 0,
    },
  ])('undefinedOrZeroValueNumberToNull($value) -> null', ({ value }) => {
    expect(undefinedOrZeroValueNumberToNull(value)).toBeNull()
  })

  test.each([
    {
      value: 42,
    },
  ])('undefinedOrZeroValueNumberToNull($value) -> $value', ({ value }) => {
    expect(undefinedOrZeroValueNumberToNull(value)).toBe(value)
  })
})

describe('should return null if the provided value is a zero-value number; otherwise, return the provided value', () => {
  test.each([
    {
      value: 0,
    },
  ])('zeroValueNumberToNull($value) -> undefined', ({ value }) => {
    expect(zeroValueNumberToNull(value)).toBeNull()
  })

  test.each([
    {
      value: 42,
    },
  ])('zeroValueNumberToNull($value) -> $value', ({ value }) => {
    expect(zeroValueNumberToNull(value)).toBe(value)
  })
})

describe('should return undefined if the provided value is a zero-value string; otherwise, return the provided value', () => {
  test.each([
    {
      value: '',
    },
  ])('zeroValueStringToUndefined($value) -> undefined', ({ value }) => {
    expect(zeroValueStringToUndefined(value)).toBeUndefined()
  })

  test.each([
    {
      value: 'forty-two',
    },
  ])('zeroValueStringToUndefined($value) -> $value', ({ value }) => {
    expect(zeroValueStringToUndefined(value)).toBe(value)
  })
})

describe('should return null if the provided value is undefined or a zero-value string; otherwise, return the provided value', () => {
  test.each([
    {
      value: undefined,
    },
    {
      value: '',
    },
  ])('undefinedOrZeroValueStringToNull($value) -> null', ({ value }) => {
    expect(undefinedOrZeroValueStringToNull(value)).toBeNull()
  })

  test.each([
    {
      value: 'forty-two',
    },
  ])('undefinedOrZeroValueStringToNull($value) -> $value', ({ value }) => {
    expect(undefinedOrZeroValueStringToNull(value)).toBe(value)
  })
})

describe('should return null if the provided value is a zero-value string; otherwise, return the provided value', () => {
  test.each([
    {
      value: '',
    },
  ])('zeroValueStringToNull($value) -> undefined', ({ value }) => {
    expect(zeroValueStringToNull(value)).toBeNull()
  })

  test.each([
    {
      value: 'forty-two',
    },
  ])('zeroValueStringToNull($value) -> $value', ({ value }) => {
    expect(zeroValueStringToNull(value)).toBe(value)
  })
})

describe('should return undefined if the provided value is null; otherwise, return the provided value', () => {
  test.each([
    {
      value: null, // eslint-disable-line unicorn/no-null
    },
  ])('nullToUndefined($value) -> undefined', ({ value }) => {
    expect(nullToUndefined(value)).toBeUndefined() // eslint-disable-line @typescript-eslint/no-confusing-void-expression
  })

  test.each([
    {
      value: undefined,
    },
    {
      value: 0n,
    },
    {
      value: false,
    },
    {
      value: 0,
    },
    {
      value: '',
    },
    {
      value: [],
    },
    {
      value: {},
    },
  ])('nullToUndefined($value) -> $value', ({ value }) => {
    expect(nullToUndefined(value)).toBe(value)
  })
})

describe('should return false if the provided value is not a boolean string; otherwise, return true', () => {
  test.each([
    {
      value: 'bqzt2sg9nscn58p742j9xmzpbl',
    },
  ])('stringToBoolean($value) -> false', ({ value }) => {
    expect(stringToBoolean(value)).toBeFalsy()
  })

  test.each([
    {
      value: '1',
    },
    {
      value: 'enabled',
    },
    {
      value: 'on',
    },
    {
      value: 'true',
    },
    {
      value: 'y',
    },
    {
      value: 'YES',
    },
    {
      value: 'YeS',
    },
    {
      value: 'yEs',
    },
    {
      value: 'yes',
    },
  ])('stringToBoolean($value) -> true', ({ value }) => {
    expect(stringToBoolean(value)).toBeTruthy()
  })
})
