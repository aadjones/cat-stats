export default async function handler(req, res) {
  try {
    return res.status(200).json({ 
      message: 'Test API works',
      method: req.method,
      hasEnvVar: !!process.env.ANTHROPIC_API_KEY,
      nodeVersion: process.version
    });
  } catch (error) {
    console.error('Error in test API:', error);
    return res.status(500).json({ error: error.message });
  }
}