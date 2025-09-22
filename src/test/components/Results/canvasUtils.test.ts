import type { PetStats } from '../../../core/personality/types';

// Extract testable mathematical logic from drawRadarChart
function calculateRadarChartData(stats: PetStats) {
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

  return { statLabels, statValues };
}

function calculateRadarPoints(
  values: number[],
  centerX: number,
  centerY: number,
  radius: number
) {
  return values.map((value, i) => {
    const angle = (i * 2 * Math.PI) / values.length - Math.PI / 2;
    const normalizedValue = value / 100; // Convert 0-100 to 0-1
    const x = centerX + Math.cos(angle) * radius * normalizedValue;
    const y = centerY + Math.sin(angle) * radius * normalizedValue;
    return { x, y, angle, value };
  });
}

function calculateLabelPositions(
  statLabels: string[],
  statValues: number[],
  centerX: number,
  centerY: number,
  radius: number,
  labelDistance: number
) {
  return statLabels.map((label, i) => {
    const angle = (i * 2 * Math.PI) / statLabels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * labelDistance;
    const y = centerY + Math.sin(angle) * labelDistance;
    const text = `${label} (${statValues[i]})`;
    return { x, y, text, angle };
  });
}

describe('Canvas Utils', () => {
  const mockStats: PetStats = {
    wisdom: 85,
    cunning: 72,
    agility: 90,
    stealth: 65,
    charisma: 78,
    resolve: 88,
  };

  describe('calculateRadarChartData', () => {
    test('extracts correct stats in proper order', () => {
      const { statLabels, statValues } = calculateRadarChartData(mockStats);

      expect(statLabels).toEqual([
        'Wisdom',
        'Cunning',
        'Agility',
        'Stealth',
        'Charisma',
        'Resolve',
      ]);
      expect(statValues).toEqual([85, 72, 90, 65, 78, 88]);
    });

    test('includes all 6 stats in radar chart data', () => {
      const { statLabels, statValues } = calculateRadarChartData(mockStats);

      expect(statLabels).toHaveLength(6);
      expect(statValues).toHaveLength(6);
      expect(statLabels).toEqual([
        'Wisdom',
        'Cunning',
        'Agility',
        'Stealth',
        'Charisma',
        'Resolve',
      ]);
    });

    test('handles edge case stats correctly', () => {
      const edgeStats: PetStats = {
        wisdom: 0,
        cunning: 100,
        agility: 50,
        stealth: 1,
        charisma: 99,
        resolve: 0,
      };

      const { statValues } = calculateRadarChartData(edgeStats);

      expect(statValues).toEqual([0, 100, 50, 1, 99, 0]);
    });
  });

  describe('calculateRadarPoints', () => {
    const centerX = 200;
    const centerY = 200;
    const radius = 100;

    test('calculates correct normalized coordinates', () => {
      const values = [100, 50, 0]; // Max, half, min values
      const points = calculateRadarPoints(values, centerX, centerY, radius);

      expect(points).toHaveLength(3);

      // First point (100%) should be at full radius
      expect(points[0].x).toBeCloseTo(
        centerX + radius * Math.cos(-Math.PI / 2)
      );
      expect(points[0].y).toBeCloseTo(
        centerY + radius * Math.sin(-Math.PI / 2)
      );

      // Second point (50%) should be at half radius
      const secondAngle = (1 * 2 * Math.PI) / 3 - Math.PI / 2;
      expect(points[1].x).toBeCloseTo(
        centerX + 0.5 * radius * Math.cos(secondAngle)
      );
      expect(points[1].y).toBeCloseTo(
        centerY + 0.5 * radius * Math.sin(secondAngle)
      );

      // Third point (0%) should be at center
      expect(points[2].x).toBeCloseTo(centerX);
      expect(points[2].y).toBeCloseTo(centerY);
    });

    test('distributes points evenly around circle', () => {
      const values = [75, 75, 75, 75]; // Four equal values
      const points = calculateRadarPoints(values, centerX, centerY, radius);

      // Check that angles are evenly distributed (90 degrees apart)
      expect(points[0].angle).toBeCloseTo(-Math.PI / 2); // -90°
      expect(points[1].angle).toBeCloseTo(0); // 0°
      expect(points[2].angle).toBeCloseTo(Math.PI / 2); // 90°
      expect(points[3].angle).toBeCloseTo(Math.PI); // 180°
    });

    test('preserves original stat values', () => {
      const values = [85, 72, 90];
      const points = calculateRadarPoints(values, centerX, centerY, radius);

      expect(points[0].value).toBe(85);
      expect(points[1].value).toBe(72);
      expect(points[2].value).toBe(90);
    });
  });

  describe('calculateLabelPositions', () => {
    const centerX = 200;
    const centerY = 200;
    const radius = 100;
    const labelDistance = 150;

    test('positions labels outside the chart area', () => {
      const { statLabels, statValues } = calculateRadarChartData(mockStats);
      const positions = calculateLabelPositions(
        statLabels,
        statValues,
        centerX,
        centerY,
        radius,
        labelDistance
      );

      positions.forEach((pos) => {
        const distanceFromCenter = Math.sqrt(
          (pos.x - centerX) ** 2 + (pos.y - centerY) ** 2
        );
        expect(distanceFromCenter).toBeCloseTo(labelDistance);
      });
    });

    test('includes stat values in label text', () => {
      const { statLabels, statValues } = calculateRadarChartData(mockStats);
      const positions = calculateLabelPositions(
        statLabels,
        statValues,
        centerX,
        centerY,
        radius,
        labelDistance
      );

      expect(positions[0].text).toBe('Wisdom (85)');
      expect(positions[1].text).toBe('Cunning (72)');
      expect(positions[2].text).toBe('Agility (90)');
      expect(positions[3].text).toBe('Stealth (65)');
      expect(positions[4].text).toBe('Charisma (78)');
      expect(positions[5].text).toBe('Resolve (88)');
    });

    test('matches angles with data points', () => {
      const { statLabels, statValues } = calculateRadarChartData(mockStats);
      const dataPoints = calculateRadarPoints(
        statValues,
        centerX,
        centerY,
        radius
      );
      const labelPositions = calculateLabelPositions(
        statLabels,
        statValues,
        centerX,
        centerY,
        radius,
        labelDistance
      );

      // Labels should have same angles as their corresponding data points
      labelPositions.forEach((label, i) => {
        expect(label.angle).toBeCloseTo(dataPoints[i].angle);
      });
    });
  });

  describe('mathematical correctness', () => {
    test('handles perfect hexagon (all stats equal)', () => {
      const perfectStats: PetStats = {
        wisdom: 80,
        cunning: 80,
        agility: 80,
        stealth: 80,
        charisma: 80,
        resolve: 80,
      };

      const { statValues } = calculateRadarChartData(perfectStats);
      const points = calculateRadarPoints(statValues, 100, 100, 50);

      // All points should be at same distance from center
      points.forEach((point) => {
        const distance = Math.sqrt((point.x - 100) ** 2 + (point.y - 100) ** 2);
        expect(distance).toBeCloseTo(40); // 80% of radius 50
      });
    });

    test('handles extreme stat distribution', () => {
      const extremeStats: PetStats = {
        wisdom: 100,
        cunning: 0,
        agility: 100,
        stealth: 0,
        charisma: 100,
        resolve: 0,
      };

      const { statValues } = calculateRadarChartData(extremeStats);
      const points = calculateRadarPoints(statValues, 100, 100, 50);

      // Alternating pattern: max, min, max, min, max, min
      expect(points[0].value).toBe(100); // wisdom - max distance
      expect(points[1].value).toBe(0); // cunning - at center
      expect(points[2].value).toBe(100); // agility - max distance
      expect(points[3].value).toBe(0); // stealth - at center
      expect(points[4].value).toBe(100); // charisma - max distance
      expect(points[5].value).toBe(0); // resolve - at center
    });
  });
});
