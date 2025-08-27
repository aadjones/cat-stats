import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid character ID' });
  }

  try {
    let character = null;

    // Try Vercel KV first
    try {
      character = await kv.get(`character:${id}`);
    } catch (kvError) {
      console.log('KV not available, falling back to JSON file');
    }

    // Fallback to JSON file for development
    if (!character) {
      try {
        const dataPath = path.join(process.cwd(), 'data', 'characters.json');
        const fileContent = await fs.readFile(dataPath, 'utf-8');
        const characters = JSON.parse(fileContent);
        character = characters[id];
      } catch (fileError) {
        console.log('JSON file not available either');
      }
    }

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.status(200).json(character);
  } catch (error) {
    console.error('Error loading character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
