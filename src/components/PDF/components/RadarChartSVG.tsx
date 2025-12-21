import { Svg, Circle, Line, Polygon, G, Text } from '@react-pdf/renderer';
import type { PetStats } from '../../../core/personality/types';
import { colors } from '../styles';

interface RadarChartSVGProps {
  stats: PetStats;
  accentColor?: string;
  size?: number;
}

const statLabels = ['WIS', 'CUN', 'AGI', 'STL', 'CHA', 'RES'];

export function RadarChartSVG({
  stats,
  accentColor = colors.gold,
  size = 140,
}: RadarChartSVGProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.32; // Leave room for labels
  const labelRadius = radius + 14; // Labels outside the chart

  const statValues = [
    stats.wisdom,
    stats.cunning,
    stats.agility,
    stats.stealth,
    stats.charisma,
    stats.resolve,
  ];

  // Calculate polygon points for data
  const dataPoints = statValues.map((value, i) => {
    const angle = (i * 2 * Math.PI) / statValues.length - Math.PI / 2;
    const normalizedValue = value / 100;
    const x = centerX + Math.cos(angle) * radius * normalizedValue;
    const y = centerY + Math.sin(angle) * radius * normalizedValue;
    return { x, y };
  });

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Calculate axis endpoints
  const axisPoints = statValues.map((_, i) => {
    const angle = (i * 2 * Math.PI) / statValues.length - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius + 3}
        fill={colors.parchmentDark}
        stroke={colors.sepiaDark}
        strokeWidth={1}
      />

      {/* Grid circles */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={(radius * i) / 5}
          fill="none"
          stroke={colors.sepiaLight}
          strokeWidth={i === 5 ? 1.5 : 0.5}
          opacity={i % 2 === 1 ? 0.6 : 0.3}
        />
      ))}

      {/* Axis lines */}
      {axisPoints.map((point, i) => (
        <Line
          key={i}
          x1={centerX}
          y1={centerY}
          x2={point.x}
          y2={point.y}
          stroke={colors.sepiaLight}
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}

      {/* Data polygon fill */}
      <Polygon
        points={polygonPoints}
        fill={accentColor}
        fillOpacity={0.4}
        stroke={accentColor}
        strokeWidth={2}
      />

      {/* Data points */}
      {dataPoints.map((point, i) => (
        <G key={i}>
          <Circle cx={point.x} cy={point.y} r={4} fill={accentColor} />
          <Circle cx={point.x} cy={point.y} r={2} fill={colors.white} />
        </G>
      ))}

      {/* Stat labels (qualitative only, no numbers) */}
      {statLabels.map((label, i) => {
        const angle = (i * 2 * Math.PI) / statLabels.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;
        return (
          <Text
            key={label}
            x={x}
            y={y + 3}
            style={{
              fontSize: 7,
              fontFamily: 'Cinzel',
              fontWeight: 'bold',
              textAnchor: 'middle',
              fill: colors.sepiaLight,
            }}
          >
            {label}
          </Text>
        );
      })}
    </Svg>
  );
}
