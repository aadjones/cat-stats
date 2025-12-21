import { View, Text, Image } from '@react-pdf/renderer';
import { styles } from '../styles';

interface HeaderProps {
  petName: string;
  archetype: string;
  petPhoto?: string | null;
}

export function Header({ petName, archetype, petPhoto }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>CATSTATS</Text>
      <Text style={styles.subtitle}>LEGENDARY CHARACTER SHEET</Text>

      {petPhoto && (
        <View style={styles.photoContainer}>
          <Image src={petPhoto} style={styles.photo} />
        </View>
      )}

      <Text style={styles.petName}>{petName.toUpperCase()}</Text>
      <Text style={styles.archetype}>{archetype}</Text>
    </View>
  );
}
