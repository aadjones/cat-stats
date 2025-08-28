import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { character1, character2 } = req.body;

    if (!character1 || !character2) {
      return res.status(400).json({ 
        error: 'Both character1 and character2 are required' 
      });
    }

    // Load characters from KV if IDs provided, otherwise use full objects
    let char1Data, char2Data;

    if (typeof character1 === 'string') {
      char1Data = await kv.get(`character:${character1}`);
      if (!char1Data) {
        return res.status(404).json({ 
          error: `Character with ID '${character1}' not found` 
        });
      }
    } else {
      char1Data = character1;
    }

    if (typeof character2 === 'string') {
      char2Data = await kv.get(`character:${character2}`);
      if (!char2Data) {
        return res.status(404).json({ 
          error: `Character with ID '${character2}' not found` 
        });
      }
    } else {
      char2Data = character2;
    }

    // Validate that we have different characters
    if (char1Data.id === char2Data.id) {
      return res.status(400).json({
        error: 'Cannot generate friendship report for the same character'
      });
    }

    // Calculate compatibility metrics (simplified for API - full logic would be imported)
    const compatibilityMetrics = calculateBasicCompatibility(char1Data, char2Data);

    // Structure Claude prompt
    const prompt = `Generate a friendship compatibility report between these two pets. Return your response as valid JSON in this exact format:

{
  "overallScore": 75,
  "friendshipType": "Partners in Crime",
  "sections": {
    "firstMeeting": "Detailed scenario of how they would first meet...",
    "livingDynamics": "How they would share living space...",
    "predictedShenanigans": "Adventures and mischief they would get into...",
    "mutualSupport": "How they would help each other..."
  },
  "chaosLevel": "Moderate Mayhem"
}

Pet 1 - ${char1Data.petName}:
Archetype: ${char1Data.characterData.archetype}
Stats: Wisdom ${char1Data.stats.wisdom}, Cunning ${char1Data.stats.cunning}, Agility ${char1Data.stats.agility}, Stealth ${char1Data.stats.stealth}, Charisma ${char1Data.stats.charisma}, Resolve ${char1Data.stats.resolve}, Boldness ${char1Data.stats.boldness}

Combat Moves:
${char1Data.characterData.combatMoves.map(m => `- ${m.name}: ${m.description}`).join('\n')}

Environmental Powers:
${char1Data.characterData.environmentalPowers.map(p => `- ${p.name}: ${p.description}`).join('\n')}

Social Skills:
${char1Data.characterData.socialSkills.map(s => `- ${s.name}: ${s.description}`).join('\n')}

Passive Traits:
${char1Data.characterData.passiveTraits.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Weakness: ${char1Data.characterData.weakness.name} - ${char1Data.characterData.weakness.description}

Pet 2 - ${char2Data.petName}:
Archetype: ${char2Data.characterData.archetype}
Stats: Wisdom ${char2Data.stats.wisdom}, Cunning ${char2Data.stats.cunning}, Agility ${char2Data.stats.agility}, Stealth ${char2Data.stats.stealth}, Charisma ${char2Data.stats.charisma}, Resolve ${char2Data.stats.resolve}, Boldness ${char2Data.stats.boldness}

Combat Moves:
${char2Data.characterData.combatMoves.map(m => `- ${m.name}: ${m.description}`).join('\n')}

Environmental Powers:
${char2Data.characterData.environmentalPowers.map(p => `- ${p.name}: ${p.description}`).join('\n')}

Social Skills:
${char2Data.characterData.socialSkills.map(s => `- ${s.name}: ${s.description}`).join('\n')}

Passive Traits:
${char2Data.characterData.passiveTraits.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Weakness: ${char2Data.characterData.weakness.name} - ${char2Data.characterData.weakness.description}

Compatibility Analysis:
- Overall compatibility score: ${compatibilityMetrics.overallScore}/100
- Energy level match: ${compatibilityMetrics.energyMatch}/100
- Social balance: ${compatibilityMetrics.socialBalance}/100
- Potential conflicts: ${compatibilityMetrics.conflicts.join(', ') || 'None detected'}

Create a humorous but believable friendship report focusing on specific ability interactions. Reference their actual abilities and personality traits. Make it funny but grounded in their real behaviors. Return ONLY valid JSON with no other text.`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API Error:', data);
      return res.status(500).json({
        error: 'Failed to generate friendship report',
        details: data.error?.message || 'Unknown API error',
      });
    }

    if (!data.content || !data.content[0]) {
      console.error('Unexpected Claude API Response:', data);
      return res.status(500).json({
        error: 'Invalid response format from Claude API',
      });
    }

    let jsonContent = data.content[0].text;

    // Clean up potential markdown formatting
    jsonContent = jsonContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse and validate the friendship report
    let friendshipReport;
    try {
      friendshipReport = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse friendship report JSON:', parseError);
      return res.status(500).json({
        error: 'Invalid JSON response from Claude API',
      });
    }

    // Validate required fields
    if (!friendshipReport.overallScore || !friendshipReport.friendshipType || !friendshipReport.sections) {
      return res.status(500).json({
        error: 'Incomplete friendship report received from Claude API',
      });
    }

    // Add metadata
    const finalReport = {
      ...friendshipReport,
      petNames: [char1Data.petName, char2Data.petName],
      compatibility: compatibilityMetrics,
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json(finalReport);

  } catch (error) {
    console.error('Error generating friendship report:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}

// Simplified compatibility calculation for API
// (In production, this would import from the compatibility calculator)
function calculateBasicCompatibility(char1, char2) {
  const stats1 = char1.stats;
  const stats2 = char2.stats;

  // Energy level matching
  const energy1 = stats1.agility + stats1.boldness;
  const energy2 = stats2.agility + stats2.boldness;
  const energyDiff = Math.abs(energy1 - energy2);
  const energyMatch = Math.max(0, 100 - energyDiff / 2);

  // Social balance
  const charismaDiff = Math.abs(stats1.charisma - stats2.charisma);
  const socialBalance = charismaDiff <= 15 ? 85 : 
                       charismaDiff <= 30 ? 70 : 
                       charismaDiff <= 50 ? 45 : 25;

  // Potential conflicts
  const conflicts = [];
  if (stats1.boldness > 70 && stats2.boldness > 70) {
    conflicts.push('Territory disputes');
  }
  if (stats1.charisma > 75 && stats2.charisma > 75) {
    conflicts.push('Attention competition');
  }

  // Overall score
  const overallScore = Math.round((energyMatch + socialBalance) / 2);

  return {
    overallScore,
    energyMatch: Math.round(energyMatch),
    socialBalance: Math.round(socialBalance),
    conflicts,
  };
}