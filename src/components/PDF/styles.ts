import { StyleSheet } from '@react-pdf/renderer';

// D&D-inspired color palette
export const colors = {
  parchment: '#E8D5B7',
  parchmentDark: '#D4C4A8',
  sepiaDark: '#3D2914',
  sepiaLight: '#5C4033',
  gold: '#C9A227',
  goldDark: '#8B7021',
  red: '#8B0000',
  black: '#1A1A1A',
  white: '#FFFFFF',
};

// Section accent colors (matching web UI)
export const sectionColors = {
  combat: '#8B0000', // Dark red
  environmental: '#2E5A1C', // Forest green
  social: '#8B6914', // Dark gold
  passive: '#4A2C6A', // Deep purple
  vulnerability: '#5C1515', // Blood red
  modifiers: '#5C4033', // Brown
};

export const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.parchment,
    padding: 30,
    paddingBottom: 40,
    fontFamily: 'CrimsonText',
    fontSize: 10,
    color: colors.sepiaDark,
  },

  // Header section
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Cinzel',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.sepiaDark,
    letterSpacing: 3,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Cinzel',
    fontSize: 9,
    color: colors.sepiaLight,
    letterSpacing: 2,
  },
  petName: {
    fontFamily: 'Cinzel',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gold,
    marginTop: 8,
    marginBottom: 2,
  },
  archetype: {
    fontFamily: 'CrimsonText',
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.sepiaLight,
  },

  // Photo styling
  photoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.gold,
    marginBottom: 6,
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  // Stats row: stat boxes (3x2) + radar chart
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 20,
  },
  statsColumn: {
    width: 200,
  },
  radarColumn: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats block D&D style (3x2 grid)
  statsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  statBox: {
    width: 60,
    height: 45,
    borderWidth: 1.5,
    borderColor: colors.sepiaDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.parchmentDark,
  },
  statName: {
    fontFamily: 'Cinzel',
    fontSize: 6,
    color: colors.sepiaLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: 'Cinzel',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.sepiaDark,
  },

  // Two-column layout for abilities
  abilitiesRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
  },
  abilityColumn: {
    flex: 1,
  },

  // Section headers
  sectionHeader: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 1.5,
    letterSpacing: 0.5,
  },
  sectionHeaderCompact: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 3,
    paddingBottom: 2,
    borderBottomWidth: 1,
    letterSpacing: 0.5,
  },

  // Ability cards
  abilityCard: {
    marginBottom: 6,
  },
  abilityCardCompact: {
    marginBottom: 4,
  },
  abilityName: {
    fontFamily: 'Cinzel',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  abilityNameCompact: {
    fontFamily: 'Cinzel',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  abilityStats: {
    fontFamily: 'CrimsonText',
    fontSize: 7,
    fontStyle: 'italic',
    color: colors.sepiaLight,
    marginBottom: 1,
  },
  abilityDescription: {
    fontFamily: 'CrimsonText',
    fontSize: 8,
    lineHeight: 1.3,
  },
  abilityDescriptionCompact: {
    fontFamily: 'CrimsonText',
    fontSize: 8,
    lineHeight: 1.3,
  },

  // Vulnerability section
  vulnerabilitySection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(92, 21, 21, 0.08)',
    borderWidth: 1,
    borderColor: colors.red,
  },
  vulnerabilityHeader: {
    fontFamily: 'Cinzel',
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.red,
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  vulnerabilityName: {
    fontFamily: 'Cinzel',
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.sepiaDark,
    marginBottom: 2,
  },
  vulnerabilityDescription: {
    fontFamily: 'CrimsonText',
    fontSize: 8,
    lineHeight: 1.3,
  },

  // Modifiers section
  modifiersSection: {
    marginTop: 8,
  },
  modifierItem: {
    flexDirection: 'row',
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  modifierName: {
    fontFamily: 'Cinzel',
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.sepiaLight,
    marginRight: 4,
  },
  modifierEffect: {
    fontFamily: 'CrimsonText',
    fontSize: 8,
    flex: 1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 30,
    right: 30,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'CrimsonText',
    fontSize: 7,
    fontStyle: 'italic',
    color: colors.sepiaLight,
  },
  footerLink: {
    fontFamily: 'CrimsonText',
    fontSize: 7,
    color: colors.gold,
    marginTop: 2,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.goldDark,
    marginVertical: 6,
    opacity: 0.5,
  },
});
