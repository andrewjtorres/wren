declare module 'process' {
  global {
    namespace NodeJS {
      // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
      interface ProcessEnv {
        readonly LOCAL?: string
        readonly CI?: string
        readonly PLAYWRIGHT_HTML_REPORTER_HOST?: string
        readonly PORTAL_URL?: string
      }
    }
  }
}
