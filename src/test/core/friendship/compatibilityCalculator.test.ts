import { calculateCompatibility } from '../../../core/friendship/compatibilityCalculator';
import type { CharacterSheet, PetStats } from '../../../core/personality/types';

describe('Compatibility Calculator', () => {
  // Create test character sheets
  const createTestCharacter = (
    name: string,
    stats: PetStats,
    combatMoves: Array<{ name: string; description: string }> = [],
    weaknessDescription = 'Test weakness'
  ): CharacterSheet => ({
    petName: name,
    stats,
    characterData: {
      archetype: 'Test Archetype',
      combatMoves: combatMoves.map((m) => ({
        ...m,
        stats: 'Test • 100% • Instant',
      })),
      environmentalPowers: [],
      socialSkills: [],
      passiveTraits: [],
      weakness: {
        name: 'Test Weakness',
        description: weaknessDescription,
      },
      timeModifiers: [],
    },
    petPhoto: null,
  });

  const highEnergyStats: PetStats = {
    wisdom: 60,
    cunning: 70,
    agility: 90,
    stealth: 50,
    charisma: 80,
    resolve: 70,
    boldness: 85,
  };

  const lowEnergyStats: PetStats = {
    wisdom: 80,
    cunning: 60,
    agility: 30,
    stealth: 90,
    charisma: 40,
    resolve: 85,
    boldness: 25,
  };

  const balancedStats: PetStats = {
    wisdom: 70,
    cunning: 65,
    agility: 60,
    stealth: 65,
    charisma: 70,
    resolve: 75,
    boldness: 55,
  };

  describe('calculateCompatibility', () => {
    test('returns compatibility score between 0 and 100', () => {
      const char1 = createTestCharacter('Fluffy', highEnergyStats);
      const char2 = createTestCharacter('Shadow', lowEnergyStats);

      const result = calculateCompatibility(char1, char2);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    test('similar energy levels result in higher compatibility', () => {
      const char1 = createTestCharacter('Active1', highEnergyStats);
      const char2 = createTestCharacter('Active2', {
        ...highEnergyStats,
        charisma: 75,
      });

      const char3 = createTestCharacter('Calm', lowEnergyStats);

      const similarEnergyResult = calculateCompatibility(char1, char2);
      const differentEnergyResult = calculateCompatibility(char1, char3);

      expect(similarEnergyResult.statCompatibility.energyMatch).toBeGreaterThan(
        differentEnergyResult.statCompatibility.energyMatch
      );
    });

    test('moderate charisma differences create good social balance', () => {
      const char1 = createTestCharacter('Outgoing', {
        ...balancedStats,
        charisma: 80,
      });
      const char2 = createTestCharacter('Reserved', {
        ...balancedStats,
        charisma: 60,
      });

      const result = calculateCompatibility(char1, char2);

      expect(result.statCompatibility.socialBalance).toBeGreaterThan(50);
    });

    test('extreme charisma differences reduce social balance', () => {
      const char1 = createTestCharacter('SuperOutgoing', {
        ...balancedStats,
        charisma: 95,
      });
      const char2 = createTestCharacter('VeryReserved', {
        ...balancedStats,
        charisma: 20,
      });

      const result = calculateCompatibility(char1, char2);

      expect(result.statCompatibility.socialBalance).toBeLessThan(50);
    });

    test('detects complementary strengths', () => {
      const char1 = createTestCharacter('Wise', {
        ...balancedStats,
        wisdom: 90,
        agility: 30,
      });
      const char2 = createTestCharacter('Agile', {
        ...balancedStats,
        wisdom: 40,
        agility: 85,
      });

      const result = calculateCompatibility(char1, char2);

      expect(
        result.statCompatibility.complementaryStrengths.length
      ).toBeGreaterThan(0);
      expect(
        result.statCompatibility.complementaryStrengths.some(
          (s) => s.includes('wisdom') || s.includes('agility')
        )
      ).toBe(true);
    });

    test('identifies personality clashes from high boldness', () => {
      const char1 = createTestCharacter('Bold1', {
        ...balancedStats,
        boldness: 90,
      });
      const char2 = createTestCharacter('Bold2', {
        ...balancedStats,
        boldness: 85,
      });

      const result = calculateCompatibility(char1, char2);

      expect(result.statCompatibility.personalityClash).toBeGreaterThan(0);
    });

    test('detects combat move synergies', () => {
      const char1 = createTestCharacter('Stealth', balancedStats, [
        {
          name: 'Silent Strike',
          description: 'A stealthy attack from the shadows',
        },
      ]);
      const char2 = createTestCharacter('Distractor', balancedStats, [
        {
          name: 'Loud Distraction',
          description: 'Creates noise to distract enemies',
        },
      ]);

      const result = calculateCompatibility(char1, char2);

      expect(result.abilitySync.synergies.length).toBeGreaterThan(0);
    });

    test('detects ability conflicts', () => {
      const char1 = createTestCharacter('Loud', balancedStats, [
        {
          name: 'Thunder Roar',
          description: 'Makes very loud aggressive noise',
        },
      ]);
      const char2 = createTestCharacter('Stealth', balancedStats, [
        {
          name: 'Silent Mode',
          description: 'Maintains complete stealth and quiet',
        },
      ]);

      const result = calculateCompatibility(char1, char2);

      expect(result.abilitySync.conflicts.length).toBeGreaterThan(0);
    });

    test('identifies territory conflicts for high boldness pets', () => {
      const char1 = createTestCharacter('Territorial1', {
        ...balancedStats,
        boldness: 85,
      });
      const char2 = createTestCharacter('Territorial2', {
        ...balancedStats,
        boldness: 80,
      });

      const result = calculateCompatibility(char1, char2);

      const territoryConflicts = result.conflictAreas.filter(
        (c) => c.area === 'Territory'
      );
      expect(territoryConflicts.length).toBeGreaterThan(0);
    });

    test('identifies attention conflicts for high charisma pets', () => {
      const char1 = createTestCharacter('Charismatic1', {
        ...balancedStats,
        charisma: 85,
      });
      const char2 = createTestCharacter('Charismatic2', {
        ...balancedStats,
        charisma: 80,
      });

      const result = calculateCompatibility(char1, char2);

      const attentionConflicts = result.conflictAreas.filter(
        (c) => c.area === 'Attention'
      );
      expect(attentionConflicts.length).toBeGreaterThan(0);
    });

    test('predicts instant friendship for high charisma similar pets', () => {
      const char1 = createTestCharacter('Friendly1', {
        ...balancedStats,
        charisma: 85,
      });
      const char2 = createTestCharacter('Friendly2', {
        ...balancedStats,
        charisma: 80,
      });

      const result = calculateCompatibility(char1, char2);

      expect(result.scenarios.firstMeeting).toBe('Instant Friends');
    });

    test('predicts cautious meeting for high stealth with low charisma pets', () => {
      const char1 = createTestCharacter('Sneaky1', {
        ...balancedStats,
        stealth: 90,
        charisma: 30, // Low charisma to avoid "Gradual Warming"
      });
      const char2 = createTestCharacter('Sneaky2', {
        ...balancedStats,
        stealth: 85,
        charisma: 35, // Low charisma
      });

      const result = calculateCompatibility(char1, char2);

      expect(result.scenarios.firstMeeting).toBe('Cautious');
    });

    test('calculates living space compatibility', () => {
      const char1 = createTestCharacter('Peaceful1', {
        ...balancedStats,
        boldness: 40,
      });
      const char2 = createTestCharacter('Peaceful2', {
        ...balancedStats,
        boldness: 35,
      });

      const result = calculateCompatibility(char1, char2);

      expect(result.scenarios.livingSpace).toBeGreaterThan(50);
    });

    test('predicts mutual support for high resolve pets', () => {
      const char1 = createTestCharacter('Stable1', {
        ...balancedStats,
        resolve: 85,
      });
      const char2 = createTestCharacter('Stable2', {
        ...balancedStats,
        resolve: 80,
      });

      const result = calculateCompatibility(char1, char2);

      expect(result.scenarios.stressResponse).toBe('Mutual Support');
    });

    test('predicts amplified chaos for low resolve pets', () => {
      const char1 = createTestCharacter('Anxious1', {
        ...balancedStats,
        resolve: 30,
      });
      const char2 = createTestCharacter('Anxious2', {
        ...balancedStats,
        resolve: 25,
      });

      const result = calculateCompatibility(char1, char2);

      expect(result.scenarios.stressResponse).toBe('Amplified Chaos');
    });

    test('handles edge case of identical stats', () => {
      const char1 = createTestCharacter('Twin1', balancedStats);
      const char2 = createTestCharacter('Twin2', balancedStats);

      const result = calculateCompatibility(char1, char2);

      expect(result.overallScore).toBeGreaterThan(70); // Should be highly compatible
      expect(result.statCompatibility.energyMatch).toBeGreaterThan(90);
    });

    test('includes all required compatibility components', () => {
      const char1 = createTestCharacter('Test1', highEnergyStats);
      const char2 = createTestCharacter('Test2', lowEnergyStats);

      const result = calculateCompatibility(char1, char2);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('statCompatibility');
      expect(result).toHaveProperty('abilitySync');
      expect(result).toHaveProperty('conflictAreas');
      expect(result).toHaveProperty('scenarios');

      expect(Array.isArray(result.abilitySync.synergies)).toBe(true);
      expect(Array.isArray(result.abilitySync.conflicts)).toBe(true);
      expect(Array.isArray(result.conflictAreas)).toBe(true);
    });
  });
});
