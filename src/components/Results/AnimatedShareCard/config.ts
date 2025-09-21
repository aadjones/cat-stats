import type { AnimationConfig } from './types';
import { FEATURE_FLAGS } from '../../../config/featureFlags';

const phases = {
  intro: 4000, // 4s: Pet photo + name + archetype with typewriter
  analyzing: 2000, // 2s: Analyzing legendary abilities message (UNUSED)
  stats: 9000, // 9s: Radar chart animation (6s spokes + 3s polygon hold)
  combat: 8000, // 8s: Single combat move (4s display + 4s pause)
  environmental: 8000, // 8s: Single environmental power (4s display + 4s pause)
  social: 8000, // 8s: Single social skill (4s display + 4s pause)
  passive: 6000, // 6s: Single passive trait (4s display + 2s pause) (UNUSED)
  vulnerability: 9000, // 9s: Vulnerability reveal with longer dramatic pause
  signoff: 4000, // 4s: Branding
  loop: 1000, // 1s: Brief pause before loop
} as const;

// Create base phase order - removed analyzing phase
const BASE_PHASE_ORDER: Array<keyof typeof phases> = [
  'intro',
  'stats',
  'combat',
  'environmental',
  'social',
  'passive',
  'vulnerability',
  'signoff',
  'loop',
];

// Filter out passive phase if feature flag is disabled
export const PHASE_ORDER = BASE_PHASE_ORDER.filter(
  (phase) => phase !== 'passive' || FEATURE_FLAGS.SHOW_PASSIVE_TRAITS_PHASE
);

const totalDuration = PHASE_ORDER.reduce(
  (sum, phase) => sum + phases[phase],
  0
);

export const ANIMATION_CONFIG: AnimationConfig = {
  phases,
  totalDuration,
};
