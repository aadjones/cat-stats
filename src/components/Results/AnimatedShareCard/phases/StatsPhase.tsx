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
  const [spokeProgress, setSpokeProgress] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [showPolygon, setShowPolygon] = useState<boolean>(false);

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
    spokesVisible: number,
    spokeValues: number[],
    drawPolygon: boolean
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.30; // Smaller for more compact

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
      const animatedValue = spokeValues[i] || 0;
      const spokeLength = radius * (animatedValue / 100); // Scale spoke to animated value
      const x = centerX + Math.cos(angle) * spokeLength;
      const y = centerY + Math.sin(angle) * spokeLength;

      // Draw spoke to animated length
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw data point at the end of the spoke
      if (animatedValue > 0) {
        ctx.fillStyle = theme.accent;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw label - smaller and more compact
      const labelDistance = radius + 18; // Closer to chart
      const labelX = centerX + Math.cos(angle) * labelDistance;
      const labelY = centerY + Math.sin(angle) * labelDistance;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = 'bold 10px system-ui'; // Smaller font
      const text = `${statLabels[i]}: ${Math.round(animatedValue)}`;
      const textMetrics = ctx.measureText(text);

      ctx.fillRect(
        labelX - textMetrics.width / 2 - 3,
        labelY - 6,
        textMetrics.width + 6,
        12
      );

      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, labelX, labelY);
    }

    // Draw data polygon if requested
    if (drawPolygon && spokesVisible >= statLabels.length) {
      ctx.beginPath();
      for (let i = 0; i < statValues.length; i++) {
        const angle = (i * 2 * Math.PI) / statValues.length - Math.PI / 2;
        const value = statValues[i] / 100; // Use actual stat values for polygon
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

      // Draw larger data points for polygon
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
      setSpokeProgress([0, 0, 0, 0, 0, 0]);
      setShowPolygon(false);
      return;
    }

    const spokeTimers: NodeJS.Timeout[] = [];
    const progressTimers: NodeJS.Timeout[] = [];

    // Animate each spoke with 1 second delay (6 seconds total)
    for (let i = 0; i < statLabels.length; i++) {
      // Show the spoke (label appears)
      const spokeTimer = setTimeout(() => {
        setAnimatedSpokes(i + 1);
        
        // Animate the spoke growing to its target value over 0.8 seconds
        let progress = 0;
        const targetValue = statValues[i];
        const animationDuration = 800; // 0.8 seconds
        const frameRate = 60; // 60fps
        const totalFrames = (animationDuration / 1000) * frameRate;
        const progressIncrement = targetValue / totalFrames;

        const progressInterval = setInterval(() => {
          progress += progressIncrement;
          if (progress >= targetValue) {
            progress = targetValue;
            clearInterval(progressInterval);
          }
          
          setSpokeProgress(prev => {
            const newProgress = [...prev];
            newProgress[i] = progress;
            return newProgress;
          });
        }, 1000 / frameRate);

        // Store interval for cleanup
        progressTimers.push(progressInterval as unknown as NodeJS.Timeout);
        
      }, i * 1000);
      spokeTimers.push(spokeTimer);
    }

    // Show polygon at second 6 (after all spokes are drawn)
    const polygonTimer = setTimeout(() => {
      setShowPolygon(true);
    }, 6000);

    return () => {
      spokeTimers.forEach((timer) => clearTimeout(timer));
      progressTimers.forEach((timer) => clearTimeout(timer));
      clearTimeout(polygonTimer);
    };
  }, [isActive, statLabels.length, statValues]);

  // Canvas drawing effect
  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    const canvas = canvasRef.current;
    canvas.width = 260; // Smaller canvas for more compact layout
    canvas.height = 260;

    drawAnimatedRadarChart(canvas, animatedSpokes, spokeProgress, showPolygon);
  }, [animatedSpokes, spokeProgress, showPolygon, isVisible, drawAnimatedRadarChart]);

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
          style={{ width: '260px', height: '260px' }}
        />
      </div>
    </div>
  );
}
