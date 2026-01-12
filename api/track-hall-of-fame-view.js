import { trackEvent } from './utils/analyticsTracker.js';

export default async function handler(req, res) {
  // Add CORS headers for production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await trackEvent('hall_of_fame_views');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking hall of fame view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
