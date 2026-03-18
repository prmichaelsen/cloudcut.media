import {
  verifyIdToken,
  verifySessionCookie,
  createSessionCookie as createFirebaseSessionCookie,
} from '@prmichaelsen/firebase-admin-sdk-v8'

export interface SessionUser {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified: boolean
}

export interface ServerSession {
  user: SessionUser
}

function getSessionCookie(request: Request): string | undefined {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return undefined

    const cookies = cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.trim().split('=')
        acc[name] = value
        return acc
      },
      {} as Record<string, string>,
    )

    return cookies.session
  } catch {
    return undefined
  }
}

export async function getServerSession(request: Request): Promise<ServerSession | null> {
  try {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) return null

    // Try session cookie verification first, fall back to ID token
    let decodedToken
    try {
      decodedToken = await verifySessionCookie(sessionCookie)
    } catch {
      decodedToken = await verifyIdToken(sessionCookie)
    }

    const user: SessionUser = {
      uid: decodedToken.sub,
      email: decodedToken.email || null,
      displayName: decodedToken.name || null,
      emailVerified: decodedToken.email_verified || false,
    }

    return { user }
  } catch {
    return null
  }
}

export async function createSessionCookie(idToken: string): Promise<string> {
  const sessionCookie = await createFirebaseSessionCookie(idToken, {
    expiresIn: 60 * 60 * 24 * 14 * 1000, // 14 days
  })
  return sessionCookie
}
