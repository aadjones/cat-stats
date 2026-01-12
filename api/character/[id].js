import { kv } from '@vercel/kv';
import { trackEvent } from '../utils/analyticsTracker.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid character ID' });
  }

  try {
    const character = await kv.get(`character:${id}`);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Don't track here - we track share button clicks instead
    res.status(200).json(character);
  } catch (error) {
    console.error('Error loading character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
