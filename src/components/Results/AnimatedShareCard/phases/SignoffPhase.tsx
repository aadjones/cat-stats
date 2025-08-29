import type { PhaseComponentProps } from '../types';

export function SignoffPhase({ isActive, isVisible }: PhaseComponentProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`signoff-section ${isActive ? 'animate-in' : 'visible'} mt-auto text-center`}
    >
      <div className="space-y-2">
        <div className="text-white/60 text-xs">
          Turn your pet into a legend at
        </div>
        <div className="text-white font-bold text-lg">
          cat-stats-six.vercel.app/
        </div>
      </div>
    </div>
  );
}
