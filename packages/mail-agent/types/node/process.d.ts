declare module 'process' {
  global {
    namespace NodeJS {
      // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
      interface ProcessEnv {
        readonly GIT_COMMIT_REFERENCE?: string
        readonly GIT_COMMIT_HASH?: string
        readonly GIT_COMMIT_TIMESTAMP?: string
        readonly NODE_ENV?: string
        readonly LOG_LEVEL?: string
      }
    }
  }
}
