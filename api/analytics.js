import { kv } from '@vercel/kv';

/**
 * Analytics endpoint - tracks API usage and costs
 *
 * POST /api/analytics - Log an API call (internal only, no auth needed)
 * GET /api/analytics - Get analytics data (requires admin auth)
 */
export default async function handler(req, res) {
  // GET requires admin authentication
  if (req.method === 'GET') {
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
  }
  // POST: Log an API call
  if (req.method === 'POST') {
    const { model, inputTokens, outputTokens, totalCost, endpoint } = req.body;

    if (!model || !inputTokens || !outputTokens || !totalCost || !endpoint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const timestamp = Date.now();
      const logKey = `analytics:log:${timestamp}`;

      // Store individual log entry
      await kv.set(logKey, {
        model,
        inputTokens,
        outputTokens,
        totalCost,
        endpoint,
        timestamp,
      });

      // Update daily aggregates
      const today = new Date().toISOString().split('T')[0];
      const dailyKey = `analytics:daily:${today}`;

      const dailyData = (await kv.get(dailyKey)) || {
        date: today,
        totalCalls: 0,
        totalCost: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        endpoints: {},
      };

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

      await kv.set(dailyKey, dailyData);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error logging analytics:', error);
      return res.status(500).json({ error: 'Failed to log analytics' });
    }
  }

  // GET: Retrieve analytics data
  if (req.method === 'GET') {
    const { days = 30 } = req.query;

    try {
      const daysToFetch = Math.min(parseInt(days), 90); // Max 90 days
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

      return res.status(200).json({
        analytics: analytics.reverse(), // Oldest to newest
        totals,
        daysRequested: daysToFetch,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
