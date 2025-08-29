import { useState, useEffect } from 'react';
import type { PhaseComponentProps } from '../types';

export function CombatPhase({ 
  characterSheet, 
  isActive, 
  isVisible 
}: PhaseComponentProps) {
  const { characterData } = characterSheet;
  const [currentMove, setCurrentMove] = useState<number>(0);
  const [showModifiers, setShowModifiers] = useState<number>(0);

  // Two-part animation: show each combat move for 3 seconds
  useEffect(() => {
    if (!isActive) {
      setCurrentMove(0);
      setShowModifiers(0);
      return;
    }

    // Show first move immediately
    setCurrentMove(1);
    
    // Show first move modifiers after 1.5 seconds
    const modifier1Timer = setTimeout(() => {
      setShowModifiers(1);
    }, 1500);

    // Show second move after 3 seconds
    const move2Timer = setTimeout(() => {
      setCurrentMove(2);
      setShowModifiers(1); // Reset modifiers
    }, 3000);

    // Show second move modifiers after 4.5 seconds
    const modifier2Timer = setTimeout(() => {
      setShowModifiers(2);
    }, 4500);

    return () => {
      clearTimeout(modifier1Timer);
      clearTimeout(move2Timer);
      clearTimeout(modifier2Timer);
    };
  }, [isActive]);

  if (!isVisible) return null;

  // Get the combat moves (ensure we have at least 2)
  const combatMoves = characterData.combatMoves.slice(0, 2);

  return (
    <div className={`combat-section ${isActive ? 'animate-in' : 'visible'} mb-4`}>
      <div className="text-center mb-6">
        <h3 className="text-white text-xl font-bold">Combat Arsenal</h3>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        {combatMoves.map((move, index) => {
          const moveNumber = index + 1;
          const isVisible = currentMove >= moveNumber;
          const isCurrentMove = currentMove === moveNumber;
          
          return (
            <div
              key={move.name}
              className={`
                combat-move 
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                ${isCurrentMove ? 'scale-105 ring-2 ring-red-400/50' : 'scale-100'}
                transition-all duration-800 ease-out
                bg-red-900/30 border border-red-600/40 rounded-lg p-4
              `}
            >
              <div className="text-red-300 font-bold text-base mb-2 text-center">
                ⚔️ {move.name}
              </div>
              <div className="text-white/90 text-sm text-center leading-relaxed">
                {move.description}
              </div>
              <div className={`
                text-red-400/60 text-xs text-center mt-2 transition-all duration-500
                ${showModifiers >= moveNumber ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}>
                {move.stats}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
          currentMove >= 1 ? 'bg-red-400' : 'bg-white/20'
        }`} />
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
          currentMove >= 2 ? 'bg-red-400' : 'bg-white/20'
        }`} />
      </div>
    </div>
  );
}
