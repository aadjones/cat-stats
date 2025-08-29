import type { PhaseComponentProps } from '../types';

export function SocialPhase({ isActive, isVisible }: PhaseComponentProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`social-section ${isActive ? 'animate-in' : 'visible'} mb-4`}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">💬</h1>
        <h3 className="text-white text-xl font-bold">Social Phase</h3>
        <p className="text-white/80 text-sm">
          Social skills would appear here...
        </p>
      </div>
    </div>
  );
}
