import type { CharacterSheet } from '../../core/personality/types';
import type { FriendshipReport } from '../../core/friendship/types';

export const FRIENDSHIP_LOADING_MESSAGES = [
  'Analyzing pet personalities... 🐱🐶',
  'Calculating compatibility scores... 💕',
  'Predicting first meeting scenarios... 👋',
  'Imagining living dynamics... 🏠',
  'Generating friendship report... 📋',
];

export interface FriendshipGenerationResult {
  success: boolean;
  friendshipReport?: FriendshipReport;
  error?: string;
}

export async function generateFriendshipReport(
  character1: CharacterSheet | string, // Full object or ID
  character2: CharacterSheet | string // Full object or ID
): Promise<FriendshipReport> {
  try {
    const response = await fetch('/api/friendship-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        character1,
        character2,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Friendship API Error Response:', data);
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    // Validate the response has required fields
    if (
      !data.overallScore ||
      !data.relationshipDynamic ||
      !data.signatureClash ||
      !data.finalVerdict ||
      !data.expandableSections
    ) {
      console.error('Invalid friendship report response:', data);
      throw new Error('Invalid friendship report format received');
    }

    return data;
  } catch (error) {
    console.error('Error generating friendship report:', error);
    throw error instanceof Error
      ? error
      : new Error(
          'Sorry, there was an error generating the friendship report. Please try again.'
        );
  }
}

/**
 * Validate that two characters are different and complete
 */
export function validateFriendshipInput(
  char1: CharacterSheet | string,
  char2: CharacterSheet | string
): { isValid: boolean; errorMessage?: string } {
  // Check that both characters are provided
  if (!char1 || !char2) {
    return {
      isValid: false,
      errorMessage:
        'Both characters are required to generate a friendship report',
    };
  }

  // If both are character objects, check they're different
  if (typeof char1 === 'object' && typeof char2 === 'object') {
    if (
      char1.petName === char2.petName &&
      char1.characterData.archetype === char2.characterData.archetype
    ) {
      return {
        isValid: false,
        errorMessage:
          'Please select two different characters for the friendship report',
      };
    }
  }

  // If both are IDs, check they're different
  if (typeof char1 === 'string' && typeof char2 === 'string') {
    if (char1 === char2) {
      return {
        isValid: false,
        errorMessage:
          'Please select two different characters for the friendship report',
      };
    }
  }

  return { isValid: true };
}

/**
 * Extract character names for display purposes
 */
export function getCharacterDisplayNames(
  char1: CharacterSheet | string,
  char2: CharacterSheet | string
): [string, string] {
  const name1 =
    typeof char1 === 'string' ? `Character ${char1}` : char1.petName;
  const name2 =
    typeof char2 === 'string' ? `Character ${char2}` : char2.petName;
  return [name1, name2];
}
