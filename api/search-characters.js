import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin token
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { q, page: pageParam, limit: limitParam } = req.query;

  try {
    // Strategy: Get the character index (ONE fetch), then filter in memory
    // This is O(1) network calls instead of O(n)
    let index = await kv.get('characters:index');

    // If no index exists, build it (one-time migration, then it stays cached)
    if (!index) {
      index = await rebuildIndex();
    }

    // If no query provided, return paginated full list (browse mode)
    if (!q || q.trim() === '') {
      const page = Math.max(1, parseInt(pageParam) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(limitParam) || 20));
      const start = (page - 1) * limit;

      const sorted = [...index].sort((a, b) =>
        a.petName.localeCompare(b.petName)
      );
      const results = sorted.slice(start, start + limit);
      const totalPages = Math.ceil(index.length / limit);

      return res.status(200).json({
        results,
        count: results.length,
        total: index.length,
        page,
        totalPages,
      });
    }

    // Search mode: require at least 2 characters
    if (q.trim().length < 2) {
      return res
        .status(400)
        .json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = q.trim().toLowerCase();

    // Filter in memory - this is instant for ~100 items
    const results = index
      .filter((char) => char.petName.toLowerCase().includes(searchTerm))
      .slice(0, 20)
      .sort((a, b) => a.petName.localeCompare(b.petName));

    return res.status(200).json({
      results,
      count: results.length,
      truncated: results.length >= 20,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}

// Build index from existing characters (runs once, then cached)
async function rebuildIndex() {
  const index = [];
  const seenIds = new Set();
  let cursor = 0;
  let iterations = 0;

  do {
    iterations++;
    const result = await kv.scan(cursor, {
      match: 'character:*',
      count: 100,
    });

    const [newCursor, keys] = result;
    cursor = newCursor;

    if (keys.length > 0) {
      // Batch fetch all keys at once - ONE network call per batch
      const values = await kv.mget(...keys);

      for (let i = 0; i < keys.length; i++) {
        const id = keys[i].replace('character:', '');
        const data = values[i];

        // Deduplicate by ID
        if (data && data.petName && !seenIds.has(id)) {
          seenIds.add(id);
          index.push({
            id,
            petName: data.petName,
            archetype: data.characterData?.archetype || 'Unknown',
          });
        }
      }
    }

    // Safety: prevent infinite loops
    if (iterations > 100) {
      console.error('[SEARCH] Too many iterations, breaking');
      break;
    }
  } while (cursor !== 0 && cursor !== '0');

  console.log(
    `[SEARCH] Rebuild complete. Found ${index.length} characters in ${iterations} iterations`
  );

  // Cache the index for future searches (expires in 1 hour)
  await kv.set('characters:index', index, { ex: 3600 });

  return index;
}
