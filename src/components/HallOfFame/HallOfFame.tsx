import { useState, useEffect } from 'react';
import { loadCharacter } from '../../services/characterStorage';
import { Button } from '../UI/Button';
import { CharacterModal } from './CharacterModal';
import { FEATURED_CHARACTER_IDS } from '../../config/featuredCharacters';

interface CharacterPreview {
  id: string;
  petName: string;
  archetype: string;
  photoUrl?: string | null;
}

const LOADING_MESSAGES = [
  'Summoning legendary felines...',
  'Polishing hall of fame trophies...',
  'Consulting the ancient scrolls...',
  'Gathering tales of heroic cats...',
  'Awakening the champions...',
  'Reading the chronicles of greatness...',
];

export function HallOfFame() {
  const [characters, setCharacters] = useState<CharacterPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadFeaturedCharacters();
    // Track Hall of Fame view
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'hall_of_fame_views' }),
    }).catch((err) => console.error('Failed to track hall of fame view:', err));
  }, []);

  const loadFeaturedCharacters = async () => {
    try {
      setLoading(true);

      // Rotate loading messages every 800ms
      const messageInterval = setInterval(() => {
        setLoadingMessage(
          (prev) =>
            LOADING_MESSAGES[
              (LOADING_MESSAGES.indexOf(prev) + 1) % LOADING_MESSAGES.length
            ]
        );
      }, 800);

      const characterPromises = FEATURED_CHARACTER_IDS.map(loadCharacter);
      const results = await Promise.allSettled(characterPromises);

      const loadedCharacters: CharacterPreview[] = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<
            Awaited<ReturnType<typeof loadCharacter>>
          > => result.status === 'fulfilled' && result.value !== null
        )
        .map((result) => ({
          id: result.value!.id,
          petName: result.value!.petName,
          archetype: result.value!.characterData.archetype,
          photoUrl: result.value!.petPhoto,
        }));

      clearInterval(messageInterval);
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
          background:
            'linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))',
        }}
      >
        <div className="text-text-on-gradient text-center">
          <div className="animate-spin w-12 h-12 border-4 border-text-on-gradient border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-xl font-semibold font-body">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))',
        }}
      >
        <div className="text-text-on-gradient text-center">
          <p className="mb-4 font-body">{error}</p>
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
        background:
          'linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))',
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
          <h1 className="text-4xl font-bold font-display text-text-on-gradient mb-2">
            Hall of Fame
          </h1>
          <p className="text-text-on-gradient/80 font-body">
            Featured legendary pets from our community
          </p>
        </div>

        {characters.length === 0 ? (
          <div className="text-center text-text-on-gradient font-body">
            <p>No featured characters available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => handleCharacterClick(character.id)}
                className="bg-theme-surface border border-theme-border rounded-xl p-6 cursor-pointer hover:bg-theme-surface-alt transition-colors shadow-lg"
              >
                {character.photoUrl && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={character.photoUrl}
                      alt={character.petName}
                      className="w-24 h-24 rounded-full object-cover border-2 border-theme-border"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold font-display text-text-primary text-center mb-2">
                  {character.petName}
                </h3>
                <p className="text-text-secondary font-body text-center">
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
