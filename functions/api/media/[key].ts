// Cloudflare Pages Function to serve media from R2
export async function onRequestGet(context: any) {
  const { MEDIA_BUCKET } = context.env;
  const { key } = context.params;

  try {
    const object = await MEDIA_BUCKET.get(key);

    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, {
      headers
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
