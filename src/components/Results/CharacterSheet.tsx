import type { CharacterSheet as CharacterSheetData } from '../../core/personality/types';
import { Button } from '../UI/Button';
import { StatsRadarChart } from './StatsRadarChart';
import { AbilityCard } from './AbilityCard';

interface Theme {
  gradient: string;
  accentRgb: string;
  accent: string;
}

interface CharacterSheetProps {
  characterSheet: CharacterSheetData;
  theme: Theme;
  onReset: () => void;
  onDownload: () => void;
}

export function CharacterSheet({
  characterSheet,
  theme,
  onReset,
  onDownload,
}: CharacterSheetProps) {
  const { characterData, stats, petName } = characterSheet;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} p-4`}>
      <div className="max-w-4xl mx-auto mb-6 flex gap-4">
        <Button variant="secondary" onClick={onReset}>
          ← Create Another Legend
        </Button>
        <Button
          onClick={onDownload}
          className="flex items-center gap-2"
        >
          📄 Download Character Sheet
        </Button>
      </div>

      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {petName.toUpperCase()}
          </h1>
          <p className="text-white/80 text-xl">{characterData.archetype}</p>
        </div>

        <div className="mb-8">
          <StatsRadarChart stats={stats} theme={theme} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-4">Combat Moves</h3>
            {characterData.combatMoves.map((ability, index) => (
              <AbilityCard
                key={index}
                ability={ability}
                colorClass="text-red-300"
              />
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-4">
              Environmental Powers
            </h3>
            {characterData.environmentalPowers.map((ability, index) => (
              <AbilityCard
                key={index}
                ability={ability}
                colorClass="text-cyan-300"
              />
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-4">Social Skills</h3>
            {characterData.socialSkills.map((ability, index) => (
              <AbilityCard
                key={index}
                ability={ability}
                colorClass="text-yellow-300"
              />
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-4">Passive Traits</h3>
            {characterData.passiveTraits.map((ability, index) => (
              <AbilityCard
                key={index}
                ability={ability}
                colorClass="text-purple-300"
              />
            ))}
          </div>
        </div>

        <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-red-300 font-bold text-lg mb-2">
            ⚠️ Critical Vulnerability
          </h3>
          <div className="text-white">
            <span className="font-bold">{characterData.weakness.name}:</span>{' '}
            {characterData.weakness.description}
          </div>
        </div>

        {characterData.timeModifiers && characterData.timeModifiers.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-4">
              Situational Modifiers
            </h3>
            {characterData.timeModifiers.map((modifier, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3 mb-3">
                <div className="text-green-300 font-bold">{modifier.name}</div>
                <div className="text-white/80 text-sm">{modifier.effect}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}