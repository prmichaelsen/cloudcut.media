// Server-side Firebase ID token verification using jose
// Works in Cloudflare Workers without Node.js-specific dependencies
import { createRemoteJWKSet, jwtVerify } from 'jose'

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
const FIREBASE_ISSUER_PREFIX = 'https://securetoken.google.com/'

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null

function getJWKS() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL))
  }
  return jwks
}

export interface VerifiedUser {
  uid: string
  email: string | null
  name: string | null
  picture: string | null
  emailVerified: boolean
}

export async function verifyFirebaseToken(
  idToken: string,
  projectId: string,
): Promise<VerifiedUser | null> {
  try {
    const { payload } = await jwtVerify(idToken, getJWKS(), {
      issuer: `${FIREBASE_ISSUER_PREFIX}${projectId}`,
      audience: projectId,
    })

    return {
      uid: payload.sub!,
      email: (payload.email as string) || null,
      name: (payload.name as string) || null,
      picture: (payload.picture as string) || null,
      emailVerified: (payload.email_verified as boolean) || false,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
