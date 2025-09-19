import { useState, useEffect } from 'react';
import type { StoredCharacter } from '../../services/characterStorage';
import { loadCharacter } from '../../services/characterStorage';
import { AnimatedShareCard } from '../Results/AnimatedShareCard';
import { getColorTheme } from '../../services';

export function CharacterSheetPreview() {
  const [character, setCharacter] = useState<StoredCharacter | null>(null);

  useEffect(() => {
    loadCharacter('sente1').then(setCharacter);
  }, []);

  if (!character) {
    return (
      <div className="mx-auto flex flex-col items-center">
        <div style={{ width: '270px', height: '360px' }}>
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl shadow-2xl flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const theme = getColorTheme(character.stats);

  return (
    <div className="mx-auto flex flex-col items-center">
      <div
        style={{
          transform: 'scale(0.75)',
          transformOrigin: 'center center',
          width: '360px',
          height: '480px',
        }}
      >
        <AnimatedShareCard
          characterSheet={character}
          theme={theme}
          onAnimationComplete={() => {}}
        />
      </div>
    </div>
  );
}
