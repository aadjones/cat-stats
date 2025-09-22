import type { CharacterSheet, PetStats } from '../personality/types';
import type {
  CompatibilityMetrics,
  StatCompatibility,
  AbilitySync,
  ConflictArea,
  ScenarioCompatibility,
} from './types';

/**
 * Calculate overall compatibility between two pet characters
 */
export function calculateCompatibility(
  char1: CharacterSheet,
  char2: CharacterSheet
): CompatibilityMetrics {
  const statCompatibility = calculateStatCompatibility(
    char1.stats,
    char2.stats
  );
  const abilitySync = analyzeAbilitySync(char1, char2);
  const conflictAreas = identifyConflictAreas(char1, char2);
  const scenarios = analyzeScenarioCompatibility(char1, char2);

  // Calculate overall score based on weighted components
  const overallScore = Math.round(
    statCompatibility.energyMatch * 0.3 +
      statCompatibility.socialBalance * 0.25 +
      abilitySync.synergies.length * 10 + // Bonus for synergies
      scenarios.livingSpace * 0.2 +
      scenarios.activityMatch * 0.15 +
      Math.max(0, 100 - statCompatibility.personalityClash * 0.1) // Penalty for clashes
  );

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    statCompatibility,
    abilitySync,
    conflictAreas,
    scenarios,
  };
}

/**
 * Analyze stat-based compatibility
 */
function calculateStatCompatibility(
  stats1: PetStats,
  stats2: PetStats
): StatCompatibility {
  // Energy level matching (agility as activity indicator)
  const energy1 = stats1.agility + stats1.agility; // Double weight on agility
  const energy2 = stats2.agility + stats2.agility;
  const energyDiff = Math.abs(energy1 - energy2);
  const energyMatch = Math.max(0, 100 - energyDiff / 2);

  // Social dynamics (charisma difference analysis)
  const socialBalance = analyzeSocialBalance(stats1.charisma, stats2.charisma);

  // Find complementary strengths
  const complementaryStrengths = findComplementaryStats(stats1, stats2);

  // Calculate personality clash potential
  const personalityClash = calculatePersonalityClash(stats1, stats2);

  return {
    energyMatch: Math.round(energyMatch),
    socialBalance: Math.round(socialBalance),
    complementaryStrengths,
    personalityClash: Math.round(personalityClash),
  };
}

/**
 * Analyze social balance between charisma levels
 */
function analyzeSocialBalance(charisma1: number, charisma2: number): number {
  const diff = Math.abs(charisma1 - charisma2);

  // Very similar charisma levels
  if (diff <= 15) {
    return 85; // Good balance, similar social needs
  }

  // Moderate difference - can be complementary
  if (diff <= 30) {
    return 70; // One outgoing, one reserved - can work
  }

  // Large difference - potential for overwhelm
  if (diff <= 50) {
    return 45; // Risk of one dominating social interactions
  }

  // Extreme difference
  return 25; // High chance of social mismatch
}

/**
 * Find stats where pets complement each other
 */
function findComplementaryStats(stats1: PetStats, stats2: PetStats): string[] {
  const complementary: string[] = [];
  const statNames = [
    'wisdom',
    'cunning',
    'agility',
    'stealth',
    'charisma',
    'resolve',
  ] as const;

  for (const stat of statNames) {
    const val1 = stats1[stat];
    const val2 = stats2[stat];

    // One is strong (>75), other is weak (<50)
    if ((val1 > 75 && val2 < 50) || (val2 > 75 && val1 < 50)) {
      const strongPet = val1 > val2 ? '1' : '2';
      complementary.push(
        `${stat} (Pet ${strongPet} covers for Pet ${strongPet === '1' ? '2' : '1'})`
      );
    }
  }

  return complementary;
}

/**
 * Calculate potential for personality clashes
 */
function calculatePersonalityClash(stats1: PetStats, stats2: PetStats): number {
  let clashScore = 0;

  // Both very high stealth = territory conflicts
  if (stats1.stealth > 80 && stats2.stealth > 80) {
    clashScore += 30;
  }

  // Both very high charisma = attention competition
  if (stats1.charisma > 80 && stats2.charisma > 80) {
    clashScore += 25;
  }

  // Very different cunning levels = trust issues
  if (Math.abs(stats1.cunning - stats2.cunning) > 60) {
    clashScore += 20;
  }

  // Both very low resolve = stress amplification
  if (stats1.resolve < 40 && stats2.resolve < 40) {
    clashScore += 15;
  }

  return Math.min(100, clashScore);
}

/**
 * Analyze ability synergies and conflicts
 */
function analyzeAbilitySync(
  char1: CharacterSheet,
  char2: CharacterSheet
): AbilitySync {
  const synergies: string[] = [];
  const conflicts: string[] = [];
  const emergentBehaviors: string[] = [];

  // Analyze combat move synergies
  char1.characterData.combatMoves.forEach((move1) => {
    char2.characterData.combatMoves.forEach((move2) => {
      if (detectMoveSynergy(move1.description, move2.description)) {
        synergies.push(
          `${move1.name} + ${move2.name}: Coordinated attack potential`
        );
      }
      if (detectMoveConflict(move1.description, move2.description)) {
        conflicts.push(
          `${move1.name} vs ${move2.name}: Conflicting approaches`
        );
      }
    });
  });

  // Analyze environmental power combinations
  const envPowers1 = char1.characterData.environmentalPowers.map((p) =>
    p.name.toLowerCase()
  );
  const envPowers2 = char2.characterData.environmentalPowers.map((p) =>
    p.name.toLowerCase()
  );

  if (
    envPowers1.some((p) => p.includes('stealth') || p.includes('hide')) &&
    envPowers2.some((p) => p.includes('rescue') || p.includes('help'))
  ) {
    emergentBehaviors.push('Stealth reconnaissance for rescue missions');
  }

  // Check for weakness compatibility
  const weakness1 = char1.characterData.weakness.description.toLowerCase();
  const weakness2 = char2.characterData.weakness.description.toLowerCase();

  if (
    !weakness1.includes(weakness2.split(' ')[0]) &&
    !weakness2.includes(weakness1.split(' ')[0])
  ) {
    synergies.push('Complementary weaknesses - can support each other');
  } else {
    conflicts.push('Similar vulnerabilities - mutual weakness amplification');
  }

  return { synergies, conflicts, emergentBehaviors };
}

/**
 * Detect if two combat moves have synergy potential
 */
function detectMoveSynergy(desc1: string, desc2: string): boolean {
  const synergyKeywords = [
    ['stealth', 'ambush'],
    ['distract', 'attack'],
    ['defense', 'offense'],
    ['stretch', 'reach'],
    ['speed', 'precision'],
    ['loud', 'quiet'],
  ];

  return synergyKeywords.some(
    ([word1, word2]) =>
      (desc1.toLowerCase().includes(word1) &&
        desc2.toLowerCase().includes(word2)) ||
      (desc1.toLowerCase().includes(word2) &&
        desc2.toLowerCase().includes(word1))
  );
}

/**
 * Detect if two combat moves conflict
 */
function detectMoveConflict(desc1: string, desc2: string): boolean {
  const conflictKeywords = [
    ['loud', 'stealth'],
    ['fast', 'slow'],
    ['aggressive', 'gentle'],
    ['attention', 'hide'],
    ['team', 'solo'],
  ];

  return conflictKeywords.some(
    ([word1, word2]) =>
      desc1.toLowerCase().includes(word1) && desc2.toLowerCase().includes(word2)
  );
}

/**
 * Identify potential areas of conflict
 */
function identifyConflictAreas(
  char1: CharacterSheet,
  char2: CharacterSheet
): ConflictArea[] {
  const conflicts: ConflictArea[] = [];

  // Territory conflicts based on stats
  if (char1.stats.stealth > 70 && char2.stats.stealth > 70) {
    conflicts.push({
      area: 'Territory',
      severity: 'High',
      description:
        'Both pets have high stealth - likely to compete for prime spots',
    });
  }

  // Attention conflicts
  if (char1.stats.charisma > 75 && char2.stats.charisma > 75) {
    conflicts.push({
      area: 'Attention',
      severity: 'Medium',
      description:
        'Both are highly charismatic - may compete for human attention',
    });
  }

  // Activity level mismatches
  const energy1 = char1.stats.agility + char1.stats.agility;
  const energy2 = char2.stats.agility + char2.stats.agility;
  if (Math.abs(energy1 - energy2) > 80) {
    conflicts.push({
      area: 'Activity Level',
      severity: 'Medium',
      description: 'Significant energy level difference may cause friction',
    });
  }

  return conflicts;
}

/**
 * Analyze scenario-specific compatibility
 */
function analyzeScenarioCompatibility(
  char1: CharacterSheet,
  char2: CharacterSheet
): ScenarioCompatibility {
  const stats1 = char1.stats;
  const stats2 = char2.stats;

  // Living space compatibility
  const territorialClash = stats1.stealth > 70 && stats2.stealth > 70 ? -30 : 0;
  const stealthBalance =
    Math.abs(stats1.stealth - stats2.stealth) < 30 ? 20 : 0;
  const livingSpace = Math.max(0, 70 + stealthBalance + territorialClash);

  // First meeting prediction
  const avgCharisma = (stats1.charisma + stats2.charisma) / 2;
  const charismaDiff = Math.abs(stats1.charisma - stats2.charisma);

  let firstMeeting: ScenarioCompatibility['firstMeeting'];
  if (avgCharisma > 70 && charismaDiff < 30) {
    firstMeeting = 'Instant Friends';
  } else if (avgCharisma > 50 && charismaDiff < 50) {
    firstMeeting = 'Gradual Warming';
  } else if (charismaDiff > 60 || stats1.stealth > 80 || stats2.stealth > 80) {
    firstMeeting = 'Cautious';
  } else {
    firstMeeting = 'Chaotic';
  }

  // Activity compatibility
  const energy1 = stats1.agility + stats1.agility;
  const energy2 = stats2.agility + stats2.agility;
  const energyDiff = Math.abs(energy1 - energy2);
  const activityMatch = Math.max(0, 100 - energyDiff / 2);

  // Stress response compatibility
  const avgResolve = (stats1.resolve + stats2.resolve) / 2;
  let stressResponse: ScenarioCompatibility['stressResponse'];
  if (avgResolve > 70) {
    stressResponse = 'Mutual Support';
  } else if (avgResolve < 40) {
    stressResponse = 'Amplified Chaos';
  } else {
    stressResponse = 'Independent Coping';
  }

  return {
    livingSpace: Math.round(livingSpace),
    firstMeeting,
    activityMatch: Math.round(activityMatch),
    stressResponse,
  };
}
