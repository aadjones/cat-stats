import type { CharacterSheet as CharacterSheetData } from '../../core/personality/types';
import { StatsRadarChart } from './StatsRadarChart';
import { AbilityCard } from './AbilityCard';
import { ShareableCard } from './ShareableCard';

interface Theme {
  gradient: string;
  accentRgb: string;
  accent: string;
}

interface CharacterSheetProps {
  characterSheet: CharacterSheetData;
  theme: Theme;
  characterId: string | null;
  onReset: () => void;
  onDownload: () => void;
}

export function CharacterSheet({ characterSheet, theme }: CharacterSheetProps) {
  const { characterData, stats, petName, petPhoto } = characterSheet;

  return (
    <>
      {/* Hidden shareable card for image generation */}
      <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
        <ShareableCard characterSheet={characterSheet} theme={theme} />
      </div>

      <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
        <div
          id="character-content"
          className="bg-theme-surface border border-theme-border rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl relative"
        >
          {/* Desktop photo - top-right corner */}
          {petPhoto && (
            <div className="hidden sm:block absolute top-6 right-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-glass-border bg-glass">
                <img
                  src={petPhoto}
                  alt={petName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-text-primary mb-2">
              {petName.toUpperCase()}
            </h1>
            <p className="text-text-secondary text-lg sm:text-xl font-body">
              {characterData.archetype}
            </p>

            {/* Mobile photo - centered under archetype */}
            {petPhoto && (
              <div className="sm:hidden mt-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-glass-border bg-glass mx-auto">
                  <img
                    src={petPhoto}
                    alt={petName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-4 sm:mb-8">
            <StatsRadarChart stats={stats} theme={theme} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
            <div className="bg-theme-surface border border-theme-border rounded-lg p-4 sm:p-6">
              <h3 className="text-text-primary font-bold font-display text-base sm:text-lg mb-3 sm:mb-4">
                Combat Moves
              </h3>
              {characterData.combatMoves.map((ability, index) => (
                <AbilityCard
                  key={index}
                  ability={ability}
                  colorClass="text-danger"
                />
              ))}
            </div>

            <div className="bg-theme-surface border border-theme-border rounded-lg p-4 sm:p-6">
              <h3 className="text-text-primary font-bold font-display text-base sm:text-lg mb-3 sm:mb-4">
                Environmental Powers
              </h3>
              {characterData.environmentalPowers.map((ability, index) => (
                <AbilityCard
                  key={index}
                  ability={ability}
                  colorClass="text-info"
                />
              ))}
            </div>

            <div className="bg-theme-surface border border-theme-border rounded-lg p-4 sm:p-6">
              <h3 className="text-text-primary font-bold font-display text-base sm:text-lg mb-3 sm:mb-4">
                Social Skills
              </h3>
              {characterData.socialSkills.map((ability, index) => (
                <AbilityCard
                  key={index}
                  ability={ability}
                  colorClass="text-warning"
                />
              ))}
            </div>

            <div className="bg-theme-surface border border-theme-border rounded-lg p-4 sm:p-6">
              <h3 className="text-text-primary font-bold font-display text-base sm:text-lg mb-3 sm:mb-4">
                Passive Traits
              </h3>
              {characterData.passiveTraits.map((ability, index) => (
                <AbilityCard
                  key={index}
                  ability={ability}
                  colorClass="text-theme-accent"
                />
              ))}
            </div>
          </div>

          <div className="bg-danger/20 border border-danger rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-danger font-bold font-display text-base sm:text-lg mb-2">
              ⚠️ Critical Vulnerability
            </h3>
            <div className="text-text-primary font-body">
              <span className="font-bold">{characterData.weakness.name}:</span>{' '}
              {characterData.weakness.description}
            </div>
          </div>

          {characterData.timeModifiers &&
            characterData.timeModifiers.length > 0 && (
              <div className="bg-glass backdrop-blur-md border border-glass-border rounded-lg p-4 sm:p-6">
                <h3 className="text-text-primary font-bold font-display text-base sm:text-lg mb-3 sm:mb-4">
                  Situational Modifiers
                </h3>
                {characterData.timeModifiers.map((modifier, index) => (
                  <div key={index} className="bg-glass rounded-lg p-3 mb-3">
                    <div className="text-success font-bold font-body">
                      {modifier.name}
                    </div>
                    <div className="text-text-secondary text-sm font-body">
                      {modifier.effect}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </>
  );
}
