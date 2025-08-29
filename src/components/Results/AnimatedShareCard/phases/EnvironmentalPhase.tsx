import type { PhaseComponentProps } from '../types';

export function EnvironmentalPhase({
  isActive,
  isVisible,
}: PhaseComponentProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`environmental-section ${isActive ? 'animate-in' : 'visible'} mb-4`}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">🌿</h1>
        <h3 className="text-white text-xl font-bold">Environmental Powers</h3>
        <p className="text-white/80 text-sm">
          Environmental abilities would appear here...
        </p>
      </div>
    </div>
  );
}
