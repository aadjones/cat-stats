import type { PhaseComponentProps } from '../types';

export function IntroPhase({ isVisible }: PhaseComponentProps) {
  if (!isVisible) return null;

  // Intro phase shows nothing - all content is in persistent header
  return null;
}
