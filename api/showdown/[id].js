import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Add debugging to see if this route is even being hit
  console.log('Showdown API route hit with:', {
    method: req.method,
    query: req.query,
    url: req.url,
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Showdown ID is required',
      });
    }

    // Validate ID format (should be 6-10 characters, alphanumeric)
    if (!/^[a-z0-9]{6,10}$/i.test(id)) {
      return res.status(400).json({
        error: 'Invalid showdown ID format',
      });
    }

    // Load showdown from KV
    console.log(`Attempting to load showdown with key: showdown:${id}`);
    const showdownData = await kv.get(`showdown:${id}`);
    console.log(
      'KV lookup result:',
      showdownData ? 'Found data' : 'No data found'
    );

    if (!showdownData) {
      console.log(`Showdown not found for ID: ${id}`);
      return res.status(404).json({
        error:
          'Showdown not found. It may have been removed or the link is invalid.',
      });
    }

    // Validate that we have the required showdown data structure
    if (
      !showdownData.overallScore ||
      !showdownData.relationshipDynamic ||
      !showdownData.signatureClash ||
      !showdownData.finalVerdict ||
      !showdownData.expandableSections ||
      !showdownData.petNames
    ) {
      return res.status(500).json({
        error: 'Invalid showdown data format',
      });
    }

    res.status(200).json(showdownData);
  } catch (error) {
    console.error('Error loading showdown:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
