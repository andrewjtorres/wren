declare module 'process' {
  global {
    namespace NodeJS {
      // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
      interface ProcessEnv {
        readonly CI?: string
        readonly LOCAL?: string
        readonly PORTAL_URL?: string
      }
    }
  }
}
