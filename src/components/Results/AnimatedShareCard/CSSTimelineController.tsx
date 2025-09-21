import { useState, useEffect, useRef } from 'react';
import type {
  AnimationPhase,
  AnimatedShareCardProps,
  PhaseComponentProps,
} from './types';
import { ANIMATION_CONFIG, PHASE_ORDER } from './config';
import { IntroPhase } from './phases/IntroPhase';
import { StatsPhase } from './phases/StatsPhase';
import { CombatPhase } from './phases/CombatPhase';
import { EnvironmentalPhase } from './phases/EnvironmentalPhase';
import { SocialPhase } from './phases/SocialPhase';
import { PassivePhase } from './phases/PassivePhase';
import { VulnerabilityPhase } from './phases/VulnerabilityPhase';
import { SignoffPhase } from './phases/SignoffPhase';
import { LoopPhase } from './phases/LoopPhase';

/**
 * CSS Timeline-Based Animation Controller
 *
 * Replaces setTimeout-based system with CSS animations for scroll-proof timing.
 * Uses CSS custom properties and animation events for state sync.
 */

interface PhaseConfig {
  name: AnimationPhase;
  duration: number; // milliseconds
  component: React.ComponentType<PhaseComponentProps>;
}

// Component mapping
const COMPONENT_MAP: Record<
  AnimationPhase,
  React.ComponentType<PhaseComponentProps>
> = {
  intro: IntroPhase,
  analyzing: IntroPhase, // Fallback (not used)
  stats: StatsPhase,
  combat: CombatPhase,
  environmental: EnvironmentalPhase,
  social: SocialPhase,
  passive: PassivePhase,
  vulnerability: VulnerabilityPhase,
  signoff: SignoffPhase,
  loop: LoopPhase,
};

// Generate phase configuration from existing config
const PHASE_CONFIGS: PhaseConfig[] = PHASE_ORDER.map((phase) => ({
  name: phase,
  duration: ANIMATION_CONFIG.phases[phase],
  component: COMPONENT_MAP[phase],
}));

// Calculate CSS timeline percentages
const calculateTimelineCSS = () => {
  const totalDuration = ANIMATION_CONFIG.totalDuration;
  let currentTime = 0;

  return PHASE_CONFIGS.map((phase) => {
    const startPercent = (currentTime / totalDuration) * 100;
    currentTime += phase.duration;
    const endPercent = (currentTime / totalDuration) * 100;

    return {
      ...phase,
      startPercent: Math.round(startPercent * 100) / 100,
      endPercent: Math.round(endPercent * 100) / 100,
      delay: -currentTime / 1000, // Negative delay for CSS sync
    };
  });
};

const TIMELINE_DATA = calculateTimelineCSS();

export function CSSTimelineController({
  characterSheet,
  theme,
  onAnimationComplete,
}: AnimatedShareCardProps) {
  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('intro');
  const [isPlaying] = useState(true); // Always playing, no controls needed
  const timelineRef = useRef<HTMLDivElement>(null);

  // CSS Animation Progress Tracking
  useEffect(() => {
    if (!timelineRef.current) return;

    const totalDurationSeconds = ANIMATION_CONFIG.totalDuration / 1000;

    // Track animation progress using requestAnimationFrame
    let animationId: number;
    let startTime: number | null = null;

    const updateProgress = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      if (!isPlaying) {
        animationId = requestAnimationFrame(updateProgress);
        return;
      }

      const elapsed = (timestamp - startTime) / 1000; // Convert to seconds
      const progress = (elapsed % totalDurationSeconds) / totalDurationSeconds;

      // Determine current phase based on progress
      let foundPhase = false;
      for (const phaseData of TIMELINE_DATA) {
        const phaseStartPercent = phaseData.startPercent / 100;
        const phaseEndPercent = phaseData.endPercent / 100;
        const isInRange =
          progress >= phaseStartPercent && progress < phaseEndPercent;

        // Check if progress falls within this phase's range
        if (isInRange && !foundPhase) {
          foundPhase = true;
          if (currentPhase !== phaseData.name) {
            setCurrentPhase(phaseData.name);

            // Trigger animation complete callback when looping
            if (phaseData.name === 'intro' && currentPhase !== 'intro') {
              onAnimationComplete?.();
            }
          }
        }
      }

      animationId = requestAnimationFrame(updateProgress);
    };

    if (isPlaying) {
      animationId = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying]); // Only restart when play/pause changes

  // Generate CSS timeline styles
  const timelineStyles = `
    .css-timeline-master {
      animation: timeline-master ${ANIMATION_CONFIG.totalDuration / 1000}s linear infinite;
      animation-play-state: ${isPlaying ? 'running' : 'paused'};
    }

    ${TIMELINE_DATA.map(
      (phase) => `
      .phase-container[data-phase="${phase.name}"] {
        animation-delay: ${phase.delay}s;
        --start-percent: ${phase.startPercent}%;
        --end-percent: ${phase.endPercent}%;
      }
    `
    ).join('\n')}

    @keyframes timeline-master {
      0% { --timeline-progress: 0; }
      100% { --timeline-progress: 1; }
    }

    .phase-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    }

    .phase-container.active {
      opacity: 1;
      transform: translateY(0);
    }

    /* Hardware acceleration */
    .css-timeline-master,
    .phase-container {
      contain: layout style paint;
      will-change: transform, opacity;
    }
  `;

  const getPhaseClass = (targetPhase: AnimationPhase) => {
    const isActive = currentPhase === targetPhase;
    const isVisible = currentPhase === targetPhase;

    return { isActive, isVisible };
  };

  return (
    <div
      className="h-full p-4 flex flex-col overflow-hidden css-timeline-master"
      ref={timelineRef}
      style={{ minHeight: 0 }}
    >
      {/* Inject CSS timeline styles */}
      <style dangerouslySetInnerHTML={{ __html: timelineStyles }} />

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

      {/* Phase Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center relative">
        {PHASE_CONFIGS.map((config) => {
          const { isActive, isVisible } = getPhaseClass(config.name);
          const Component = config.component;

          return (
            <div
              key={config.name}
              className={`phase-container ${isActive ? 'active' : ''}`}
              data-phase={config.name}
            >
              <Component
                characterSheet={characterSheet}
                theme={theme}
                isActive={isActive}
                isVisible={isVisible}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
