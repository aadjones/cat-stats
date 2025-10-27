import type { CharacterSheet, CharacterData } from '../core/personality/types';

export interface StoredCharacter extends CharacterSheet {
  id: string;
  created: string;
}

/**
 * Migrate legacy character data to include type discriminator
 * Old characters don't have 'type' field, so we infer it from structure
 */
function migrateLegacyCharacterData(data: unknown): CharacterData {
  // Ensure data is an object
  if (typeof data !== 'object' || data === null) {
    return data as CharacterData;
  }

  const obj = data as Record<string, unknown>;

  // If it already has a type field, no migration needed
  if (obj.type === 'rpg' || obj.type === 'yearbook') {
    return data as CharacterData;
  }

  // Detect legacy RPG data: has combatMoves but no type
  if ('combatMoves' in obj && Array.isArray(obj.combatMoves)) {
    return {
      ...obj,
      type: 'rpg',
    } as CharacterData;
  }

  // Detect legacy yearbook data: has superlatives but no type
  if ('superlatives' in obj && Array.isArray(obj.superlatives)) {
    return {
      ...obj,
      type: 'yearbook',
    } as CharacterData;
  }

  // Return as-is if we can't detect type (will be validated later)
  return data as CharacterData;
}

export function generateCharacterId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function saveCharacter(
  characterSheet: CharacterSheet
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const id = generateCharacterId();
    const storedCharacter: StoredCharacter = {
      ...characterSheet,
      id,
      created: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/save-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storedCharacter),
      });

      if (response.status === 409) {
        // ID collision, try again
        attempts++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Failed to save character: ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error saving character:', error);
      throw error;
    }
  }

  throw new Error(
    'Failed to generate unique character ID after multiple attempts'
  );
}

export async function loadCharacter(
  id: string
): Promise<StoredCharacter | null> {
  try {
    const response = await fetch(`/api/character/${id}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to load character: ${response.statusText}`);
    }

    const character = await response.json();

    // Migrate legacy character data that doesn't have type field
    if (character && character.characterData) {
      character.characterData = migrateLegacyCharacterData(
        character.characterData
      );
    }

    return character;
  } catch (error) {
    console.error('Error loading character:', error);
    return null;
  }
}

export function getCharacterShareUrl(id: string): string {
  // Always use production domain for sharing
  // In development, shared characters work locally anyway
  const baseUrl = 'https://cat-stats-six.vercel.app';
  return `${baseUrl}/legend/${id}`;
}
