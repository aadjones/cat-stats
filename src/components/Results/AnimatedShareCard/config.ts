import type { AnimationConfig } from './types';

export const ANIMATION_CONFIG: AnimationConfig = {
  phases: {
    intro: 4000, // 4s: Pet photo + name + archetype with typewriter
    analyzing: 2000, // 2s: Analyzing legendary abilities message
    stats: 8000, // 8s: Radar chart animation (6s spokes + 2s polygon)
    combat: 10000, // 10s: Combat moves (6s animation + 4s pause)
    environmental: 10000, // 10s: Environmental powers (6s animation + 4s pause)  
    social: 10000, // 10s: Social skills (6s animation + 4s pause)
    passive: 10000, // 10s: Passive traits (6s animation + 4s pause)
    vulnerability: 3000, // 3s: Vulnerability reveal
    signoff: 3000, // 3s: Branding
    loop: 1000, // 1s: Brief pause before loop
  },
  totalDuration: 58000, // Total cycle time (4+2+8+10+10+10+10+3+3+1 = 58s)
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
