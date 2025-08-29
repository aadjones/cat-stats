import type { AnimationConfig } from './types';

export const ANIMATION_CONFIG: AnimationConfig = {
  phases: {
    intro: 3000, // 3s: Welcome + analyzing
    stats: 8000, // 8s: Radar chart animation (6s spokes + 2s polygon)
    combat: 6000, // 6s: Combat moves (3s each for 2 moves)
    environmental: 3000, // 3s: Environmental powers
    social: 3000, // 3s: Social skills
    passive: 3000, // 3s: Passive traits
    vulnerability: 3000, // 3s: Vulnerability reveal
    signoff: 3000, // 3s: Branding
    loop: 1000, // 1s: Brief pause before loop
  },
  totalDuration: 33000, // Total cycle time
};

export const PHASE_ORDER: Array<keyof typeof ANIMATION_CONFIG.phases> = [
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
