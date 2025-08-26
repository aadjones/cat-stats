import type { PetStats } from '../core/personality/types';

export interface Theme {
  gradient: string;
  accent: string;
  accentRgb: string;
}

type StatName = keyof Pick<
  PetStats,
  'wisdom' | 'cunning' | 'agility' | 'stealth' | 'charisma' | 'resolve'
>;

const THEMES: Record<StatName, Theme> = {
  wisdom: {
    gradient: 'from-blue-900 via-indigo-900 to-purple-900',
    accent: '#4F46E5',
    accentRgb: '79, 70, 229',
  },
  cunning: {
    gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
    accent: '#059669',
    accentRgb: '5, 150, 105',
  },
  agility: {
    gradient: 'from-red-900 via-orange-900 to-amber-900',
    accent: '#DC2626',
    accentRgb: '220, 38, 38',
  },
  charisma: {
    gradient: 'from-pink-900 via-purple-900 to-fuchsia-900',
    accent: '#EC4899',
    accentRgb: '236, 72, 153',
  },
  stealth: {
    gradient: 'from-slate-900 via-gray-900 to-zinc-900',
    accent: '#475569',
    accentRgb: '71, 85, 105',
  },
  resolve: {
    gradient: 'from-yellow-900 via-amber-900 to-orange-900',
    accent: '#F59E0B',
    accentRgb: '245, 158, 11',
  },
};

export function getColorTheme(stats: PetStats): Theme {
  const statEntries: [StatName, number][] = [
    ['wisdom', stats.wisdom],
    ['cunning', stats.cunning],
    ['agility', stats.agility],
    ['stealth', stats.stealth],
    ['charisma', stats.charisma],
    ['resolve', stats.resolve],
  ];

  const dominantStat = statEntries.reduce((max, current) =>
    current[1] > max[1] ? current : max
  )[0];

  return THEMES[dominantStat];
}
