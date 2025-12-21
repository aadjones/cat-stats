import { Document, Page, View } from '@react-pdf/renderer';
import type { CharacterSheet } from '../../core/personality/types';
import { getColorTheme } from '../../services/themeService';
import { styles, colors } from './styles';
import './fonts'; // Register fonts

import { Header } from './components/Header';
import { StatsBlock } from './components/StatsBlock';
import { RadarChartSVG } from './components/RadarChartSVG';
import { AbilitySection } from './components/AbilitySection';
import { VulnerabilitySection } from './components/VulnerabilitySection';
import { ModifiersSection } from './components/ModifiersSection';
import { Footer } from './components/Footer';

interface CharacterSheetPDFProps {
  characterSheet: CharacterSheet;
  characterId?: string | null;
}

export function CharacterSheetPDF({
  characterSheet,
  characterId,
}: CharacterSheetPDFProps) {
  const { characterData, stats, petName, petPhoto } = characterSheet;
  const theme = getColorTheme(stats);

  return (
    <Document
      title={`${petName} - CatStats Character Sheet`}
      author="CatStats"
      subject="Feline Legend Character Sheet"
    >
      <Page size="A4" style={styles.page}>
        {/* Header with photo, name, and archetype */}
        <Header
          petName={petName}
          archetype={characterData.archetype}
          petPhoto={petPhoto}
        />

        {/* Stats section: stat boxes (3x2) + radar chart side by side */}
        <View style={styles.statsRow}>
          <View style={styles.statsColumn}>
            <StatsBlock stats={stats} />
          </View>
          <View style={styles.radarColumn}>
            <RadarChartSVG
              stats={stats}
              accentColor={theme.accent}
              size={120}
            />
          </View>
        </View>

        {/* Two-column layout for abilities */}
        <View style={styles.abilitiesRow}>
          {/* Left column: Combat + Environmental */}
          <View style={styles.abilityColumn}>
            <AbilitySection
              title="COMBAT MOVES"
              abilities={characterData.combatMoves}
              accentColor={colors.red}
              compact
            />
            <AbilitySection
              title="ENVIRONMENTAL"
              abilities={characterData.environmentalPowers}
              accentColor={colors.gold}
              compact
            />
          </View>

          {/* Right column: Social + Passive */}
          <View style={styles.abilityColumn}>
            <AbilitySection
              title="SOCIAL SKILLS"
              abilities={characterData.socialSkills}
              accentColor={colors.sepiaLight}
              compact
            />
            <AbilitySection
              title="PASSIVE TRAITS"
              abilities={characterData.passiveTraits}
              accentColor={colors.sepiaDark}
              compact
            />
          </View>
        </View>

        {/* Vulnerability - full width */}
        <VulnerabilitySection weakness={characterData.weakness} />

        {/* Situational modifiers */}
        <ModifiersSection modifiers={characterData.timeModifiers} />

        {/* Footer */}
        <Footer characterId={characterId} />
      </Page>
    </Document>
  );
}
