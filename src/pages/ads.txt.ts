import type { APIRoute } from 'astro';

const GOOGLE_ADSENSE_TAG_ID = 'f08c47fec0942fa0';
const publisherId = import.meta.env.PUBLIC_ADSENSE_CLIENT?.trim().replace(/^ca-/u, '');

export const GET: APIRoute = () => {
  const body = /^pub-\d+$/u.test(publisherId ?? '')
    ? `google.com, ${publisherId}, DIRECT, ${GOOGLE_ADSENSE_TAG_ID}\n`
    : '# Utilark has no authorized advertising sellers yet.\n';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
