// Vercel Edge Middleware for crawler detection
// Routes social media crawlers to the OG page endpoint for proper meta tags

export const config = {
  matcher: '/legend/:id*',
};

// Known social media and search engine crawler User-Agent patterns
const CRAWLER_PATTERNS = [
  // Social media
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'TelegramBot',
  'WhatsApp',
  'Pinterestbot',
  'Redditbot',

  // Messaging apps
  'iMessageBot',
  'Viber',
  'Line',

  // Preview services
  'Embedly',
  'Quora Link Preview',
  'outbrain',
  'vkShare',
  'W3C_Validator',
  'Iframely',

  // Search engines (for rich snippets)
  'Googlebot',
  'bingbot',
  'yandex',
  'baiduspider',
  'DuckDuckBot',
];

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_PATTERNS.some((pattern) => ua.includes(pattern.toLowerCase()));
}

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);

  // Extract the character ID from /legend/[id]
  const match = url.pathname.match(/^\/legend\/([a-z0-9]{6})$/);

  if (match && isCrawler(userAgent)) {
    const characterId = match[1];
    // Rewrite to the OG page endpoint
    const ogPageUrl = new URL(`/api/og-page/${characterId}`, url.origin);
    return Response.redirect(ogPageUrl, 307);
  }

  // Let all other requests pass through (to SPA)
  return undefined;
}
