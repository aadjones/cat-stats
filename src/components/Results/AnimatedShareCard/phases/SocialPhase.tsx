import { useState, useEffect, useMemo } from 'react';
import type { PhaseComponentProps } from '../types';

export function SocialPhase({
  characterSheet,
  isActive,
  isVisible,
}: PhaseComponentProps) {
  const { characterData } = characterSheet;
  const [showSkill, setShowSkill] = useState<boolean>(false);
  const [showModifiers, setShowModifiers] = useState<boolean>(false);

  // Randomly select one social skill
  const selectedSkill = useMemo(() => {
    if (!characterData.socialSkills.length) return null;
    const randomIndex = Math.floor(
      Math.random() * characterData.socialSkills.length
    );
    return characterData.socialSkills[randomIndex];
  }, [characterData.socialSkills]);

  // Single skill animation: 4s display + 2s pause
  useEffect(() => {
    if (!isActive) {
      setShowSkill(false);
      setShowModifiers(false);
      return;
    }

    // Show skill immediately
    setShowSkill(true);

    // Show modifiers after 2 seconds
    const modifierTimer = setTimeout(() => {
      setShowModifiers(true);
    }, 2000);

    return () => {
      clearTimeout(modifierTimer);
    };
  }, [isActive]);

  if (!isVisible || !selectedSkill) return null;

  return (
    <div
      className={`social-section ${isActive ? 'animate-in' : 'visible'} mb-4`}
    >
      <div className="text-center mb-6">
        <h3 className="text-white text-xl font-bold">Social Skills</h3>
      </div>

      <div className="max-w-sm mx-auto">
        <div
          className={`
            social-skill 
            ${showSkill ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'} 
            transition-all duration-800 ease-out
            bg-yellow-900/30 border border-yellow-600/40 rounded-lg p-4
          `}
        >
          <div className="text-yellow-300 font-bold text-base mb-2 text-center">
            💬 {selectedSkill.name}
          </div>
          <div className="text-white/90 text-sm text-center leading-relaxed">
            {selectedSkill.description}
          </div>
          <div
            className={`
            text-yellow-400/60 text-xs text-center mt-2 transition-all duration-500
            ${showModifiers ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}
          >
            {selectedSkill.stats}
          </div>
        </div>
      </div>
    </div>
  );
}
