import { useState, useEffect, useMemo } from 'react';
import type { PhaseComponentProps } from '../types';

export function EnvironmentalPhase({
  characterSheet,
  isActive,
  isVisible,
}: PhaseComponentProps) {
  const { characterData } = characterSheet;
  const [showPower, setShowPower] = useState<boolean>(false);
  const [showModifiers, setShowModifiers] = useState<boolean>(false);

  // Randomly select one environmental power
  const selectedPower = useMemo(() => {
    if (!characterData.environmentalPowers.length) return null;
    const randomIndex = Math.floor(
      Math.random() * characterData.environmentalPowers.length
    );
    return characterData.environmentalPowers[randomIndex];
  }, [characterData.environmentalPowers]);

  // Single power animation: 4s display + 2s pause
  useEffect(() => {
    if (!isActive) {
      setShowPower(false);
      setShowModifiers(false);
      return;
    }

    // Show power immediately
    setShowPower(true);

    // Show modifiers after 2 seconds
    const modifierTimer = setTimeout(() => {
      setShowModifiers(true);
    }, 2000);

    return () => {
      clearTimeout(modifierTimer);
    };
  }, [isActive]);

  if (!isVisible || !selectedPower) return null;

  return (
    <div
      className={`environmental-section ${isActive ? 'animate-in' : 'visible'} mb-4`}
    >
      <div className="text-center mb-6">
        <h3 className="text-white text-xl font-bold">Environmental Powers</h3>
      </div>

      <div className="max-w-sm mx-auto">
        <div
          className={`
            environmental-power 
            ${showPower ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'} 
            transition-all duration-800 ease-out
            bg-cyan-900/30 border border-cyan-600/40 rounded-lg p-4
          `}
        >
          <div className="text-cyan-300 font-bold text-base mb-2 text-center">
            🌿 {selectedPower.name}
          </div>
          <div className="text-white/90 text-sm text-center leading-relaxed">
            {selectedPower.description}
          </div>
          <div
            className={`
            text-cyan-400/60 text-xs text-center mt-2 transition-all duration-500
            ${showModifiers ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}
          >
            {selectedPower.stats}
          </div>
        </div>
      </div>
    </div>
  );
}
