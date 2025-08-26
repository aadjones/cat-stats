import type { CharacterData } from '../../core/personality/types';

export function createDebugCharacterData(): CharacterData {
  return {
    archetype: 'The Contemplative Defender',
    combatMoves: [
      {
        name: 'Tail Inflation',
        stats: 'Intimidation • 85% Success • 3s Windup',
        description:
          'Signature defensive move that inflates tail to maximum size',
      },
      {
        name: 'Growl Warning',
        stats: 'Area Effect • 70% Success • Instant',
        description:
          'Low-frequency threat display that affects all nearby targets',
      },
    ],
    environmentalPowers: [
      {
        name: 'Blanket Fort Mastery',
        stats: 'Territory Control • Horizontal Spaces • Permanent',
        description:
          'Complete dominance of under-cover zones and bedding areas',
      },
      {
        name: 'Silent Stealth Protocol',
        stats: 'Invisibility • No Coverage Required • Passive',
        description:
          'Predators cannot detect waste regardless of concealment effort',
      },
    ],
    socialSkills: [
      {
        name: 'Gradual Bond Formation',
        stats: 'Trust Building • High Loyalty • Slow Activation',
        description:
          'Takes time to warm up but forms deep, lasting connections',
      },
      {
        name: 'Guardian Protocol',
        stats: 'Ally Protection • Auto-Trigger • High Priority',
        description:
          'Automatically intervenes to rescue or defend allies when needed',
      },
    ],
    passiveTraits: [
      {
        name: 'Contemplative Focus',
        stats: 'Mental Clarity • Constant • Stress Resistance',
        description:
          'Maintains calm and clear thinking in stressful situations like vet visits',
      },
      {
        name: 'Muppet Face Advantage',
        stats: 'Charm Bonus • Visual Effect • Always Active',
        description: 'Natural endearing appearance provides social advantages',
      },
    ],
    weakness: {
      name: 'AC Startle Response',
      description:
        'Sudden air conditioning activation causes -30 to all stats for 10 seconds',
    },
    timeModifiers: [
      {
        name: 'Morning Wisdom Boost',
        effect: 'Stealth +5, Wisdom +10 during morning hours',
      },
      {
        name: 'Evening Guardian Mode',
        effect: 'Charisma +10, Guardian Protocol Range +50%',
      },
    ],
  };
}
