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

// Generate cache key from inputs (Unicode-safe)
function generateCacheKey(petName: string, answers: UserAnswers): string {
  const answerString = JSON.stringify(answers, Object.keys(answers).sort());

  try {
    // Try original btoa first for backward compatibility with existing ASCII cache keys
    const encoded = btoa(answerString);
    return `${petName.toLowerCase().trim()}-${encoded.slice(0, 20)}`;
  } catch {
    // Fallback for Unicode characters: escape non-Latin1 chars then encode
    const latin1Safe = answerString.replace(/[^\x20-\xFF]/g, function (match) {
      return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
    });

    try {
      const encoded = btoa(latin1Safe);
      return `${petName.toLowerCase().trim()}-u${encoded.slice(0, 19)}`; // 'u' prefix indicates Unicode fallback
    } catch {
      // Final fallback: use hash-based approach for very long escaped strings
      let hash = 5381;
      for (let i = 0; i < answerString.length; i++) {
        hash = (hash << 5) + hash + answerString.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
      return `${petName.toLowerCase().trim()}-h${Math.abs(hash).toString(36).slice(0, 11)}`; // 'h' prefix indicates hash fallback
    }
  }
}

// Retry configuration - conservative timing to avoid rate limits
const RETRY_CONFIG = {
  maxAttempts: 3,
  delays: [0, 2000, 5000], // 0ms, 2s, 5s - conservative spacing
  retryableErrors: [
    'fetch', // Network errors
    '503', // Service unavailable
    '502', // Bad gateway
    '504', // Gateway timeout
    'timeout', // Request timeout
  ],
};

// Check if error should trigger retry
function shouldRetry(error: unknown, attempt: number): boolean {
  if (attempt >= RETRY_CONFIG.maxAttempts) return false;

  const errorString = String(error).toLowerCase();
  return RETRY_CONFIG.retryableErrors.some((retryableError) =>
    errorString.includes(retryableError)
  );
}

// Sleep helper for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  // Retry loop with conservative delays
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      // Add delay before retry (except first attempt)
      if (attempt > 1) {
        logger.info(
          `Retrying character generation, attempt ${attempt}/${RETRY_CONFIG.maxAttempts}`
        );
        await sleep(RETRY_CONFIG.delays[attempt - 1]);
      }

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

      // Handle rate limiting (429) - don't retry, respect our own rate limiter
      if (response.status === 429) {
        logger.warn('Rate limited by API');
        return {
          success: false,
          error: 'Too many requests. Please wait a moment before trying again.',
        };
      }

      if (!response.ok) {
        const error = data.error?.message || `API Error: ${response.status}`;
        logger.error('API Error Response:', data);

        // Check if we should retry this error
        if (shouldRetry(response.status, attempt)) {
          continue; // Try again
        }

        return {
          success: false,
          error,
        };
      }

      if (!data.content || !data.content[0]) {
        logger.error('Unexpected API Response:', data);

        // Malformed response might be temporary, retry
        if (shouldRetry('malformed response', attempt)) {
          continue; // Try again
        }

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

        // Parsing errors might be due to incomplete response, retry
        if (shouldRetry('parsing error', attempt)) {
          continue; // Try again
        }

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

      // Log successful retry
      if (attempt > 1) {
        logger.info(`Character generation succeeded on attempt ${attempt}`);
      }

      return result;
    } catch (error) {
      logger.error(`Character generation attempt ${attempt} failed:`, error);

      // Check if we should retry this error
      if (shouldRetry(error, attempt)) {
        continue; // Try again
      }

      // Final attempt or non-retryable error
      return {
        success: false,
        error:
          "Sorry, there was an error generating your pet's character sheet. Please try again.",
      };
    }
  }

  // This should never be reached, but just in case
  return {
    success: false,
    error:
      "Sorry, there was an error generating your pet's character sheet. Please try again.",
  };
}
