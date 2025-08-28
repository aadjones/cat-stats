import type { CharacterSheet } from '../personality/types';

export interface CompatibilityMetrics {
  overallScore: number; // 0-100
  statCompatibility: StatCompatibility;
  abilitySync: AbilitySync;
  conflictAreas: ConflictArea[];
  scenarios: ScenarioCompatibility;
}

export interface StatCompatibility {
  energyMatch: number; // 0-100, how well their energy levels align
  socialBalance: number; // 0-100, how their social traits complement
  complementaryStrengths: string[]; // Areas where they balance each other
  personalityClash: number; // 0-100, potential for personality conflicts
}

export interface AbilitySync {
  synergies: string[]; // Abilities that work well together
  conflicts: string[]; // Abilities that would clash
  emergentBehaviors: string[]; // New behaviors from combination
}

export interface ConflictArea {
  area: string; // e.g., "Territory", "Attention", "Food"
  severity: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface ScenarioCompatibility {
  livingSpace: number; // 0-100, how well they'd share space
  firstMeeting: 'Instant Friends' | 'Gradual Warming' | 'Cautious' | 'Chaotic';
  activityMatch: number; // 0-100, compatible activity levels
  stressResponse: 'Mutual Support' | 'Amplified Chaos' | 'Independent Coping';
}

export interface FriendshipReport {
  petNames: [string, string];
  overallScore: number; // 0-100
  friendshipType: string; // "Partners in Crime", "Unlikely Duo", etc.
  compatibility: CompatibilityMetrics;
  sections: {
    firstMeeting: string;
    livingDynamics: string;
    predictedShenanigans: string;
    mutualSupport: string;
  };
  chaosLevel: 'Zen' | 'Mild Mischief' | 'Moderate Mayhem' | 'Maximum Chaos';
}

export interface FriendshipInput {
  character1: CharacterSheet;
  character2: CharacterSheet;
}