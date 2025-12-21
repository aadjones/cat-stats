import { View, Text } from '@react-pdf/renderer';
import type { CharacterAbility } from '../../../core/personality/types';
import { styles } from '../styles';

interface AbilitySectionProps {
  title: string;
  abilities: CharacterAbility[];
  accentColor: string;
  compact?: boolean;
}

export function AbilitySection({
  title,
  abilities,
  accentColor,
  compact = false,
}: AbilitySectionProps) {
  if (!abilities || abilities.length === 0) {
    return null;
  }

  return (
    <View>
      <Text
        style={[
          compact ? styles.sectionHeaderCompact : styles.sectionHeader,
          { color: accentColor, borderBottomColor: accentColor },
        ]}
      >
        {title}
      </Text>
      {abilities.map((ability, index) => (
        <View
          key={index}
          style={compact ? styles.abilityCardCompact : styles.abilityCard}
        >
          <Text
            style={[
              compact ? styles.abilityNameCompact : styles.abilityName,
              { color: accentColor },
            ]}
          >
            {ability.name}
          </Text>
          {ability.stats && (
            <Text style={styles.abilityStats}>{ability.stats}</Text>
          )}
          <Text
            style={
              compact
                ? styles.abilityDescriptionCompact
                : styles.abilityDescription
            }
          >
            {ability.description}
          </Text>
        </View>
      ))}
    </View>
  );
}
