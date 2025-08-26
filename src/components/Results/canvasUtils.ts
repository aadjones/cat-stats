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

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 120;

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

  // Draw grid circles
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Draw scale labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  for (let i = 1; i <= 5; i++) {
    const scaleRadius = (radius * i) / 5;
    ctx.fillText((i * 20).toString(), centerX + scaleRadius + 5, centerY + 3);
  }

  // Draw axes and labels
  for (let i = 0; i < statLabels.length; i++) {
    const angle = (i * 2 * Math.PI) / statLabels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    const labelX = centerX + Math.cos(angle) * (radius + 25);
    const labelY = centerY + Math.sin(angle) * (radius + 25) + 4;
    ctx.fillText(`${statLabels[i]} (${statValues[i]})`, labelX, labelY);
  }

  // Draw data polygon
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

  // Fill and stroke the polygon
  ctx.fillStyle = `rgba(${theme.accentRgb}, 0.3)`;
  ctx.fill();
  ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.8)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw data points
  ctx.fillStyle = theme.accent;
  for (let i = 0; i < statValues.length; i++) {
    const angle = (i * 2 * Math.PI) / statValues.length - Math.PI / 2;
    const value = statValues[i] / 100;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}