import type { StoredCharacter } from '../../services/characterStorage';
import { AnimatedShareCard } from '../Results/AnimatedShareCard';
import { getColorTheme } from '../../services';

// Pre-loaded character data to avoid API delay on landing page
const PREVIEW_CHARACTER: StoredCharacter = {
  characterData: {
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
  },
  stats: {
    wisdom: 90,
    cunning: 60,
    agility: 65,
    stealth: 95,
    charisma: 60,
    resolve: 90,
    boldness: 75,
  },
  petName: 'Sente',
  petPhoto: 'https://a45xo5hsimefevky.public.blob.vercel-storage.com/sente.jpg',
  id: 'sente1',
  created: '2025-08-27T00:00:00.000Z',
};

export function CharacterSheetPreview() {
  const theme = getColorTheme(PREVIEW_CHARACTER.stats);

  return (
    <div className="mx-auto flex flex-col items-center">
      <div
        style={{
          transform: 'scale(0.75)',
          transformOrigin: 'center center',
          width: '360px',
          height: '480px',
        }}
      >
        <AnimatedShareCard
          characterSheet={PREVIEW_CHARACTER}
          theme={theme}
          onAnimationComplete={() => {}}
        />
      </div>
    </div>
  );
}
