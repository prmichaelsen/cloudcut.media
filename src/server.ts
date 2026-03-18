/**
 * Cloudflare Workers Entry Point
 *
 * This file is referenced by wrangler.toml as the main entry point.
 */

// Import the TanStack Start server
import startServer from '@tanstack/react-start/server-entry'

// Export the default server
export default {
  async fetch(request: Request, env: any, ctx: any) {
    // Handle R2 media serving
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/media/')) {
      const key = url.pathname.replace('/api/media/', '')
      try {
        const object = await env.MEDIA_BUCKET.get(key)

        if (!object) {
          return new Response('Not found', { status: 404 })
        }

        const headers = new Headers()
        object.writeHttpMetadata(headers)
        headers.set('etag', object.httpEtag)
        headers.set('Access-Control-Allow-Origin', '*')

        return new Response(object.body, { headers })
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Handle R2 uploads
    if (url.pathname.startsWith('/api/upload/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        })
      }

      if (request.method === 'PUT') {
        const key = url.pathname.replace('/api/upload/', '')
        try {
          const contentType = request.headers.get('content-type') || 'video/mp4'

          await env.MEDIA_BUCKET.put(key, request.body, {
            httpMetadata: { contentType }
          })

          return new Response(
            JSON.stringify({
              success: true,
              key,
              url: `/api/media/${key}`
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }
          )
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Handle upload URL generation
    if (url.pathname === '/api/upload-url' && request.method === 'POST') {
      try {
        const body = await request.json()
        const { filename } = body
        const key = `videos/${Date.now()}-${filename}`

        return new Response(
          JSON.stringify({
            uploadUrl: `/api/upload/${key}`,
            key,
            method: 'PUT'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
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
