export type NonZeroValueBigInt<TType> = TType extends 0n ? never : TType

export function isNonZeroValueBigInt<TValue extends bigint>(value: TValue): value is NonZeroValueBigInt<TValue> {
  return value !== 0n
}

export type NonZeroValueBoolean<TType> = TType extends false ? never : TType

export function isNonZeroValueBoolean<TValue extends boolean>(value: TValue): value is NonZeroValueBoolean<TValue> {
  return value
}

export type NonZeroValueNumber<TType> = TType extends 0 ? never : TType

export function isNonZeroValueNumber<TValue extends number>(value: TValue): value is NonZeroValueNumber<TValue> {
  return value !== 0
}

export type NonZeroValueString<TType> = TType extends '' ? never : TType

export function isNonZeroValueString<TValue extends string>(value: TValue): value is NonZeroValueString<TValue> {
  return value !== ''
}

export function isEmptyObject(value: Record<string, unknown>): value is Record<string, never> {
  return Object.keys(value).length === 0
}

export function isUninitializedObject(value: Record<string, unknown>): value is Record<string, undefined> {
  return Object.values(value).every((value) => value === undefined)
}
