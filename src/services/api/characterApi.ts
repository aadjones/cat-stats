import type { UserAnswers, CharacterData } from '../../core/personality/types';
import { openEndedQuestions } from '../../core/personality/questions';
import { parseCharacterData } from '../../core/validation/jsonParsing';
import { API_CONFIG } from '../../config/featureFlags';
import { logger } from '../../utils/logger';

export const LOADING_MESSAGES = [
  "Analyzing your pet's personality... 🤔",
  'Calculating combat statistics... ⚔️',
  'Generating unique abilities... ✨',
  'Crafting character sheet... 📝',
  'Adding special touches... 🎨',
  'Almost ready... 🚀',
];

export interface CharacterGenerationResult {
  success: boolean;
  characterData?: CharacterData;
  error?: string;
}

// Simple in-memory cache for API responses (resets on page reload)
const API_CACHE = new Map<string, CharacterGenerationResult>();

// Generate cache key from inputs
function generateCacheKey(petName: string, answers: UserAnswers): string {
  const answerString = JSON.stringify(answers, Object.keys(answers).sort());
  return `${petName.toLowerCase().trim()}-${btoa(answerString).slice(0, 20)}`;
}

export async function generateCharacterData(
  petName: string,
  answers: UserAnswers
): Promise<CharacterGenerationResult> {
  // Check cache first
  const cacheKey = generateCacheKey(petName, answers);
  if (API_CACHE.has(cacheKey)) {
    logger.info('Returning cached character data');
    return API_CACHE.get(cacheKey)!;
  }
  const behavioralInputs = openEndedQuestions
    .map((q) => {
      return `${q.question}: "${answers[q.id] || 'Not specified'}"`;
    })
    .join('\n');

  const stressWeakness = answers.stress_weakness || 'Not specified';

  const prompt = `Generate ONLY the creative content for a pet character sheet. Return your response as valid JSON in this exact format:

{
  "archetype": "The [Creative Archetype Name]",
  "combatMoves": [
    {
      "name": "Ability Name",
      "stats": "Type • Success Rate • Duration",
      "description": "Description of the ability"
    },
    {
      "name": "Second Ability Name", 
      "stats": "Type • Success Rate • Duration",
      "description": "Description of the ability"
    }
  ],
  "environmentalPowers": [
    {
      "name": "Power Name",
      "stats": "Type • Effect • Duration", 
      "description": "Description"
    },
    {
      "name": "Second Power Name",
      "stats": "Type • Effect • Duration",
      "description": "Description"
    }
  ],
  "socialSkills": [
    {
      "name": "Skill Name",
      "stats": "Type • Success Rate • Effect",
      "description": "Description"
    },
    {
      "name": "Second Skill Name",
      "stats": "Type • Success Rate • Effect", 
      "description": "Description"
    }
  ],
  "passiveTraits": [
    {
      "name": "Trait Name",
      "stats": "Type • Always Active • Effect",
      "description": "Description"
    },
    {
      "name": "Second Trait Name",
      "stats": "Type • Always Active • Effect",
      "description": "Description"
    }
  ],
  "weakness": {
    "name": "Weakness Name",
    "description": "Description of the major weakness with game mechanics"
  },
  "timeModifiers": [
    {
      "name": "Time Period or Situation",
      "effect": "Stat changes and effects"
    }
  ]
}

Pet Details:
- Name: ${petName}

Behavioral Input:
${behavioralInputs}
Biggest fear/weakness: "${stressWeakness}"

Create videogame-style abilities based on the pet's behaviors. Make ability names creative and memorable. Include game mechanics in the stats line. Return ONLY valid JSON with no other text.`;

  try {
    const response = await fetch('/api/character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: API_CONFIG.CLAUDE_MODEL,
        max_tokens: 2000,
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
      logger.error('API Error Response:', data);
      return {
        success: false,
        error: data.error?.message || `API Error: ${response.status}`,
      };
    }

    if (!data.content || !data.content[0]) {
      logger.error('Unexpected API Response:', data);
      return {
        success: false,
        error: 'Invalid API response format',
      };
    }

    let jsonContent = data.content[0].text;

    // Clean up potential markdown formatting from API response
    jsonContent = jsonContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Safely parse and validate the character data
    const parseResult = parseCharacterData(jsonContent);

    if (!parseResult.success) {
      logger.error('Character data validation failed:', parseResult.error);
      return {
        success: false,
        error: 'Invalid character data format received from API',
      };
    }

    const result = {
      success: true,
      characterData: parseResult.data,
    };

    // Cache successful result
    API_CACHE.set(cacheKey, result);

    return result;
  } catch (error) {
    logger.error('Error generating character sheet:', error);
    return {
      success: false,
      error:
        "Sorry, there was an error generating your pet's character sheet. Please try again.",
    };
  }
}
