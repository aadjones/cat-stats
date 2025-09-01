import { useState, useEffect } from 'react';
import type { PhaseComponentProps } from '../types';

export function SocialPhase({
  characterSheet,
  isActive,
  isVisible,
}: PhaseComponentProps) {
  const { characterData } = characterSheet;
  const [currentSkill, setCurrentSkill] = useState<number>(0);
  const [showModifiers, setShowModifiers] = useState<number>(0);

  // Two-part animation: show each social skill for 3 seconds
  useEffect(() => {
    if (!isActive) {
      setCurrentSkill(0);
      setShowModifiers(0);
      return;
    }

    // Show first skill immediately
    setCurrentSkill(1);

    // Show first skill modifiers after 2 seconds
    const modifier1Timer = setTimeout(() => {
      setShowModifiers(1);
    }, 2000);

    // Show second skill after 4 seconds
    const skill2Timer = setTimeout(() => {
      setCurrentSkill(2);
      setShowModifiers(1); // Reset modifiers
    }, 4000);

    // Show second skill modifiers after 6 seconds
    const modifier2Timer = setTimeout(() => {
      setShowModifiers(2);
    }, 6000);

    return () => {
      clearTimeout(modifier1Timer);
      clearTimeout(skill2Timer);
      clearTimeout(modifier2Timer);
    };
  }, [isActive]);

  if (!isVisible) return null;

  // Get the social skills (ensure we have at least 2)
  const socialSkills = characterData.socialSkills.slice(0, 2);

  return (
    <div
      className={`social-section ${isActive ? 'animate-in' : 'visible'} mb-4`}
    >
      <div className="text-center mb-6">
        <h3 className="text-white text-xl font-bold">Social Skills</h3>
      </div>

      <div
        className="space-y-4 max-w-sm mx-auto"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {socialSkills.map((skill, index) => {
          const skillNumber = index + 1;
          const isVisible = currentSkill >= skillNumber;
          const isCurrentSkill = currentSkill === skillNumber;

          return (
            <div
              key={skill.name}
              className={`
                social-skill 
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                ${isCurrentSkill ? 'scale-105 ring-2 ring-yellow-400/50' : 'scale-100'}
                transition-all duration-800 ease-out
                bg-yellow-900/30 border border-yellow-600/40 rounded-lg p-4
              `}
            >
              <div className="text-yellow-300 font-bold text-base mb-2 text-center">
                💬 {skill.name}
              </div>
              <div className="text-white/90 text-sm text-center leading-relaxed">
                {skill.description}
              </div>
              <div
                className={`
                text-yellow-400/60 text-xs text-center mt-2 transition-all duration-500
                ${showModifiers >= skillNumber ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
              >
                {skill.stats}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            currentSkill >= 1 ? 'bg-yellow-400' : 'bg-white/20'
          }`}
        />
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            currentSkill >= 2 ? 'bg-yellow-400' : 'bg-white/20'
          }`}
        />
      </div>
    </div>
  );
}
