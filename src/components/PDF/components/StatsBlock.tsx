import { View, Text } from '@react-pdf/renderer';
import type { PetStats } from '../../../core/personality/types';
import { styles } from '../styles';

interface StatsBlockProps {
  stats: PetStats;
}

const STAT_LABELS: { key: keyof PetStats; label: string }[] = [
  { key: 'wisdom', label: 'Wisdom' },
  { key: 'cunning', label: 'Cunning' },
  { key: 'agility', label: 'Agility' },
  { key: 'stealth', label: 'Stealth' },
  { key: 'charisma', label: 'Charisma' },
  { key: 'resolve', label: 'Resolve' },
];

export function StatsBlock({ stats }: StatsBlockProps) {
  return (
    <View style={styles.statsBlock}>
      {STAT_LABELS.map(({ key, label }) => (
        <View key={key} style={styles.statBox}>
          <Text style={styles.statName}>{label}</Text>
          <Text style={styles.statValue}>{stats[key]}</Text>
        </View>
      ))}
    </View>
  );
}
