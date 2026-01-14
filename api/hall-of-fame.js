import { kv } from '@vercel/kv';

// Default featured characters (fallback if KV is empty)
const DEFAULT_FEATURED_IDS = [
  'us0suh',
  'g2rq99',
  'oo035s',
  'ps8raj',
  'q9jqk6',
  'eg8smy',
  'umwqpi',
  'nze8vt',
  '6appoh',
  '9oug8t',
  'sq56qj',
  '7pyi5t',
  'kspziz',
  'svetnf',
  '92rkx5',
  'urs10a',
  'pva4fp',
  'jwio68',
  'd9p9rt',
  '597m90',
  '9fb3p8',
  'qaqbm2',
  '5eo7b9',
];

const KV_KEY = 'config:hall-of-fame';

export default async function handler(req, res) {
  // GET - Public endpoint to fetch featured character IDs
  if (req.method === 'GET') {
    try {
      const data = await kv.get(KV_KEY);

      if (data && data.characterIds) {
        return res.status(200).json({
          characterIds: data.characterIds,
          updatedAt: data.updatedAt,
        });
      }

      // Fallback to default list if KV is empty
      return res.status(200).json({
        characterIds: DEFAULT_FEATURED_IDS,
        updatedAt: null,
      });
    } catch (error) {
      console.error('Error fetching hall of fame:', error);
      // Return default list on error
      return res.status(200).json({
        characterIds: DEFAULT_FEATURED_IDS,
        updatedAt: null,
      });
    }
  }

  // POST - Admin endpoint to add/remove characters
  if (req.method === 'POST') {
    // Verify admin token
    const authHeader = req.headers.authorization;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { action, characterId } = req.body;

      if (!action || !characterId) {
        return res.status(400).json({
          error: 'Missing required fields: action and characterId',
        });
      }

      if (!['add', 'remove'].includes(action)) {
        return res.status(400).json({
          error: 'Invalid action. Must be "add" or "remove"',
        });
      }

      // Get current list
      let data = await kv.get(KV_KEY);
      let characterIds = data?.characterIds || [...DEFAULT_FEATURED_IDS];

      if (action === 'add') {
        if (characterIds.includes(characterId)) {
          return res.status(400).json({
            error: 'Character is already in Hall of Fame',
          });
        }
        characterIds.push(characterId);
      } else if (action === 'remove') {
        const index = characterIds.indexOf(characterId);
        if (index === -1) {
          return res.status(400).json({
            error: 'Character is not in Hall of Fame',
          });
        }
        characterIds.splice(index, 1);
      }

      // Save updated list
      const updatedData = {
        characterIds,
        updatedAt: new Date().toISOString(),
      };

      await kv.set(KV_KEY, updatedData);

      return res.status(200).json({
        success: true,
        message: `Character ${action === 'add' ? 'added to' : 'removed from'} Hall of Fame`,
        characterIds,
        updatedAt: updatedData.updatedAt,
      });
    } catch (error) {
      console.error('Error updating hall of fame:', error);
      return res.status(500).json({
        error: 'Failed to update Hall of Fame',
        details: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
