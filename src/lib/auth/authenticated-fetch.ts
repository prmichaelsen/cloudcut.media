import { getIdToken } from './firebase-client'

/**
 * Wrapper around fetch that automatically includes the Firebase ID token
 * in the Authorization header for authenticated API requests.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = await getIdToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return fetch(input, { ...init, headers })
}
