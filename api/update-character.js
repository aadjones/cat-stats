import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin token
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id, petPhoto } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Character ID is required' });
    }

    // Get existing character
    const existingCharacter = await kv.get(`character:${id}`);
    if (!existingCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Handle image upload to Vercel Blob if present
    if (petPhoto && petPhoto.startsWith('data:')) {
      try {
        // Convert base64 data URL to blob
        const base64Data = petPhoto.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        // Upload to Vercel Blob
        const blob = await put(`pet-photos/${id}.jpg`, buffer, {
          access: 'public',
          contentType: 'image/jpeg',
          allowOverwrite: true,
        });

        // Update character with new photo URL
        existingCharacter.petPhoto = blob.url;
      } catch (imageError) {
        console.error('Error uploading image to blob storage:', imageError);
        console.error('Image error details:', {
          message: imageError.message,
          stack: imageError.stack,
          name: imageError.name,
        });
        return res.status(500).json({
          error: 'Failed to upload image',
          details: imageError.message,
        });
      }
    }

    // Save updated character to Vercel KV
    await kv.set(`character:${id}`, existingCharacter);

    res.status(200).json({
      success: true,
      id: id,
      message: `Character ${existingCharacter.petName} updated successfully`,
      photoUrl: existingCharacter.petPhoto,
    });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
    });
  }
}
