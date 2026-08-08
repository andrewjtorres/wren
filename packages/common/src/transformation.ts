import {
  type NonZeroValueBigInt,
  type NonZeroValueBoolean,
  type NonZeroValueNumber,
  type NonZeroValueString,
  isNonZeroValueBigInt,
  isNonZeroValueBoolean,
  isNonZeroValueNumber,
  isNonZeroValueString,
} from './validation.ts'

const booleanPattern = /^(?:1|enabled|on|true|y|yes)$/i

export function zeroValueBigIntToUndefined<TValue extends bigint>(
  value: TValue,
): NonZeroValueBigInt<TValue> | undefined {
  return isNonZeroValueBigInt(value) ? value : undefined
}

export function undefinedOrZeroValueBigIntToNull<TValue extends bigint>(
  value: TValue | undefined,
): NonZeroValueBigInt<TValue> | null {
  return value !== undefined && isNonZeroValueBigInt(value) ? value : null // eslint-disable-line unicorn/no-null
}

export function zeroValueBigIntToNull<TValue extends bigint>(value: TValue): NonZeroValueBigInt<TValue> | null {
  return isNonZeroValueBigInt(value) ? value : null // eslint-disable-line unicorn/no-null
}

export function zeroValueBooleanToUndefined<TValue extends boolean>(
  value: TValue,
): NonZeroValueBoolean<TValue> | undefined {
  return isNonZeroValueBoolean(value) ? value : undefined
}

export function undefinedOrZeroValueBooleanToNull<TValue extends boolean>(
  value: TValue | undefined,
): NonZeroValueBoolean<TValue> | null {
  return value !== undefined && isNonZeroValueBoolean(value) ? value : null // eslint-disable-line unicorn/no-null
}

export function zeroValueBooleanToNull<TValue extends boolean>(value: TValue): NonZeroValueBoolean<TValue> | null {
  return isNonZeroValueBoolean(value) ? value : null // eslint-disable-line unicorn/no-null
}

export function zeroValueNumberToUndefined<TValue extends number>(
  value: TValue,
): NonZeroValueNumber<TValue> | undefined {
  return isNonZeroValueNumber(value) ? value : undefined
}

export function undefinedOrZeroValueNumberToNull<TValue extends number>(
  value: TValue | undefined,
): NonZeroValueNumber<TValue> | null {
  return value !== undefined && isNonZeroValueNumber(value) ? value : null // eslint-disable-line unicorn/no-null
}

export function zeroValueNumberToNull<TValue extends number>(value: TValue): NonZeroValueNumber<TValue> | null {
  return isNonZeroValueNumber(value) ? value : null // eslint-disable-line unicorn/no-null
}

export function zeroValueStringToUndefined<TValue extends string>(
  value: TValue,
): NonZeroValueString<TValue> | undefined {
  return isNonZeroValueString(value) ? value : undefined
}

export function undefinedOrZeroValueStringToNull<TValue extends string>(
  value: TValue | undefined,
): NonZeroValueString<TValue> | null {
  return value !== undefined && isNonZeroValueString(value) ? value : null // eslint-disable-line unicorn/no-null
}

export function zeroValueStringToNull<TValue extends string>(value: TValue): NonZeroValueString<TValue> | null {
  return isNonZeroValueString(value) ? value : null // eslint-disable-line unicorn/no-null
}

export function nullToUndefined<TValue>(value: TValue): NonNullable<TValue> | undefined {
  return value ?? undefined
}

// eslint-disable-next-line unicorn/consistent-boolean-name
export function stringToBoolean(value: string): boolean {
  return booleanPattern.test(value)
}
