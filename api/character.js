import { checkRateLimit } from './utils/rateLimiter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting: 5 requests per 10 minutes
  const rateLimit = checkRateLimit(req, 5, 600000);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', rateLimit.retryAfter);
    return res.status(429).json({
      error:
        'Too many requests. Please wait before generating another character.',
      retryAfter: rateLimit.retryAfter,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'API key not configured',
      debug: 'Environment variable ANTHROPIC_API_KEY not found',
    });
  }

  // Validate request body structure
  const { model, max_tokens, messages } = req.body;

  if (!model || typeof model !== 'string') {
    return res
      .status(400)
      .json({ error: 'Invalid or missing model parameter' });
  }

  if (!max_tokens || typeof max_tokens !== 'number' || max_tokens > 4000) {
    return res
      .status(400)
      .json({ error: 'Invalid max_tokens parameter (must be number ≤ 4000)' });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res
      .status(400)
      .json({ error: 'Messages must be a non-empty array' });
  }

  // Validate message structure and content length
  const MAX_MESSAGE_LENGTH = 5000; // Total prompt should be reasonable
  let totalContentLength = 0;

  for (const message of messages) {
    if (
      !message.role ||
      !message.content ||
      typeof message.role !== 'string' ||
      typeof message.content !== 'string'
    ) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    totalContentLength += message.content.length;

    if (message.content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: 'Message content too long. Please shorten your answers.',
      });
    }
  }

  if (totalContentLength > MAX_MESSAGE_LENGTH * 2) {
    return res.status(400).json({
      error: 'Total request too large. Please shorten your answers.',
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
