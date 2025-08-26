import type { CharacterAbility } from '../../core/personality/types';

interface AbilityCardProps {
  ability: CharacterAbility;
  colorClass: string;
}

export function AbilityCard({ ability, colorClass }: AbilityCardProps) {
  return (
    <div className="bg-white/10 rounded-lg p-3 mb-3">
      <div className={`${colorClass} font-bold`}>{ability.name}</div>
      <div className="text-white/60 text-sm italic">{ability.stats}</div>
      <div className="text-white/80 text-sm">{ability.description}</div>
    </div>
  );
}
