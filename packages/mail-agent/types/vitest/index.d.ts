import 'vitest'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ProvidedContext {
    isContinuousIntegrationEnvironment: boolean
  }
}
