export function isResponse(value: unknown): value is Response {
  return (
    value != undefined &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'body' in value &&
    (value.body instanceof ReadableStream || value.body === null) &&
    'headers' in value &&
    value.headers instanceof Headers &&
    'status' in value &&
    typeof value.status === 'number' &&
    'statusText' in value &&
    typeof value.statusText === 'string'
  )
}
