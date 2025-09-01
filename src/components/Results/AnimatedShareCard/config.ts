import type { AnimationConfig } from './types';
import { FEATURE_FLAGS } from '../../../config/featureFlags';

const phases = {
  intro: 4000, // 4s: Pet photo + name + archetype with typewriter
  analyzing: 2000, // 2s: Analyzing legendary abilities message
  stats: 8000, // 8s: Radar chart animation (6s spokes + 2s polygon)
  combat: 13000, // 13s: Combat moves (3s + 3s + 3s + 4s pause)
  environmental: 13000, // 13s: Environmental powers (3s + 3s + 3s + 4s pause)
  social: 13000, // 13s: Social skills (3s + 3s + 3s + 4s pause)
  passive: 13000, // 13s: Passive traits (3s + 3s + 3s + 4s pause)
  vulnerability: 6000, // 6s: Vulnerability reveal with pause
  signoff: 5000, // 5s: Branding with longer linger
  loop: 1000, // 1s: Brief pause before loop
} as const;

// Create base phase order
const BASE_PHASE_ORDER: Array<keyof typeof phases> = [
  'intro',
  'analyzing',
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
