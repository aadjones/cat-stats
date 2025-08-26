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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, 350); // Max 350px, but responsive
      
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      
      drawRadarChart(canvas, stats, theme);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [stats, theme]);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-4 sm:p-6">
      <h3 className="text-white font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-center">
        Core Attributes
      </h3>
      <div className="flex justify-center w-full max-w-[280px] sm:max-w-[350px] mx-auto">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto"
        />
      </div>
    </div>
  );
}