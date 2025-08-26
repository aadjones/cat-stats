import { useEffect, useRef } from 'react';
import type { PetStats } from '../../core/personality/types';
import { drawRadarChart } from './canvasUtils';

interface Theme {
  accentRgb: string;
  accent: string;
}

interface StatsRadarChartProps {
  stats: PetStats;
  theme: Theme;
}

export function StatsRadarChart({ stats, theme }: StatsRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawRadarChart(canvasRef.current, stats, theme);
    }
  }, [stats, theme]);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
      <h3 className="text-white font-bold text-xl mb-4 text-center">
        Core Attributes
      </h3>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          className="max-w-full h-auto"
        />
      </div>
    </div>
  );
}