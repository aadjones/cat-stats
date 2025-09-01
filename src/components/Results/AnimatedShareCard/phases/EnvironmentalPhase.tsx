import { useState, useEffect } from 'react';
import type { PhaseComponentProps } from '../types';

export function EnvironmentalPhase({
  characterSheet,
  isActive,
  isVisible,
}: PhaseComponentProps) {
  const { characterData } = characterSheet;
  const [currentPower, setCurrentPower] = useState<number>(0);
  const [showModifiers, setShowModifiers] = useState<number>(0);

  // Two-part animation: show each environmental power for 3 seconds
  useEffect(() => {
    if (!isActive) {
      setCurrentPower(0);
      setShowModifiers(0);
      return;
    }

    // Show first power immediately
    setCurrentPower(1);

    // Show first power modifiers after 3 seconds
    const modifier1Timer = setTimeout(() => {
      setShowModifiers(1);
    }, 3000);

    // Show second power after 6 seconds
    const power2Timer = setTimeout(() => {
      setCurrentPower(2);
      setShowModifiers(1); // Reset modifiers
    }, 6000);

    // Show second power modifiers after 9 seconds
    const modifier2Timer = setTimeout(() => {
      setShowModifiers(2);
    }, 9000);

    return () => {
      clearTimeout(modifier1Timer);
      clearTimeout(power2Timer);
      clearTimeout(modifier2Timer);
    };
  }, [isActive]);

  if (!isVisible) return null;

  // Get the environmental powers (ensure we have at least 2)
  const environmentalPowers = characterData.environmentalPowers.slice(0, 2);

  return (
    <div
      className={`environmental-section ${isActive ? 'animate-in' : 'visible'} mb-4`}
    >
      <div className="text-center mb-6">
        <h3 className="text-white text-xl font-bold">Environmental Powers</h3>
      </div>

      <div
        className="space-y-4 max-w-sm mx-auto"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {environmentalPowers.map((power, index) => {
          const powerNumber = index + 1;
          const isVisible = currentPower >= powerNumber;
          const isCurrentPower = currentPower === powerNumber;

          return (
            <div
              key={power.name}
              className={`
                environmental-power 
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                ${isCurrentPower ? 'scale-105 ring-2 ring-cyan-400/50' : 'scale-100'}
                transition-all duration-800 ease-out
                bg-cyan-900/30 border border-cyan-600/40 rounded-lg p-4
              `}
            >
              <div className="text-cyan-300 font-bold text-base mb-2 text-center">
                🌿 {power.name}
              </div>
              <div className="text-white/90 text-sm text-center leading-relaxed">
                {power.description}
              </div>
              <div
                className={`
                text-cyan-400/60 text-xs text-center mt-2 transition-all duration-500
                ${showModifiers >= powerNumber ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
              >
                {power.stats}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            currentPower >= 1 ? 'bg-cyan-400' : 'bg-white/20'
          }`}
        />
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            currentPower >= 2 ? 'bg-cyan-400' : 'bg-white/20'
          }`}
        />
      </div>
    </div>
  );
}
