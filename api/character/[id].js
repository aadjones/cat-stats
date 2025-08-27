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
    // Read characters file
    const dataPath = path.join(process.cwd(), 'data', 'characters.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const characters = JSON.parse(fileContent);

    const character = characters[id];

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.status(200).json(character);
  } catch (error) {
    console.error('Error loading character:', error);

    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
