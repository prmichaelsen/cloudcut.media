// Cloudflare Pages Function to handle direct R2 uploads
export async function onRequestPut(context: any) {
  const { MEDIA_BUCKET } = context.env;
  const { key } = context.params;

  try {
    const contentType = context.request.headers.get('content-type') || 'video/mp4';

    // Upload to R2
    await MEDIA_BUCKET.put(key, context.request.body, {
      httpMetadata: {
        contentType
      }
    });

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
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
