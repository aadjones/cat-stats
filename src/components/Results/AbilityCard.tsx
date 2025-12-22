import type { CharacterAbility } from '../../core/personality/types';

interface AbilityCardProps {
  ability: CharacterAbility;
  colorClass: string;
}

export function AbilityCard({ ability, colorClass }: AbilityCardProps) {
  return (
    <div className="bg-theme-surface-alt rounded-lg p-3 mb-3">
      <div className={`${colorClass} font-bold font-display`}>
        {ability.name}
      </div>
      <div className="text-text-muted text-sm italic font-body">
        {ability.stats}
      </div>
      <div className="text-text-secondary text-sm font-body">
        {ability.description}
      </div>
    </div>
  );
}
