// Cloudflare Pages Function to generate presigned upload URL for R2
export async function onRequestPost(context: any) {
  const { MEDIA_BUCKET } = context.env;

  try {
    const body = await context.request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return new Response(
        JSON.stringify({ error: 'filename and contentType required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique key
    const key = `videos/${Date.now()}-${filename}`;

    // For R2, we'll use direct PUT with CORS
    // Return the URL and key for client-side upload
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
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
