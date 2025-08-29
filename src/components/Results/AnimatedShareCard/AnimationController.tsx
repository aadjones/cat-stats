import { useState, useEffect } from 'react';
import type { AnimationPhase, AnimatedShareCardProps } from './types';
import { ANIMATION_CONFIG, PHASE_ORDER } from './config';
import { IntroPhase } from './phases/IntroPhase';
import { AnalyzingPhase } from './phases/AnalyzingPhase';
import { StatsPhase } from './phases/StatsPhase';
import { CombatPhase } from './phases/CombatPhase';
import { EnvironmentalPhase } from './phases/EnvironmentalPhase';
import { SocialPhase } from './phases/SocialPhase';
import { PassivePhase } from './phases/PassivePhase';
import { VulnerabilityPhase } from './phases/VulnerabilityPhase';
import { SignoffPhase } from './phases/SignoffPhase';

export function AnimationController({
  characterSheet,
  theme,
  onAnimationComplete,
}: AnimatedShareCardProps) {
  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('intro');
  const [isPlaying, setIsPlaying] = useState(true);

  // Phase progression logic
  useEffect(() => {
    if (!isPlaying) return;

    const duration = ANIMATION_CONFIG.phases[currentPhase];
    const timer = setTimeout(() => {
      const currentIndex = PHASE_ORDER.indexOf(currentPhase);
      const nextIndex = (currentIndex + 1) % PHASE_ORDER.length;
      const nextPhase = PHASE_ORDER[nextIndex];

      setCurrentPhase(nextPhase);

      if (nextPhase === 'intro') {
        onAnimationComplete?.();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [currentPhase, isPlaying, onAnimationComplete]);

  // Helper to determine phase visibility - ONLY current phase is visible
  const getPhaseClass = (targetPhase: AnimationPhase) => {
    const isActive = currentPhase === targetPhase;
    const isVisible = currentPhase === targetPhase; // ONLY current phase visible

    return { isActive, isVisible };
  };

  return (
    <div className="absolute inset-0 p-6 flex flex-col">
      {/* Persistent Pet Header */}
      <div className="text-center mb-8">
        {characterSheet.petPhoto && (
          <div className={`pet-photo w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/40 bg-white/10 ${
            currentPhase === 'intro' ? 'animate-scale-in' : ''
          }`}>
            <img
              src={characterSheet.petPhoto}
              alt={characterSheet.petName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className={`pet-name text-3xl font-bold text-white mb-2 ${
          currentPhase === 'intro' ? 'animate-typewriter' : 'visible-permanent'
        }`}>
          {characterSheet.petName.toUpperCase()}
        </h1>
        <p className={`archetype text-white/90 text-xl font-medium ${
          currentPhase === 'intro' ? 'animate-fade-in-delayed' : 'visible-permanent'
        }`}>
          {characterSheet.characterData.archetype}
        </p>
      </div>

      {/* Phase Content Area */}
      <div className="flex-1">
        <IntroPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('intro')}
        />

        <AnalyzingPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('analyzing')}
        />

        <StatsPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('stats')}
        />

        <CombatPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('combat')}
        />

        <EnvironmentalPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('environmental')}
        />

        <SocialPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('social')}
        />

        <PassivePhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('passive')}
        />

        <VulnerabilityPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('vulnerability')}
        />

        <SignoffPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('signoff')}
        />
      </div>

      {/* Debug controls */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-black/50 text-white text-xs px-2 py-1 rounded"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button
          onClick={() => setCurrentPhase('intro')}
          className="bg-black/50 text-white text-xs px-2 py-1 rounded"
        >
          🔄
        </button>
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentPhase}
        </div>
      </div>
    </div>
  );
}
