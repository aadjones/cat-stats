import { View, Text } from '@react-pdf/renderer';
import type { CharacterModifier } from '../../../core/personality/types';
import { styles, sectionColors } from '../styles';

interface ModifiersSectionProps {
  modifiers: CharacterModifier[];
}

export function ModifiersSection({ modifiers }: ModifiersSectionProps) {
  if (!modifiers || modifiers.length === 0) {
    return null;
  }

  return (
    <View style={styles.modifiersSection} wrap={false}>
      <Text
        style={[
          styles.sectionHeader,
          {
            color: sectionColors.modifiers,
            borderBottomColor: sectionColors.modifiers,
          },
        ]}
      >
        SITUATIONAL MODIFIERS
      </Text>
      {modifiers.map((modifier, index) => (
        <View key={index} style={styles.modifierItem}>
          <Text style={styles.modifierName}>{modifier.name}:</Text>
          <Text style={styles.modifierEffect}>{modifier.effect}</Text>
        </View>
      ))}
    </View>
  );
}
