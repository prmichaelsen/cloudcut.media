export { AuthProvider, useAuth } from './auth-context'
export { verifyFirebaseToken, extractBearerToken, type VerifiedUser } from './verify-token'
export { authenticatedFetch } from './authenticated-fetch'

// Client-only Firebase functions — lazily imported to avoid SSR initialization.
export const signOut = async () => {
  const mod = await import('./firebase-client')
  await mod.signOut()
  await fetch('/api/auth/logout', { method: 'POST' })
}
