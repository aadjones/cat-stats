import { useState, useEffect, useMemo } from 'react';
import type { PhaseComponentProps } from '../types';

export function CombatPhase({
  characterSheet,
  isActive,
  isVisible,
}: PhaseComponentProps) {
  const { characterData } = characterSheet;
  const [showMove, setShowMove] = useState<boolean>(false);
  const [showModifiers, setShowModifiers] = useState<boolean>(false);

  // Randomly select one combat move
  const selectedMove = useMemo(() => {
    if (!characterData.combatMoves.length) return null;
    const randomIndex = Math.floor(
      Math.random() * characterData.combatMoves.length
    );
    return characterData.combatMoves[randomIndex];
  }, [characterData.combatMoves]);

  // Single move animation: 4s display + 2s pause
  useEffect(() => {
    if (!isActive) {
      setShowMove(false);
      setShowModifiers(false);
      return;
    }

    // Show move immediately
    setShowMove(true);

    // Show modifiers after 2 seconds
    const modifierTimer = setTimeout(() => {
      setShowModifiers(true);
    }, 2000);

    return () => {
      clearTimeout(modifierTimer);
    };
  }, [isActive]);

  if (!isVisible || !selectedMove) return null;

  return (
    <div
      className={`combat-section ${isActive ? 'animate-in' : 'visible'} mb-4`}
    >
      <div className="text-center mb-6">
        <h3 className="text-white text-xl font-bold">Combat Arsenal</h3>
      </div>

      <div className="max-w-sm mx-auto">
        <div
          className={`
            combat-move 
            ${showMove ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'} 
            transition-all duration-800 ease-out
            bg-red-900/30 border border-red-600/40 rounded-lg p-4
          `}
        >
          <div className="text-red-300 font-bold text-base mb-2 text-center">
            ⚔️ {selectedMove.name}
          </div>
          <div className="text-white/90 text-sm text-center leading-relaxed">
            {selectedMove.description}
          </div>
          <div
            className={`
            text-red-400/60 text-xs text-center mt-2 transition-all duration-500
            ${showModifiers ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}
          >
            {selectedMove.stats}
          </div>
        </div>
      </div>
    </div>
  );
}
