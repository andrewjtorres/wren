export class GenericError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, {
      cause,
    })

    this.name = 'GenericError'
  }
}
