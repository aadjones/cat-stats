import type { PhaseComponentProps } from '../types';

export function LoopPhase({ isActive, isVisible }: PhaseComponentProps) {
  if (!isVisible) return null;

  // This phase serves as a clean fade-out before restarting
  // It shows nothing, allowing everything to fade out
  return (
    <div className={`loop-section ${isActive ? 'animate-in' : 'visible'}`}>
      {/* Empty - just provides a clean pause before restart */}
    </div>
  );
}
