import { Svg, Path, Rect, G } from '@react-pdf/renderer';
import { colors } from '../styles';

interface DecorativeBorderProps {
  width: number;
  height: number;
}

export function DecorativeBorder({ width, height }: DecorativeBorderProps) {
  const margin = 8;
  const cornerSize = 25;
  const strokeColor = colors.sepiaDark;
  const accentColor = colors.gold;

  // Corner flourish path - Celtic-inspired knot design
  const cornerFlourish = `
    M 0 ${cornerSize}
    Q 0 0 ${cornerSize} 0
    M 5 ${cornerSize - 5}
    Q 5 5 ${cornerSize - 5} 5
    M 0 ${cornerSize * 0.6}
    C ${cornerSize * 0.3} ${cornerSize * 0.3} ${cornerSize * 0.3} ${cornerSize * 0.3} ${cornerSize * 0.6} 0
    M ${cornerSize * 0.4} 0
    Q ${cornerSize * 0.2} ${cornerSize * 0.2} 0 ${cornerSize * 0.4}
  `;

  return (
    <Svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Outer border */}
      <Rect
        x={margin}
        y={margin}
        width={width - margin * 2}
        height={height - margin * 2}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
      />

      {/* Inner border */}
      <Rect
        x={margin + 5}
        y={margin + 5}
        width={width - margin * 2 - 10}
        height={height - margin * 2 - 10}
        fill="none"
        stroke={strokeColor}
        strokeWidth={0.5}
        opacity={0.5}
      />

      {/* Decorative line between borders */}
      <Rect
        x={margin + 2.5}
        y={margin + 2.5}
        width={width - margin * 2 - 5}
        height={height - margin * 2 - 5}
        fill="none"
        stroke={accentColor}
        strokeWidth={0.5}
        opacity={0.7}
      />

      {/* Top-left corner flourish */}
      <G transform={`translate(${margin}, ${margin})`}>
        <Path
          d={cornerFlourish}
          stroke={accentColor}
          strokeWidth={1.5}
          fill="none"
        />
      </G>

      {/* Top-right corner flourish (flipped horizontally) */}
      <G transform={`translate(${width - margin}, ${margin}) scale(-1, 1)`}>
        <Path
          d={cornerFlourish}
          stroke={accentColor}
          strokeWidth={1.5}
          fill="none"
        />
      </G>

      {/* Bottom-left corner flourish (flipped vertically) */}
      <G transform={`translate(${margin}, ${height - margin}) scale(1, -1)`}>
        <Path
          d={cornerFlourish}
          stroke={accentColor}
          strokeWidth={1.5}
          fill="none"
        />
      </G>

      {/* Bottom-right corner flourish (flipped both) */}
      <G
        transform={`translate(${width - margin}, ${height - margin}) scale(-1, -1)`}
      >
        <Path
          d={cornerFlourish}
          stroke={accentColor}
          strokeWidth={1.5}
          fill="none"
        />
      </G>

      {/* Top center ornament */}
      <G transform={`translate(${width / 2}, ${margin + 2})`}>
        <Path
          d="M -15 0 L -8 5 L 0 0 L 8 5 L 15 0"
          stroke={accentColor}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M -10 3 L 0 -2 L 10 3"
          stroke={accentColor}
          strokeWidth={0.5}
          fill="none"
        />
      </G>

      {/* Bottom center ornament */}
      <G
        transform={`translate(${width / 2}, ${height - margin - 2}) scale(1, -1)`}
      >
        <Path
          d="M -15 0 L -8 5 L 0 0 L 8 5 L 15 0"
          stroke={accentColor}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M -10 3 L 0 -2 L 10 3"
          stroke={accentColor}
          strokeWidth={0.5}
          fill="none"
        />
      </G>
    </Svg>
  );
}
