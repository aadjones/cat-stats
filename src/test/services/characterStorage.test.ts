import {
  generateCharacterId,
  getCharacterShareUrl,
} from '../../services/characterStorage';

// Mock window.location for URL generation tests
const mockLocation = {
  origin: 'https://cat-stats-six.vercel.app',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('Character Storage Utilities', () => {
  describe('generateCharacterId', () => {
    test('generates ID with correct length', () => {
      const id = generateCharacterId();
      expect(id).toHaveLength(6);
    });

    test('generates ID with only valid characters', () => {
      const id = generateCharacterId();
      expect(id).toMatch(/^[a-z0-9]{6}$/);
    });

    test('generates unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateCharacterId());
      }
      // Should be very likely to have 100 unique IDs with 6-char alphanumeric
      expect(ids.size).toBeGreaterThan(95);
    });
  });

  describe('getCharacterShareUrl', () => {
    test('generates correct share URL format', () => {
      const id = 'abc123';
      const url = getCharacterShareUrl(id);
      expect(url).toBe('https://cat-stats-six.vercel.app/legend/abc123');
    });

    test('handles different IDs correctly', () => {
      const testIds = ['a1b2c3', 'xyz789', '000aaa'];
      testIds.forEach((id) => {
        const url = getCharacterShareUrl(id);
        expect(url).toBe(`https://cat-stats-six.vercel.app/legend/${id}`);
      });
    });
  });
});
