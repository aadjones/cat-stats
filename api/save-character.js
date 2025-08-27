import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const characterData = req.body;

    if (!characterData || !characterData.id) {
      return res.status(400).json({ error: 'Invalid character data' });
    }

    // Handle image upload to Vercel Blob if present
    if (characterData.petPhoto && characterData.petPhoto.startsWith('data:')) {
      try {
        // Convert base64 data URL to blob
        const base64Data = characterData.petPhoto.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        // Upload to Vercel Blob
        const blob = await put(`pet-photos/${characterData.id}.jpg`, buffer, {
          access: 'public',
          contentType: 'image/jpeg',
        });

        // Replace the base64 data with the blob URL
        characterData.petPhoto = blob.url;
      } catch (imageError) {
        console.error('Error uploading image to blob storage:', imageError);
        // Continue without image rather than failing entirely
        characterData.petPhoto = null;
      }
    }

    // Read existing characters file
    const dataPath = path.join(process.cwd(), 'data', 'characters.json');
    let characters = {};

    try {
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      characters = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, start with empty object
      console.log('Creating new characters.json file');
    }

    // Check for ID collision
    if (characters[characterData.id]) {
      return res.status(409).json({ error: 'Character ID already exists' });
    }

    // Add the new character
    characters[characterData.id] = characterData;

    // Write back to file
    await fs.writeFile(dataPath, JSON.stringify(characters, null, 2), 'utf-8');

    res.status(201).json({
      success: true,
      id: characterData.id,
      message: `Character ${characterData.petName} saved successfully`,
    });
  } catch (error) {
    console.error('Error saving character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
