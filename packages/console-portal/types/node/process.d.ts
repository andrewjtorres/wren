declare module 'process' {
  global {
    namespace NodeJS {
      // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
      interface ProcessEnv {
        readonly GIT_COMMIT_REFERENCE?: string
        readonly GIT_COMMIT_HASH?: string
        readonly GIT_COMMIT_TIMESTAMP?: string
        readonly NODE_ENV?: string
        readonly PORTAL_HTTP_PORT?: string
        readonly PORTAL_PROBE_PORT?: string
        readonly PORTAL_SHUTDOWN_TIMEOUT?: string
        readonly LOG_LEVEL?: string
        readonly I18N_DEFAULT_LANGUAGE_TAG?: string
        readonly CACHE_DATABASE_DSN?: string
        readonly CACHE_DATABASE_ENCRYPTION_ALGORITHM?: string
        readonly CACHE_DATABASE_ENCRYPTION_KEY?: string
        readonly STATE_DATABASE_DSN?: string
        readonly STATE_DATABASE_ENCRYPTION_ALGORITHM?: string
        readonly STATE_DATABASE_ENCRYPTION_KEY?: string
        readonly DEBUG?: string
      }
    }
  }
}
