import { useState, useEffect, useRef } from 'react';
import type { AnimationPhase, AnimatedShareCardProps } from './types';
import { ANIMATION_CONFIG, PHASE_ORDER } from './config';
import { FEATURE_FLAGS } from '../../../config/featureFlags';
import { logger } from '../../../utils/logger';
import { IntroPhase } from './phases/IntroPhase';
import { StatsPhase } from './phases/StatsPhase';
import { CombatPhase } from './phases/CombatPhase';
import { EnvironmentalPhase } from './phases/EnvironmentalPhase';
import { SocialPhase } from './phases/SocialPhase';
import { PassivePhase } from './phases/PassivePhase';
import { VulnerabilityPhase } from './phases/VulnerabilityPhase';
import { SignoffPhase } from './phases/SignoffPhase';
import { LoopPhase } from './phases/LoopPhase';

export function AnimationController({
  characterSheet,
  theme,
  onAnimationComplete,
}: AnimatedShareCardProps) {
  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('intro');
  const [isPlaying, setIsPlaying] = useState(true);

  // Refs to track timer state for debugging
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseStartTimeRef = useRef<number>(Date.now());

  // Log isPlaying state changes
  useEffect(() => {
    logger.debug('Animation playing state changed', {
      isPlaying,
      currentPhase,
      timestamp: new Date().toISOString(),
    });
  }, [isPlaying, currentPhase]);

  // Test log to verify logger is working
  useEffect(() => {
    logger.info('AnimationController mounted - logging system active', {
      petName: characterSheet.petName,
      initialPhase: currentPhase,
    });
    console.log(
      '[MOUNT]',
      characterSheet.petName,
      'phase:',
      currentPhase,
      'playing:',
      isPlaying
    );
  }, [characterSheet.petName, currentPhase, isPlaying]);

  // Phase progression logic
  useEffect(() => {
    if (!isPlaying) {
      logger.debug('Animation paused, skipping phase timer setup', {
        currentPhase,
        isPlaying,
        elapsedSincePhaseStart: Date.now() - phaseStartTimeRef.current,
      });
      return;
    }

    const duration = ANIMATION_CONFIG.phases[currentPhase];
    phaseStartTimeRef.current = Date.now();

    logger.debug('Setting up phase timer', {
      currentPhase,
      duration,
      isPlaying,
      timestamp: new Date().toISOString(),
    });

    const timer = setTimeout(() => {
      const currentIndex = PHASE_ORDER.indexOf(currentPhase);
      const nextIndex = (currentIndex + 1) % PHASE_ORDER.length;
      const nextPhase = PHASE_ORDER[nextIndex];

      const actualDuration = Date.now() - phaseStartTimeRef.current;
      console.log(
        '[PHASE]',
        currentPhase,
        '→',
        nextPhase,
        actualDuration + 'ms (expected ' + duration + 'ms)'
      );

      logger.debug('Phase timer fired, transitioning', {
        from: currentPhase,
        to: nextPhase,
        actualDuration,
        expectedDuration: duration,
        isPlaying,
      });

      setCurrentPhase(nextPhase);

      if (nextPhase === 'intro') {
        onAnimationComplete?.();
      }
    }, duration);

    phaseTimerRef.current = timer;

    return () => {
      logger.debug('Cleaning up phase timer', {
        currentPhase,
        elapsedTime: Date.now() - phaseStartTimeRef.current,
        isPlaying,
      });
      clearTimeout(timer);
      phaseTimerRef.current = null;
    };
  }, [currentPhase, isPlaying, onAnimationComplete]);

  // Scroll-aware animation pausing to prevent timing glitches
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollTime = Date.now();
      const phaseElapsed = scrollTime - phaseStartTimeRef.current;

      console.log(
        '[SCROLL]',
        currentPhase,
        'paused at',
        phaseElapsed + 'ms',
        'scrollY:',
        window.scrollY
      );

      logger.debug('Scroll event detected - pausing animation', {
        currentPhase,
        phaseElapsed,
        isPlaying,
        hasActivePhaseTimer: phaseTimerRef.current !== null,
        hasActiveScrollTimer: scrollTimerRef.current !== null,
        scrollY: window.scrollY,
      });

      // Pause animation during scroll
      setIsPlaying(false);

      // Clear any existing timer
      if (scrollTimerRef.current) {
        logger.debug('Clearing existing scroll resume timer');
        clearTimeout(scrollTimerRef.current);
      }

      // Resume animation after scroll stops (300ms delay)
      scrollTimer = setTimeout(() => {
        const totalPause = Date.now() - scrollTime;
        console.log(
          '[SCROLL-RESUME]',
          currentPhase,
          'resumed after',
          totalPause + 'ms pause'
        );

        logger.debug('Scroll timer fired - resuming animation', {
          currentPhase,
          totalPauseDuration: totalPause,
          phaseElapsedWhenPaused: phaseElapsed,
          scrollY: window.scrollY,
        });
        setIsPlaying(true);
        scrollTimerRef.current = null;
      }, 300);

      scrollTimerRef.current = scrollTimer;
    };

    logger.debug('Setting up scroll listener');

    // Listen for scroll events on window
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      logger.debug('Cleaning up scroll listener');
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
    };
  }, [currentPhase, isPlaying]);

  // Helper to determine phase visibility - ONLY current phase is visible
  const getPhaseClass = (targetPhase: AnimationPhase) => {
    const isActive = currentPhase === targetPhase;
    const isVisible = currentPhase === targetPhase; // ONLY current phase visible

    return { isActive, isVisible };
  };

  return (
    <div
      className="h-full p-4 flex flex-col overflow-hidden"
      style={{ minHeight: 0 }}
    >
      {/* Pet Header - fades out during loop phase */}
      <div
        className={`text-center mb-8 transition-opacity duration-1000 ${
          currentPhase === 'loop' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {characterSheet.petPhoto && (
          <div
            className={`pet-photo w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/40 bg-white/10 ${
              currentPhase === 'intro' ? 'animate-scale-in' : ''
            }`}
          >
            <img
              src={characterSheet.petPhoto}
              alt={characterSheet.petName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1
          className={`pet-name text-3xl font-bold text-white mb-2 ${
            currentPhase === 'intro'
              ? 'animate-typewriter'
              : 'visible-permanent'
          }`}
        >
          {characterSheet.petName.toUpperCase()}
        </h1>
        <p
          className={`archetype text-white/90 text-xl font-medium ${
            currentPhase === 'intro'
              ? 'animate-fade-in-delayed'
              : 'visible-permanent'
          }`}
        >
          {characterSheet.characterData.archetype}
        </p>
      </div>

      {/* Phase Content Area - intelligently sized to never overflow */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
        <IntroPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('intro')}
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

        <LoopPhase
          characterSheet={characterSheet}
          theme={theme}
          {...getPhaseClass('loop')}
        />
      </div>

      {/* Debug controls */}
      {FEATURE_FLAGS.SHOW_ANIMATION_DEBUG_CONTROLS && (
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
      )}
    </div>
  );
}
