import type { PhaseComponentProps } from '../types';

export function IntroPhase({ 
  isActive, 
  isVisible 
}: PhaseComponentProps) {
  if (!isVisible) return null;

  // Intro phase shows nothing - all content is in persistent header
  return null;
}
