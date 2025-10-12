import { useState, useEffect } from 'react';
import type { StoredCharacter } from '../../services/characterStorage';
import { loadCharacter } from '../../services/characterStorage';
import { Button } from '../UI/Button';
import { CharacterModal } from './CharacterModal';

interface CharacterPreview {
  id: string;
  petName: string;
  archetype: string;
  photoUrl?: string | null;
}

const FEATURED_CHARACTER_IDS = [
  'us0suh', // Swapped from sente1 since it's used on main page
  'g2rq99',
  'oo035s',
  'ps8raj',
  'q9jqk6',
  'eg8smy',
  'umwqpi',
  'nze8vt',
  '6appoh',
  '9oug8t',
  'sq56qj',
  '7pyi5t',
  'kspziz',
  'svetnf',
  '92rkx5',
];

export function HallOfFame() {
  const [characters, setCharacters] = useState<CharacterPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadFeaturedCharacters();
  }, []);

  const loadFeaturedCharacters = async () => {
    try {
      setLoading(true);
      const characterPromises = FEATURED_CHARACTER_IDS.map(loadCharacter);
      const results = await Promise.allSettled(characterPromises);

      const loadedCharacters: CharacterPreview[] = results
        .filter(
          (result): result is PromiseFulfilledResult<StoredCharacter | null> =>
            result.status === 'fulfilled' && result.value !== null
        )
        .map((result) => ({
          id: result.value!.id,
          petName: result.value!.petName,
          archetype: result.value!.characterData.archetype,
          photoUrl: result.value!.petPhoto,
        }));

      setCharacters(loadedCharacters);
    } catch (err) {
      setError('Failed to load featured characters');
      console.error('Hall of Fame loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterClick = (id: string) => {
    setSelectedCharacterId(id);
  };

  const handleCloseModal = () => {
    setSelectedCharacterId(null);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #581c87, #312e81, #1e3a8a)',
        }}
      >
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading featured characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #581c87, #312e81, #1e3a8a)',
        }}
      >
        <div className="text-white text-center">
          <p className="mb-4">{error}</p>
          <Button onClick={handleBackToHome} variant="primary">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: 'linear-gradient(135deg, #581c87, #312e81, #1e3a8a)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <Button
            onClick={handleBackToHome}
            variant="secondary"
            size="sm"
            className="mb-4"
          >
            ← Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">Hall of Fame</h1>
          <p className="text-white/80">
            Featured legendary pets from our community
          </p>
        </div>

        {characters.length === 0 ? (
          <div className="text-center text-white">
            <p>No featured characters available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => handleCharacterClick(character.id)}
                className="bg-gray-800 border border-gray-600 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition-colors"
                style={{
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                {character.photoUrl && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={character.photoUrl}
                      alt={character.petName}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  {character.petName}
                </h3>
                <p className="text-gray-300 text-center">
                  {character.archetype}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <CharacterModal
        characterId={selectedCharacterId}
        onClose={handleCloseModal}
      />
    </div>
  );
}
