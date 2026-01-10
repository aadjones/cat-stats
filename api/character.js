import { checkRateLimit } from './utils/rateLimiter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Emergency kill switch - can be enabled via environment variable
  if (process.env.EMERGENCY_DISABLE === 'true') {
    return res.status(503).json({
      error:
        "Character generation is temporarily unavailable due to high demand. We're working to restore service soon! Please try again in a few hours.",
    });
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

    // ============ ANALYTICS LOGGING START ============
    console.log('[CHARACTER] Starting analytics logging');
    console.log('[CHARACTER] data.usage present?', !!data.usage);
    console.log('[CHARACTER] VERCEL_URL:', process.env.VERCEL_URL);

    if (data.usage) {
      const { input_tokens, output_tokens } = data.usage;
      console.log('[CHARACTER] Token usage:', { input_tokens, output_tokens });

      // Calculate cost based on Claude model pricing (as of 2025)
      // Sonnet 4.5: $3/M input, $15/M output
      // Haiku: $0.25/M input, $1.25/M output
      let inputCostPerMillion, outputCostPerMillion;

      if (model.includes('haiku')) {
        inputCostPerMillion = 0.25;
        outputCostPerMillion = 1.25;
      } else if (model.includes('sonnet')) {
        inputCostPerMillion = 3.0;
        outputCostPerMillion = 15.0;
      } else {
        // Default to sonnet pricing
        inputCostPerMillion = 3.0;
        outputCostPerMillion = 15.0;
      }

      const totalCost =
        (input_tokens / 1000000) * inputCostPerMillion +
        (output_tokens / 1000000) * outputCostPerMillion;

      console.log('[CHARACTER] Calculated cost:', totalCost);

      // Log to analytics - construct full URL from request headers
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const analyticsUrl = `${protocol}://${host}/api/analytics`;

      const payload = {
        model,
        inputTokens: input_tokens,
        outputTokens: output_tokens,
        totalCost,
        endpoint: 'character',
      };

      console.log('[CHARACTER] Analytics URL:', analyticsUrl);
      console.log('[CHARACTER] Analytics payload:', JSON.stringify(payload));

      try {
        console.log('[CHARACTER] Calling fetch...');
        const analyticsResponse = await fetch(analyticsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        console.log(
          '[CHARACTER] Fetch completed, status:',
          analyticsResponse.status
        );
        console.log('[CHARACTER] Response ok?', analyticsResponse.ok);

        if (analyticsResponse.ok) {
          const responseData = await analyticsResponse.json();
          console.log(
            '[CHARACTER] ✓ Analytics logged successfully:',
            responseData
          );
        } else {
          const errorText = await analyticsResponse.text();
          console.error('[CHARACTER] ✗ Analytics logging failed:', {
            status: analyticsResponse.status,
            statusText: analyticsResponse.statusText,
            errorBody: errorText,
          });
        }
      } catch (err) {
        console.error('[CHARACTER] ✗ Exception during analytics fetch:', {
          message: err.message,
          name: err.name,
          stack: err.stack,
        });
      }
    } else {
      console.warn('[CHARACTER] No usage data in API response');
    }
    console.log('[CHARACTER] ============ ANALYTICS LOGGING END ============');

    // Prevent caching of API responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).json(data);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
