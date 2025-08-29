import type { PhaseComponentProps } from '../types';

export function AnalyzingPhase({ isActive, isVisible }: PhaseComponentProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`analyzing-section ${isActive ? 'animate-in' : 'visible'} mb-4`}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">⚡</h1>
        <h3 className="text-white text-xl font-bold">Analyzing</h3>
        <p className="text-white/80 text-sm mt-2">
          Legendary abilities detected...
        </p>
      </div>
    </div>
  );
}
