import { getColorTheme } from '../../services/themeService';
import type { PetStats } from '../../core/personality/types';

describe('Theme Service', () => {
  describe('getColorTheme', () => {
    test('returns wisdom theme for highest wisdom stat', () => {
      const stats: PetStats = {
        wisdom: 95,
        cunning: 60,
        agility: 70,
        stealth: 65,
        charisma: 55,
        resolve: 75,
        boldness: 50,
      };

      const theme = getColorTheme(stats);

      expect(theme.accent).toBe('#4F46E5');
      expect(theme.gradient).toBe('from-blue-900 via-indigo-900 to-purple-900');
    });

    test('returns stealth theme for highest stealth stat', () => {
      const stats: PetStats = {
        wisdom: 60,
        cunning: 70,
        agility: 65,
        stealth: 98,
        charisma: 55,
        resolve: 75,
        boldness: 50,
      };

      const theme = getColorTheme(stats);

      expect(theme.accent).toBe('#475569');
      expect(theme.gradient).toBe('from-slate-900 via-gray-900 to-zinc-900');
    });

    test('handles tie by returning first occurrence', () => {
      const stats: PetStats = {
        wisdom: 85,
        cunning: 85, // Same as wisdom
        agility: 70,
        stealth: 65,
        charisma: 55,
        resolve: 75,
        boldness: 50,
      };

      const theme = getColorTheme(stats);

      // Should return wisdom theme since it appears first in the array
      expect(theme.accent).toBe('#4F46E5');
    });

    test('ignores boldness in theme calculation', () => {
      const stats: PetStats = {
        wisdom: 60,
        cunning: 70,
        agility: 65,
        stealth: 55,
        charisma: 50,
        resolve: 75,
        boldness: 99, // Highest stat but should be ignored
      };

      const theme = getColorTheme(stats);

      // Should return resolve theme (75), not boldness
      expect(theme.accent).toBe('#F59E0B');
      expect(theme.gradient).toBe(
        'from-yellow-900 via-amber-900 to-orange-900'
      );
    });

    test('returns correct RGB values for all theme types', () => {
      const themes = [
        { stat: 'wisdom', expectedRgb: '79, 70, 229' },
        { stat: 'cunning', expectedRgb: '5, 150, 105' },
        { stat: 'agility', expectedRgb: '220, 38, 38' },
        { stat: 'charisma', expectedRgb: '236, 72, 153' },
        { stat: 'stealth', expectedRgb: '71, 85, 105' },
        { stat: 'resolve', expectedRgb: '245, 158, 11' },
      ];

      themes.forEach(({ stat, expectedRgb }) => {
        const stats: PetStats = {
          wisdom: stat === 'wisdom' ? 100 : 50,
          cunning: stat === 'cunning' ? 100 : 50,
          agility: stat === 'agility' ? 100 : 50,
          stealth: stat === 'stealth' ? 100 : 50,
          charisma: stat === 'charisma' ? 100 : 50,
          resolve: stat === 'resolve' ? 100 : 50,
          boldness: 50,
        };

        const theme = getColorTheme(stats);
        expect(theme.accentRgb).toBe(expectedRgb);
      });
    });
  });
});
