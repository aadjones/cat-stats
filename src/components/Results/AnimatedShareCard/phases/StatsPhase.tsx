import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { PhaseComponentProps } from '../types';

export function StatsPhase({
  characterSheet,
  theme,
  isActive,
  isVisible,
}: PhaseComponentProps) {
  const { stats } = characterSheet;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animatedSpokes, setAnimatedSpokes] = useState<number>(0);

  const statLabels = useMemo(() => [
    'Wisdom',
    'Cunning',
    'Agility',
    'Stealth',
    'Charisma',
    'Resolve',
  ], []);
  
  const statValues = useMemo(() => [
    stats.wisdom,
    stats.cunning,
    stats.agility,
    stats.stealth,
    stats.charisma,
    stats.resolve,
  ], [stats]);

  // Animated radar chart drawing function
  const drawAnimatedRadarChart = useCallback((
    canvas: HTMLCanvasElement,
    spokesVisible: number
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background circles
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw spokes and labels progressively
    for (let i = 0; i < Math.min(spokesVisible, statLabels.length); i++) {
      const angle = (i * 2 * Math.PI) / statLabels.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Draw spoke
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      const labelDistance = radius + 25;
      const labelX = centerX + Math.cos(angle) * labelDistance;
      const labelY = centerY + Math.sin(angle) * labelDistance;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.font = 'bold 12px system-ui';
      const text = `${statLabels[i]}: ${statValues[i]}`;
      const textMetrics = ctx.measureText(text);

      ctx.fillRect(
        labelX - textMetrics.width / 2 - 4,
        labelY - 8,
        textMetrics.width + 8,
        16
      );

      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, labelX, labelY);
    }

    // Draw data polygon if all spokes are visible
    if (spokesVisible >= statLabels.length) {
      ctx.beginPath();
      for (let i = 0; i < statValues.length; i++) {
        const angle = (i * 2 * Math.PI) / statValues.length - Math.PI / 2;
        const value = statValues[i] / 100;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Fill with theme color
      const rgbValues = theme.accentRgb.split(',').map((v) => v.trim());
      ctx.fillStyle = `rgba(${rgbValues.join(', ')}, 0.3)`;
      ctx.fill();

      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw data points
      for (let i = 0; i < statValues.length; i++) {
        const angle = (i * 2 * Math.PI) / statValues.length - Math.PI / 2;
        const value = statValues[i] / 100;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;

        ctx.fillStyle = theme.accent;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [statLabels, statValues, theme.accent, theme.accentRgb]);

  // Animate spokes when this phase becomes active
  useEffect(() => {
    if (!isActive) {
      setAnimatedSpokes(0);
      return;
    }

    const spokeTimers: NodeJS.Timeout[] = [];

    // Animate each spoke with 800ms delay
    for (let i = 0; i < statLabels.length; i++) {
      const timer = setTimeout(() => {
        setAnimatedSpokes(i + 1);
      }, i * 800);
      spokeTimers.push(timer);
    }

    return () => {
      spokeTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [isActive, statLabels.length]);

  // Canvas drawing effect
  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    const canvas = canvasRef.current;
    canvas.width = 280;
    canvas.height = 280;

    drawAnimatedRadarChart(canvas, animatedSpokes);
  }, [animatedSpokes, isVisible, drawAnimatedRadarChart]);

  if (!isVisible) return null;

  return (
    <div
      className={`stats-section ${isActive ? 'animate-in' : 'visible'} mb-6`}
    >
      <h3 className="text-white text-center font-bold text-lg mb-4">
        Core Attributes
      </h3>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-lg bg-black/20 border border-white/20"
          style={{ width: '280px', height: '280px' }}
        />
      </div>
    </div>
  );
}
