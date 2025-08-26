import type { PetStats } from '../../core/personality/types';

interface Theme {
  accentRgb: string;
  accent: string;
}

export function drawRadarChart(
  canvas: HTMLCanvasElement,
  stats: PetStats,
  theme: Theme
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set up high DPI scaling
  const dpr = window.devicePixelRatio || 1;
  const rect = { width: canvas.width, height: canvas.height };
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const radius = Math.min(rect.width, rect.height) * 0.28; // Responsive radius

  const statLabels = [
    'Wisdom',
    'Cunning',
    'Agility',
    'Stealth',
    'Charisma',
    'Resolve',
  ];
  const statValues = [
    stats.wisdom,
    stats.cunning,
    stats.agility,
    stats.stealth,
    stats.charisma,
    stats.resolve,
  ];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // CONTRAST SYSTEM: Draw dark background circle for better contrast
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 25, 0, 2 * Math.PI);
  ctx.fill();

  // CONTRAST SYSTEM: High-contrast grid circles with visual hierarchy
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
    
    // Major grid lines (every 50 points) are brighter
    if (i % 2 === 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = i === 5 ? 2 : 1;
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
    }
    ctx.stroke();
  }

  // Scale numbers removed - visual grid lines are sufficient

  // CONTRAST SYSTEM: High-contrast axes
  for (let i = 0; i < statLabels.length; i++) {
    const angle = (i * 2 * Math.PI) / statLabels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw data polygon with enhanced visibility
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

  // CONTRAST SYSTEM: Enhanced data polygon with glow effect
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 8;
  ctx.fillStyle = `rgba(${theme.accentRgb}, 0.4)`;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  // CONTRAST SYSTEM: Enhanced data points with glow
  for (let i = 0; i < statValues.length; i++) {
    const angle = (i * 2 * Math.PI) / statValues.length - Math.PI / 2;
    const value = statValues[i] / 100;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;

    // Outer glow
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 6;
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  // CONTRAST SYSTEM: High-contrast labels with background, positioned to fit canvas
  for (let i = 0; i < statLabels.length; i++) {
    const angle = (i * 2 * Math.PI) / statLabels.length - Math.PI / 2;
    const labelDistance = radius + Math.max(25, rect.width * 0.08); // Responsive label distance
    const labelX = centerX + Math.cos(angle) * labelDistance;
    const labelY = centerY + Math.sin(angle) * labelDistance;
    const text = `${statLabels[i]} (${statValues[i]})`;
    
    // Responsive font size
    const fontSize = Math.max(10, Math.min(12, rect.width * 0.035));
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    
    // Clamp positions to stay within canvas bounds
    const margin = Math.max(5, rect.width * 0.02);
    const minX = textWidth / 2 + margin;
    const maxX = rect.width - textWidth / 2 - margin;
    const minY = fontSize + margin;
    const maxY = rect.height - fontSize - margin;
    
    const clampedX = Math.max(minX, Math.min(maxX, labelX));
    const clampedY = Math.max(minY, Math.min(maxY, labelY));
    
    // Semi-transparent background with rounded corners effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    const padding = Math.max(3, rect.width * 0.01);
    ctx.fillRect(
      clampedX - textWidth / 2 - padding,
      clampedY - fontSize / 2 - padding,
      textWidth + padding * 2,
      fontSize + padding * 2
    );
    
    // High-contrast text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, clampedX, clampedY);
  }
}