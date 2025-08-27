import { kv } from '@vercel/kv';
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

    // Check for ID collision
    const existingCharacter = await kv.get(`character:${characterData.id}`);
    if (existingCharacter) {
      return res.status(409).json({ error: 'Character ID already exists' });
    }

    // Save character to Vercel KV
    await kv.set(`character:${characterData.id}`, characterData);

    res.status(201).json({
      success: true,
      id: characterData.id,
      message: `Character ${characterData.petName} saved successfully`,
    });
  } catch (error) {
    console.error('Error saving character:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
    });
  }
}
