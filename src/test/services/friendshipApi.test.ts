import {
  validateFriendshipInput,
  getCharacterDisplayNames,
} from '../../services/api/friendshipApi';
import type { CharacterSheet } from '../../core/personality/types';

describe('Friendship API Service', () => {
  const mockCharacter1: CharacterSheet = {
    petName: 'Fluffy',
    stats: {
      wisdom: 70,
      cunning: 60,
      agility: 80,
      stealth: 50,
      charisma: 75,
      resolve: 65,
      boldness: 70,
    },
    characterData: {
      archetype: 'The Playful Hunter',
      combatMoves: [],
      environmentalPowers: [],
      socialSkills: [],
      passiveTraits: [],
      weakness: {
        name: 'Laser Pointer',
        description: 'Cannot resist red dots',
      },
      timeModifiers: [],
    },
    petPhoto: null,
  };

  const mockCharacter2: CharacterSheet = {
    ...mockCharacter1,
    petName: 'Shadow',
    characterData: {
      ...mockCharacter1.characterData,
      archetype: 'The Silent Watcher',
    },
  };

  describe('validateFriendshipInput', () => {
    test('accepts two different character objects', () => {
      const result = validateFriendshipInput(mockCharacter1, mockCharacter2);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    test('accepts two different character IDs', () => {
      const result = validateFriendshipInput('char1', 'char2');

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    test('rejects missing first character', () => {
      const result = validateFriendshipInput(
        null as unknown as CharacterSheet,
        mockCharacter2
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Both characters are required to generate a friendship report'
      );
    });

    test('rejects missing second character', () => {
      const result = validateFriendshipInput(
        mockCharacter1,
        null as unknown as CharacterSheet
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Both characters are required to generate a friendship report'
      );
    });

    test('rejects identical character IDs', () => {
      const result = validateFriendshipInput('same_id', 'same_id');

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please select two different characters for the friendship report'
      );
    });

    test('rejects identical character objects', () => {
      const identicalChar = { ...mockCharacter1 };
      const result = validateFriendshipInput(mockCharacter1, identicalChar);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please select two different characters for the friendship report'
      );
    });

    test('accepts mixed character object and ID', () => {
      const result = validateFriendshipInput(mockCharacter1, 'char2');

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });
  });

  describe('getCharacterDisplayNames', () => {
    test('extracts names from character objects', () => {
      const [name1, name2] = getCharacterDisplayNames(
        mockCharacter1,
        mockCharacter2
      );

      expect(name1).toBe('Fluffy');
      expect(name2).toBe('Shadow');
    });

    test('formats character IDs for display', () => {
      const [name1, name2] = getCharacterDisplayNames('abc123', 'def456');

      expect(name1).toBe('Character abc123');
      expect(name2).toBe('Character def456');
    });

    test('handles mixed character object and ID', () => {
      const [name1, name2] = getCharacterDisplayNames(mockCharacter1, 'xyz789');

      expect(name1).toBe('Fluffy');
      expect(name2).toBe('Character xyz789');
    });
  });
});
