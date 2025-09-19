import { useState, useEffect } from 'react';
import type { StoredCharacter } from '../../services/characterStorage';
import { getColorTheme } from '../../services';
import { AnimatedShareCard } from '../Results/AnimatedShareCard';
import { Button } from '../UI/Button';

interface CharacterModalProps {
  characterId: string | null;
  onClose: () => void;
}

export function CharacterModal({ characterId, onClose }: CharacterModalProps) {
  const [character, setCharacter] = useState<StoredCharacter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!characterId) {
      setCharacter(null);
      return;
    }

    const loadCharacterData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/character/${characterId}`);

        if (response.status === 404) {
          setError('Character not found');
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load character: ${response.statusText}`);
        }

        const characterData = await response.json();
        setCharacter(characterData);
      } catch (err) {
        setError('Failed to load character');
        console.error('Character loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCharacterData();
  }, [characterId]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!characterId) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        <Button
          onClick={onClose}
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 z-10"
        >
          ✕
        </Button>

        {loading && (
          <div className="p-8 text-center text-white">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading character...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-white">
            <p className="mb-4">{error}</p>
          </div>
        )}

        {character && (
          <div className="p-6">
            <AnimatedShareCard
              characterSheet={character}
              theme={getColorTheme(character.stats)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
