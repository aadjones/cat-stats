import { useState, useEffect } from 'react';
import type { PhaseComponentProps } from '../types';

export function PassivePhase({
  characterSheet,
  isActive,
  isVisible,
}: PhaseComponentProps) {
  const { characterData } = characterSheet;
  const [currentTrait, setCurrentTrait] = useState<number>(0);
  const [showModifiers, setShowModifiers] = useState<number>(0);

  // Two-part animation: show each passive trait for 3 seconds
  useEffect(() => {
    if (!isActive) {
      setCurrentTrait(0);
      setShowModifiers(0);
      return;
    }

    // Show first trait immediately
    setCurrentTrait(1);

    // Show first trait modifiers after 3 seconds
    const modifier1Timer = setTimeout(() => {
      setShowModifiers(1);
    }, 3000);

    // Show second trait after 6 seconds
    const trait2Timer = setTimeout(() => {
      setCurrentTrait(2);
      setShowModifiers(1); // Reset modifiers
    }, 6000);

    // Show second trait modifiers after 9 seconds
    const modifier2Timer = setTimeout(() => {
      setShowModifiers(2);
    }, 9000);

    return () => {
      clearTimeout(modifier1Timer);
      clearTimeout(trait2Timer);
      clearTimeout(modifier2Timer);
    };
  }, [isActive]);

  if (!isVisible) return null;

  // Get the passive traits (ensure we have at least 2)
  const passiveTraits = characterData.passiveTraits.slice(0, 2);

  return (
    <div
      className={`passive-section ${isActive ? 'animate-in' : 'visible'} mb-4`}
    >
      <div className="text-center mb-6">
        <h3 className="text-white text-xl font-bold">Passive Traits</h3>
      </div>

      <div
        className="space-y-4 max-w-sm mx-auto"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {passiveTraits.map((trait, index) => {
          const traitNumber = index + 1;
          const isVisible = currentTrait >= traitNumber;
          const isCurrentTrait = currentTrait === traitNumber;

          return (
            <div
              key={trait.name}
              className={`
                passive-trait 
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                ${isCurrentTrait ? 'scale-105 ring-2 ring-purple-400/50' : 'scale-100'}
                transition-all duration-800 ease-out
                bg-purple-900/30 border border-purple-600/40 rounded-lg p-4
              `}
            >
              <div className="text-purple-300 font-bold text-base mb-2 text-center">
                🔮 {trait.name}
              </div>
              <div className="text-white/90 text-sm text-center leading-relaxed">
                {trait.description}
              </div>
              <div
                className={`
                text-purple-400/60 text-xs text-center mt-2 transition-all duration-500
                ${showModifiers >= traitNumber ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
              >
                {trait.stats}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            currentTrait >= 1 ? 'bg-purple-400' : 'bg-white/20'
          }`}
        />
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            currentTrait >= 2 ? 'bg-purple-400' : 'bg-white/20'
          }`}
        />
      </div>
    </div>
  );
}
