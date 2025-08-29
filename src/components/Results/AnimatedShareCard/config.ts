import type { AnimationConfig } from './types';

const phases = {
  intro: 4000, // 4s: Pet photo + name + archetype with typewriter
  analyzing: 2000, // 2s: Analyzing legendary abilities message
  stats: 8000, // 8s: Radar chart animation (6s spokes + 2s polygon)
  combat: 10000, // 10s: Combat moves (6s animation + 4s pause)
  environmental: 10000, // 10s: Environmental powers (6s animation + 4s pause)
  social: 10000, // 10s: Social skills (6s animation + 4s pause)
  passive: 10000, // 10s: Passive traits (6s animation + 4s pause)
  vulnerability: 6000, // 6s: Vulnerability reveal with pause
  signoff: 5000, // 5s: Branding with longer linger
  loop: 1000, // 1s: Brief pause before loop
} as const;

const totalDuration = Object.values(phases).reduce(
  (sum, duration) => sum + duration,
  0
);

export const ANIMATION_CONFIG: AnimationConfig = {
  phases,
  totalDuration,
};

export const PHASE_ORDER: Array<keyof typeof ANIMATION_CONFIG.phases> = [
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
