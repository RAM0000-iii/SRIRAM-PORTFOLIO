export interface Env {
  BUCKET: R2Bucket;
  PUBLIC_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-filename, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    };

    // Health / Info endpoint
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/api/health')) {
      return new Response(
        JSON.stringify({
          status: 'online',
          service: 'Cloudflare R2 Video Uploader & CDN',
          hasBucket: Boolean(env.BUCKET),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Video Upload: POST or PUT /upload or /api/upload
    if (
      (request.method === 'POST' || request.method === 'PUT') &&
      (url.pathname === '/upload' || url.pathname === '/api/upload')
    ) {
      if (!env.BUCKET) {
        return new Response(
          JSON.stringify({
            error: 'R2 BUCKET binding not found. Please bind BUCKET in wrangler.toml',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const filenameHeader = request.headers.get('x-filename') || 'video.mp4';
      const cleanName = filenameHeader.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueKey = `${Date.now()}-${cleanName}`;
      const contentType = request.headers.get('content-type') || 'video/mp4';

      try {
        await env.BUCKET.put(uniqueKey, request.body, {
          httpMetadata: { contentType },
        });

        // Determine public video URL
        // If PUBLIC_URL is configured (e.g. https://pub-xxxx.r2.dev or https://media.yourdomain.com), use it.
        // Otherwise, fall back to serving directly through this worker at /videos/:key
        const baseUrl = env.PUBLIC_URL
          ? env.PUBLIC_URL.replace(/\/$/, '')
          : `${url.origin}/videos`;

        const publicVideoUrl = `${baseUrl}/${uniqueKey}`;

        return new Response(
          JSON.stringify({
            success: true,
            key: uniqueKey,
            url: publicVideoUrl,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message || 'Upload failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Stream / Serve video directly: GET /videos/:key (Supports range requests / seeking)
    if (request.method === 'GET' && url.pathname.startsWith('/videos/')) {
      const key = decodeURIComponent(url.pathname.replace('/videos/', ''));

      try {
        const object = await env.BUCKET.get(key, {
          range: request.headers,
          onlyIf: request.headers,
        });

        if (!object) {
          return new Response('Video not found in R2 bucket', { status: 404, headers: corsHeaders });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        const status = object.range ? 206 : 200;
        return new Response(object.body, {
          status,
          headers,
        });
      } catch (err: any) {
        return new Response(err.message || 'Error fetching video', { status: 500, headers: corsHeaders });
      }
    }

    return new Response('Endpoint not found', { status: 404, headers: corsHeaders });
  },
};
