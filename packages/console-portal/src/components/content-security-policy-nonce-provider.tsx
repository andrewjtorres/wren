import { type JSX, type ReactNode, createContext, use } from 'react'

import { GenericError } from '#src/error.ts'

export type ContentSecurityPolicyNonceProviderProps = {
  nonce: string
  children: ReactNode
}

const ContentSecurityPolicyNonceContext = createContext('')

export function useContentSecurityPolicyNonce(): string {
  return use(ContentSecurityPolicyNonceContext)
}

export function ContentSecurityPolicyNonceProvider({
  nonce,
  children,
}: ContentSecurityPolicyNonceProviderProps): JSX.Element {
  if (typeof document !== 'undefined') {
    throw new GenericError('ContentSecurityPolicyNonceProvider is not supported on the browser')
  }

  return <ContentSecurityPolicyNonceContext value={nonce}>{children}</ContentSecurityPolicyNonceContext>
}
