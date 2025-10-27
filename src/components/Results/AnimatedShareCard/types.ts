import type {
  CharacterSheet,
  RpgCharacterData,
} from '../../../core/personality/types';

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

// Specialized CharacterSheet type that guarantees RPG data
export interface RpgCharacterSheet
  extends Omit<CharacterSheet, 'characterData'> {
  characterData: RpgCharacterData;
}

export interface PhaseComponentProps {
  characterSheet: RpgCharacterSheet;
  theme: Theme;
  isActive: boolean;
  isVisible: boolean;
}

export interface AnimatedShareCardProps {
  characterSheet: CharacterSheet;
  theme: Theme;
  onAnimationComplete?: () => void;
}
