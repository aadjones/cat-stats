import { kv } from '@vercel/kv';
import { trackEvent, getAnalytics } from './utils/analyticsTracker.js';

const VALID_EVENTS = [
  'hall_of_fame_views',
  'pdf_downloads',
  'share_button_clicks',
  'page_visits',
  'questionnaire_engaged',
  'funnel_completed',
];

/**
 * Consolidated analytics endpoint
 *
 * POST /api/analytics          - Log an API call (internal only, no auth needed)
 * GET  /api/analytics          - Get daily KV analytics (requires admin auth)
 * GET  /api/analytics?type=usage  - Get usage counters (requires admin auth)
 *   ↑ routed here from /api/get-usage-analytics via vercel.json rewrite
 * POST /api/analytics?action=track - Track a user event
 *   ↑ routed here from /api/track via vercel.json rewrite
 */
export default async function handler(req, res) {
  const { type, action } = req.query;

  // POST /api/analytics?action=track  (routed from /api/track)
  if (req.method === 'POST' && action === 'track') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { event } = req.body;
    if (!event || !VALID_EVENTS.includes(event)) {
      return res
        .status(400)
        .json({ error: 'Invalid event type', validEvents: VALID_EVENTS });
    }
    try {
      await trackEvent(event);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error tracking event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /api/analytics?type=usage  (routed from /api/get-usage-analytics)
  if (req.method === 'GET' && type === 'usage') {
    const authHeader = req.headers.authorization;
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken)
      return res.status(401).json({ error: 'Admin token not configured' });
    if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const analytics = await getAnalytics();
      return res.status(200).json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  console.log('[ANALYTICS] ========================================');
  console.log('[ANALYTICS] Method:', req.method);
  console.log('[ANALYTICS] URL:', req.url);
  console.log('[ANALYTICS] Headers:', JSON.stringify(req.headers));

  // GET requires admin authentication
  if (req.method === 'GET') {
    console.log('[ANALYTICS] Handling GET request');
    const authHeader = req.headers.authorization;
    const adminToken = process.env.ADMIN_TOKEN;

    // Debug logging
    const expectedHeader = `Bearer ${adminToken}`;
    console.log('Auth Debug:', {
      hasAdminToken: !!adminToken,
      adminTokenLength: adminToken?.length,
      hasAuthHeader: !!authHeader,
      authHeaderLength: authHeader?.length,
      authHeaderPrefix: authHeader?.substring(0, 10),
      expectedPrefix: expectedHeader?.substring(0, 10),
      tokensMatch: authHeader === expectedHeader,
      // Show first/last chars to spot whitespace issues
      authHeaderStart: authHeader?.substring(0, 20),
      expectedStart: expectedHeader?.substring(0, 20),
    });

    if (!adminToken) {
      return res
        .status(401)
        .json({ error: 'Server: Admin token not configured' });
    }

    if (!authHeader) {
      return res.status(401).json({ error: 'Client: No authorization header' });
    }

    if (authHeader !== expectedHeader) {
      console.log('Token mismatch details:', {
        receivedLength: authHeader.length,
        expectedLength: expectedHeader.length,
        receivedLast10: authHeader.substring(authHeader.length - 10),
        expectedLast10: expectedHeader.substring(expectedHeader.length - 10),
      });
      return res.status(401).json({ error: 'Client: Invalid admin token' });
    }

    // Auth passed, fetch analytics data
    const { days = 30 } = req.query;
    console.log('[ANALYTICS] Fetching analytics for', days, 'days');

    try {
      const daysToFetch = Math.min(parseInt(days), 90);
      const analytics = [];

      for (let i = 0; i < daysToFetch; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dailyKey = `analytics:daily:${dateStr}`;

        const dailyData = await kv.get(dailyKey);
        if (dailyData) {
          analytics.push(dailyData);
        }
      }

      console.log('[ANALYTICS] Found', analytics.length, 'days of data');

      // Calculate totals
      const totals = analytics.reduce(
        (acc, day) => ({
          totalCalls: acc.totalCalls + day.totalCalls,
          totalCost: acc.totalCost + day.totalCost,
          totalInputTokens: acc.totalInputTokens + day.totalInputTokens,
          totalOutputTokens: acc.totalOutputTokens + day.totalOutputTokens,
        }),
        {
          totalCalls: 0,
          totalCost: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0,
        }
      );

      console.log(
        '[ANALYTICS] ✓ GET completed, returning',
        analytics.length,
        'days'
      );
      return res.status(200).json({
        analytics: analytics.reverse(),
        totals,
        daysRequested: daysToFetch,
      });
    } catch (error) {
      console.error('[ANALYTICS] ✗ Error fetching analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
  // POST: Log an API call
  if (req.method === 'POST') {
    console.log('[ANALYTICS] Handling POST request');
    console.log('[ANALYTICS] Raw body:', req.body);

    const { model, inputTokens, outputTokens, totalCost, endpoint } = req.body;

    console.log('[ANALYTICS] Parsed fields:', {
      model,
      inputTokens,
      outputTokens,
      totalCost,
      endpoint,
    });

    // Validate required fields
    const missingFields = [];
    if (!model) missingFields.push('model');
    if (!inputTokens) missingFields.push('inputTokens');
    if (!outputTokens) missingFields.push('outputTokens');
    if (!totalCost) missingFields.push('totalCost');
    if (!endpoint) missingFields.push('endpoint');

    if (missingFields.length > 0) {
      console.error('[ANALYTICS] ✗ Missing required fields:', missingFields);
      return res.status(400).json({
        error: 'Missing required fields',
        missing: missingFields,
      });
    }

    try {
      const timestamp = Date.now();
      const logKey = `analytics:log:${timestamp}`;

      console.log('[ANALYTICS] Storing log entry:', logKey);

      // Store individual log entry
      await kv.set(logKey, {
        model,
        inputTokens,
        outputTokens,
        totalCost,
        endpoint,
        timestamp,
      });
      console.log('[ANALYTICS] ✓ Stored log entry:', logKey);

      // Update daily aggregates
      const today = new Date().toISOString().split('T')[0];
      const dailyKey = `analytics:daily:${today}`;

      console.log('[ANALYTICS] Fetching daily data for:', today);
      const dailyData = (await kv.get(dailyKey)) || {
        date: today,
        totalCalls: 0,
        totalCost: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        endpoints: {},
      };

      console.log('[ANALYTICS] Daily data before update:', dailyData);

      dailyData.totalCalls += 1;
      dailyData.totalCost += totalCost;
      dailyData.totalInputTokens += inputTokens;
      dailyData.totalOutputTokens += outputTokens;

      if (!dailyData.endpoints[endpoint]) {
        dailyData.endpoints[endpoint] = {
          calls: 0,
          cost: 0,
          inputTokens: 0,
          outputTokens: 0,
        };
      }

      dailyData.endpoints[endpoint].calls += 1;
      dailyData.endpoints[endpoint].cost += totalCost;
      dailyData.endpoints[endpoint].inputTokens += inputTokens;
      dailyData.endpoints[endpoint].outputTokens += outputTokens;

      console.log('[ANALYTICS] Daily data after update:', dailyData);
      console.log('[ANALYTICS] Saving daily aggregate:', dailyKey);

      await kv.set(dailyKey, dailyData);
      console.log('[ANALYTICS] ✓ Updated daily aggregate:', dailyKey);

      console.log('[ANALYTICS] ✓ POST completed successfully');
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('[ANALYTICS] ✗ Error logging analytics:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      return res.status(500).json({
        error: 'Failed to log analytics',
        details: error.message,
      });
    }
  }

  // If we get here, unsupported method
  console.log('[ANALYTICS] ✗ Unsupported method:', req.method);
  return res.status(405).json({ error: 'Method not allowed' });
}
