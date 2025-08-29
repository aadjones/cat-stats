import type { CharacterSheet } from '../../../core/personality/types';

export interface Theme {
  gradient: string;
  accentRgb: string;
  accent: string;
}

export type AnimationPhase =
  | 'intro'
  | 'analyzing'
  | 'stats'
  | 'combat'
  | 'environmental'
  | 'social'
  | 'passive'
  | 'vulnerability'
  | 'signoff'
  | 'loop';

export interface AnimationConfig {
  phases: Record<AnimationPhase, number>; // Duration in ms
  totalDuration: number;
}

export interface PhaseComponentProps {
  characterSheet: CharacterSheet;
  theme: Theme;
  isActive: boolean;
  isVisible: boolean;
}

export interface AnimatedShareCardProps {
  characterSheet: CharacterSheet;
  theme: Theme;
  onAnimationComplete?: () => void;
}
