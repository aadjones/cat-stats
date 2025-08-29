import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { character1, character2 } = req.body;

    if (!character1 || !character2) {
      return res.status(400).json({
        error: 'Both character1 and character2 are required',
      });
    }

    // Load characters from KV if IDs provided, otherwise use full objects
    let char1Data, char2Data;

    if (typeof character1 === 'string') {
      char1Data = await kv.get(`character:${character1}`);
      if (!char1Data) {
        return res.status(404).json({
          error: `Character with ID '${character1}' not found`,
        });
      }
    } else {
      char1Data = character1;
    }

    if (typeof character2 === 'string') {
      char2Data = await kv.get(`character:${character2}`);
      if (!char2Data) {
        return res.status(404).json({
          error: `Character with ID '${character2}' not found`,
        });
      }
    } else {
      char2Data = character2;
    }

    // Validate that we have different characters
    if (char1Data.id === char2Data.id) {
      return res.status(400).json({
        error: 'Cannot generate friendship report for the same character',
      });
    }

    // Calculate compatibility metrics (simplified for API - full logic would be imported)
    const compatibilityMetrics = calculateBasicCompatibility(
      char1Data,
      char2Data
    );

    // Structure Claude prompt
    const prompt = `Generate a friendship compatibility report as an ULTIMATE SHOWDOWN between these two pets. Return your response as valid JSON in this exact format:

{
  "overallScore": 75,
  "relationshipDynamic": "Legendary Alliance",
  "signatureClash": {
    "name": "The Great Blanket Fort Siege",
    "description": "Dr. Mittens' stretch abilities vs Sente's fortress mastery"
  },
  "finalVerdict": "Unstoppable tactical partnership",
  "expandableSections": {
    "fullBattleReport": "Detailed dramatic encounter of how they would first meet and establish dominance or alliance...",
    "livingDynamics": "Day-to-day coexistence predictions, territory sharing, and household hierarchy...",
    "signatureMoves": "Combined abilities they could perform together, or epic individual clashes if they're rivals...",
    "chaosIncidents": "Specific mischief scenarios and probability of household mayhem..."
  }
}

Pet 1 - ${char1Data.petName}:
Archetype: ${char1Data.characterData.archetype}
Stats: Wisdom ${char1Data.stats.wisdom}, Cunning ${char1Data.stats.cunning}, Agility ${char1Data.stats.agility}, Stealth ${char1Data.stats.stealth}, Charisma ${char1Data.stats.charisma}, Resolve ${char1Data.stats.resolve}, Boldness ${char1Data.stats.boldness}

Combat Moves:
${char1Data.characterData.combatMoves.map((m) => `- ${m.name}: ${m.description}`).join('\n')}

Environmental Powers:
${char1Data.characterData.environmentalPowers.map((p) => `- ${p.name}: ${p.description}`).join('\n')}

Social Skills:
${char1Data.characterData.socialSkills.map((s) => `- ${s.name}: ${s.description}`).join('\n')}

Passive Traits:
${char1Data.characterData.passiveTraits.map((t) => `- ${t.name}: ${t.description}`).join('\n')}

Weakness: ${char1Data.characterData.weakness.name} - ${char1Data.characterData.weakness.description}

Pet 2 - ${char2Data.petName}:
Archetype: ${char2Data.characterData.archetype}
Stats: Wisdom ${char2Data.stats.wisdom}, Cunning ${char2Data.stats.cunning}, Agility ${char2Data.stats.agility}, Stealth ${char2Data.stats.stealth}, Charisma ${char2Data.stats.charisma}, Resolve ${char2Data.stats.resolve}, Boldness ${char2Data.stats.boldness}

Combat Moves:
${char2Data.characterData.combatMoves.map((m) => `- ${m.name}: ${m.description}`).join('\n')}

Environmental Powers:
${char2Data.characterData.environmentalPowers.map((p) => `- ${p.name}: ${p.description}`).join('\n')}

Social Skills:
${char2Data.characterData.socialSkills.map((s) => `- ${s.name}: ${s.description}`).join('\n')}

Passive Traits:
${char2Data.characterData.passiveTraits.map((t) => `- ${t.name}: ${t.description}`).join('\n')}

Weakness: ${char2Data.characterData.weakness.name} - ${char2Data.characterData.weakness.description}

Compatibility Analysis:
- Overall compatibility score: ${compatibilityMetrics.overallScore}/100
- Energy level match: ${compatibilityMetrics.energyMatch}/100
- Social balance: ${compatibilityMetrics.socialBalance}/100
- Potential conflicts: ${compatibilityMetrics.conflicts.join(', ') || 'None detected'}

Create a dramatic ULTIMATE SHOWDOWN report that's humorous and shareable:

RELATIONSHIP DYNAMICS based on compatibility score:
- Under 50: "Sworn Enemies" / "Eternal Rivals" / "Territory War"
- 50-74: "Reluctant Truce" / "Cautious Coexistence" / "Wary Partnership" / "Frenemies" / "Chaos Partners"
- 75+: "Legendary Alliance" / "Soulmate Sidekicks" / "Perfect Harmony"

SIGNATURE CLASH should be:
- A dramatic name like "The Battle of the Sunny Spot" or "Blanket Fort Siege"
- Brief description highlighting their specific abilities in conflict/cooperation
- Make it sound epic but playful

FINAL VERDICT should be:
- One punchy line about the relationship outcome
- Reference specific abilities or traits
- Keep it dramatic but fun

EXPANDABLE SECTIONS should be CONCISE but punchy:
- Keep each section to 2-3 sentences max
- Use specific abilities, not generic descriptions
- For enemies: highlight the best conflicts and rivalry moments
- For allies: focus on their most impressive combined chaos
- Cut any fluff - only the most entertaining scenarios

SIGNATURE MOVES section should be formatted as actual RPG abilities:
- For allies: Create exactly 2 combined abilities they could perform together
- For enemies: Create exactly 2 signature clash moves they'd use against each other
- Format each move on a new line as: "Move Name: Brief description of the ability/clash"
- Example format:
  Synchronized Chaos Strike: Both pets coordinate maximum destruction during zoomies
  Territorial Dominance Display: Alpha staredown that determines furniture ownership

Make it shareable and screenshot-worthy. Reference specific abilities by name. Return ONLY valid JSON with no other text.`;

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
    if (
      !friendshipReport.overallScore ||
      !friendshipReport.relationshipDynamic ||
      !friendshipReport.signatureClash ||
      !friendshipReport.finalVerdict ||
      !friendshipReport.expandableSections
    ) {
      return res.status(500).json({
        error: 'Incomplete friendship report received from Claude API',
      });
    }

    // Generate unique showdown ID (8 characters for uniqueness)
    const showdownId = Math.random().toString(36).substring(2, 10);

    // Add metadata
    const finalReport = {
      ...friendshipReport,
      showdownId,
      petNames: [char1Data.petName, char2Data.petName],
      compatibility: compatibilityMetrics,
      generatedAt: new Date().toISOString(),
    };

    // Save showdown to KV for sharing - this is critical for the showdown page to work
    try {
      await kv.set(`showdown:${showdownId}`, finalReport);
      console.log(`Successfully saved showdown:${showdownId} to KV`);
    } catch (saveError) {
      console.error('Failed to save showdown to KV:', saveError);
      console.error('Showdown save error details:', {
        showdownId,
        errorMessage: saveError.message,
        errorStack: saveError.stack,
      });

      // Don't redirect user to a broken showdown page - return the data without showdownId
      const { showdownId: _, ...reportWithoutId } = finalReport;
      return res.status(200).json(reportWithoutId);
    }

    res.status(200).json(finalReport);
  } catch (error) {
    console.error('Error generating friendship report:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}

// Aggressive compatibility calculation for dramatic enemies
function calculateBasicCompatibility(char1, char2) {
  const stats1 = char1.stats;
  const stats2 = char2.stats;

  let totalPenalty = 0;
  const conflicts = [];

  // MAJOR PERSONALITY CLASHES - lowered thresholds for more conflicts

  // Alpha battle: Both bold = WAR (lowered threshold)
  if (stats1.boldness > 60 && stats2.boldness > 60) {
    totalPenalty += 45;
    conflicts.push('Alpha dominance war');
  }

  // Diva clash: Both charismatic = competition hell (lowered threshold)
  if (stats1.charisma > 65 && stats2.charisma > 65) {
    totalPenalty += 40;
    conflicts.push('Attention diva rivalry');
  }

  // Cunning schemes: Both manipulative = distrust (lowered threshold)
  if (stats1.cunning > 70 && stats2.cunning > 70) {
    totalPenalty += 35;
    conflicts.push('Scheming distrust');
  }

  // Energy chaos: Big mismatch = incompatible (lowered threshold)
  const energyDiff = Math.abs(
    stats1.agility + stats1.boldness - (stats2.agility + stats2.boldness)
  );
  if (energyDiff > 60) {
    totalPenalty += 30;
    conflicts.push('Energy level chaos');
  }

  // Wisdom gap: Frustration (lowered threshold)
  if (Math.abs(stats1.wisdom - stats2.wisdom) > 45) {
    totalPenalty += 25;
    conflicts.push('Intelligence frustration');
  }

  // Stealth mismatch: Different styles (lowered threshold)
  if (Math.abs(stats1.stealth - stats2.stealth) > 50) {
    totalPenalty += 30;
    conflicts.push('Stealth philosophy clash');
  }

  // Low resolve = unstable (raised threshold to catch more)
  if (stats1.resolve < 50 || stats2.resolve < 50) {
    totalPenalty += 20;
    conflicts.push('Instability issues');
  }

  // NEW: Any stat over 85 = diva problems
  const highStats1 = Object.values(stats1).filter((stat) => stat > 85).length;
  const highStats2 = Object.values(stats2).filter((stat) => stat > 85).length;
  if (highStats1 > 0 && highStats2 > 0) {
    totalPenalty += 25;
    conflicts.push('Dual perfectionist clash');
  }

  // BONUSES for rare good combinations
  let bonuses = 0;

  // Perfect complement: high/low pairs that work
  if (
    (stats1.wisdom > 80 && stats2.resolve > 80) ||
    (stats2.wisdom > 80 && stats1.resolve > 80)
  ) {
    bonuses += 20;
  }

  // Balanced energy (not too high, not too low, close together)
  const avgEnergy =
    (stats1.agility + stats1.boldness + stats2.agility + stats2.boldness) / 4;
  if (avgEnergy > 40 && avgEnergy < 70 && energyDiff < 30) {
    bonuses += 15;
  }

  // Calculate final score - start very pessimistic
  let baseScore = 50; // Much lower starting point
  baseScore -= totalPenalty;
  baseScore += bonuses;

  // Extra penalty for multiple conflicts (more aggressive)
  if (conflicts.length >= 3) {
    baseScore -= 25; // Multiple issues = total disaster
  } else if (conflicts.length >= 2) {
    baseScore -= 15; // Two conflicts = major problems
  }

  // Random chaos factor - sometimes pets just don't click
  if (conflicts.length > 0 && Math.random() < 0.3) {
    baseScore -= 10; // Sometimes it's just worse
  }

  const overallScore = Math.max(8, Math.min(95, Math.round(baseScore)));

  return {
    overallScore,
    energyMatch: Math.max(10, 80 - Math.round(energyDiff * 0.8)),
    socialBalance: Math.max(
      10,
      80 -
        conflicts.filter((c) => c.includes('diva') || c.includes('Alpha'))
          .length *
          30
    ),
    conflicts,
  };
}
