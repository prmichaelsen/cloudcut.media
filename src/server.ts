/**
 * Cloudflare Workers Entry Point
 *
 * This file is referenced by wrangler.toml as the main entry point.
 * All /api/* routes require Firebase Auth (Bearer token in Authorization header).
 * Media is scoped per-user in R2: videos/{userId}/{timestamp}-{filename}
 */

import startServer from '@tanstack/react-start/server-entry'
import { verifyFirebaseToken, extractBearerToken, type VerifiedUser } from './lib/auth/verify-token'
import { initFirebaseAdmin } from './lib/firebase-admin'
import { createSessionCookie, getServerSession } from './lib/auth/session'
import { verifyIdToken } from '@prmichaelsen/firebase-admin-sdk-v8'

interface Env {
  MEDIA_BUCKET: R2Bucket
  FIREBASE_PROJECT_ID: string
  FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY: string
  ALLOWED_ORIGINS?: string
}

function corsHeaders(env: Env, request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || ''
  const allowed = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'https://cloudcut.media', 'https://cloudcut-media.pages.dev']

  // Allow any *.cloudcut-media.pages.dev subdomain (preview deployments)
  const isAllowed = allowed.includes(origin) || /^https:\/\/[a-z0-9]+\.cloudcut-media\.pages\.dev$/.test(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function jsonResponse(data: unknown, status: number, env: Env, request: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env, request) },
  })
}

async function authenticate(request: Request, env: Env): Promise<VerifiedUser | Response> {
  // 1. Try session cookie (persistent sessions)
  try {
    const cookieHeader = request.headers.get('cookie')
    console.log('[auth] cookie header:', cookieHeader ? `present (${cookieHeader.length} chars)` : 'missing')
    initFirebaseAdmin({
        serviceAccount: env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY,
        projectId: env.FIREBASE_PROJECT_ID,
      })
    const session = await getServerSession(request)
    console.log('[auth] session result:', session ? `uid=${session.user.uid}` : 'null')
    if (session?.user) {
      return { uid: session.user.uid, email: session.user.email, name: session.user.displayName, picture: null, emailVerified: session.user.emailVerified ?? false }
    }
  } catch (err) {
    console.error('[auth] session error:', err)
    // Fall through to token-based auth
  }

  // 2. Try Authorization header, then ?token= query param
  let token = extractBearerToken(request)
  if (!token) {
    const url = new URL(request.url)
    token = url.searchParams.get('token')
  }

  if (!token) {
    return jsonResponse({ error: 'Missing Authorization' }, 401, env, request)
  }

  const user = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID)
  if (!user) {
    return jsonResponse({ error: 'Invalid or expired token' }, 401, env, request)
  }

  return user
}

export default {
  async fetch(request: Request, env: Env, ctx: any) {
    const url = new URL(request.url)

    // Handle CORS preflight for all /api/* routes
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) })
    }

    // --- Auth session endpoints ---

    // Create session cookie from Firebase ID token
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      try {
        console.log('[auth/login] Creating session...')
        initFirebaseAdmin({
        serviceAccount: env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY,
        projectId: env.FIREBASE_PROJECT_ID,
      })
        const body = (await request.json()) as { idToken?: string }
        const { idToken } = body

        if (!idToken) {
          console.log('[auth/login] Missing idToken in request body')
          return jsonResponse({ error: 'Missing idToken' }, 400, env, request)
        }

        console.log('[auth/login] Got idToken, creating session cookie...')
        const sessionCookie = await createSessionCookie(idToken)
        console.log('[auth/login] Session cookie created, length:', sessionCookie.length)

        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
        const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)
        const cookieAttrs = isLocalhost || isIPAddress
          ? `session=${sessionCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600`
          : `session=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600`

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookieAttrs,
            ...corsHeaders(env, request),
          },
        })
      } catch (error: any) {
        console.error('[auth/login] Error:', error)
        return jsonResponse({ error: 'Failed to create session' }, 500, env, request)
      }
    }

    // Clear session cookie
    if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
      const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)
      const cookieAttrs = isLocalhost || isIPAddress
        ? 'session=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        : 'session=deleted; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieAttrs,
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          ...corsHeaders(env, request),
        },
      })
    }

    // --- Authenticated API routes ---

    // Serve media from R2 (user can only access their own media)
    if (url.pathname.startsWith('/api/media/')) {
      const userOrError = await authenticate(request, env)
      if (userOrError instanceof Response) return userOrError

      const key = url.pathname.replace('/api/media/', '')

      // Verify the key belongs to this user
      if (!key.startsWith(`videos/${userOrError.uid}/`)) {
        return jsonResponse({ error: 'Forbidden' }, 403, env, request)
      }

      try {
        const object = await env.MEDIA_BUCKET.get(key)
        if (!object) {
          return jsonResponse({ error: 'Not found' }, 404, env, request)
        }

        const headers = new Headers()
        object.writeHttpMetadata(headers)
        headers.set('etag', object.httpEtag)
        Object.entries(corsHeaders(env, request)).forEach(([k, v]) => headers.set(k, v))

        return new Response(object.body, { headers })
      } catch (error: any) {
        return jsonResponse({ error: error.message }, 500, env, request)
      }
    }

    // Handle R2 uploads (scoped to user)
    if (url.pathname.startsWith('/api/upload/') && request.method === 'PUT') {
      const userOrError = await authenticate(request, env)
      if (userOrError instanceof Response) return userOrError

      const key = url.pathname.replace('/api/upload/', '')

      // Verify the key belongs to this user
      if (!key.startsWith(`videos/${userOrError.uid}/`)) {
        return jsonResponse({ error: 'Forbidden' }, 403, env, request)
      }

      try {
        const contentType = request.headers.get('content-type') || 'video/mp4'

        await env.MEDIA_BUCKET.put(key, request.body, {
          httpMetadata: { contentType },
        })

        return jsonResponse({ success: true, key, url: `/api/media/${key}` }, 200, env, request)
      } catch (error: any) {
        return jsonResponse({ error: error.message }, 500, env, request)
      }
    }

    // Generate upload URL (scoped to user)
    if (url.pathname === '/api/upload-url' && request.method === 'POST') {
      const userOrError = await authenticate(request, env)
      if (userOrError instanceof Response) return userOrError

      try {
        const body: any = await request.json()
        const { filename } = body
        // Scope uploads to the authenticated user
        const key = `videos/${userOrError.uid}/${Date.now()}-${filename}`

        return jsonResponse(
          { uploadUrl: `/api/upload/${key}`, key, method: 'PUT' },
          200,
          env,
          request,
        )
      } catch (error: any) {
        return jsonResponse({ error: error.message }, 500, env, request)
      }
    }

    // --- User info endpoint ---
    if (url.pathname === '/api/me' && request.method === 'GET') {
      const userOrError = await authenticate(request, env)
      if (userOrError instanceof Response) return userOrError

      return jsonResponse({ user: userOrError }, 200, env, request)
    }

    // Fall through to TanStack Start for everything else
    const response: Response = await (startServer as any).fetch(request, env, ctx)

    // Prevent browser from caching HTML responses
    const ct = response.headers.get('content-type') || ''
    if (ct.includes('text/html') && !response.headers.has('cache-control')) {
      const patched = new Response(response.body, response)
      patched.headers.set('Cache-Control', 'no-cache')
      return patched
    }

    return response
  },
}
