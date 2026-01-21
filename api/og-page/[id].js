import { kv } from '@vercel/kv';

const BASE_URL = 'https://cat-stats-six.vercel.app';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || typeof id !== 'string' || id.length !== 6) {
    return sendFallbackHtml(res);
  }

  try {
    const character = await kv.get(`character:${id}`);

    if (!character) {
      return sendFallbackHtml(res);
    }

    const { petName, characterData } = character;
    const archetype = characterData?.archetype || 'Legendary Pet';
    const title = `${petName} - ${archetype}`;
    const description = `Meet ${petName}, ${archetype}! Create your own legendary pet character sheet at CatStats.`;
    const ogImageUrl = `${BASE_URL}/api/og/${id}`;
    const pageUrl = `${BASE_URL}/legend/${id}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | CatStats</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="CatStats">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <!-- Redirect real browsers to the SPA -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${escapeHtml(petName)}'s character sheet</a>...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error generating OG page:', error);
    return sendFallbackHtml(res);
  }
}

function sendFallbackHtml(res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CatStats - Turn Your Pet Into a Legend</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="CatStats - Turn Your Pet Into a Legend">
  <meta property="og:description" content="Generate a legendary RPG-style character sheet for your cat. Discover their wisdom, cunning, agility, and more!">
  <meta property="og:image" content="${BASE_URL}/og-image.png">
  <meta property="og:url" content="${BASE_URL}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="CatStats - Turn Your Pet Into a Legend">
  <meta name="twitter:description" content="Generate a legendary RPG-style character sheet for your cat.">
  <meta name="twitter:image" content="${BASE_URL}/og-image.png">

  <!-- Redirect to home -->
  <meta http-equiv="refresh" content="0;url=${BASE_URL}">
</head>
<body>
  <p>Redirecting to <a href="${BASE_URL}">CatStats</a>...</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(html);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
