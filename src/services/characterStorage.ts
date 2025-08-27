import type { CharacterSheet } from '../core/personality/types';

export interface StoredCharacter extends CharacterSheet {
  id: string;
  created: string;
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

    return await response.json();
  } catch (error) {
    console.error('Error loading character:', error);
    return null;
  }
}

export function getCharacterShareUrl(id: string): string {
  // Use production domain, fallback to current origin for development
  const baseUrl = import.meta.env.PROD
    ? 'https://cat-stats-six.vercel.app'
    : window.location.origin;
  return `${baseUrl}/legend/${id}`;
}
