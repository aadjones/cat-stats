import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the existing JSON file
    const dataPath = path.join(process.cwd(), 'data', 'characters.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const characters = JSON.parse(fileContent);

    let migratedCount = 0;

    // Migrate each character to KV
    for (const [id, characterData] of Object.entries(characters)) {
      await kv.set(`character:${id}`, characterData);
      migratedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Migrated ${migratedCount} characters to Vercel KV`,
      characters: Object.keys(characters),
    });
  } catch (error) {
    console.error('Error migrating characters:', error);
    res.status(500).json({ error: 'Migration failed', details: error.message });
  }
}
