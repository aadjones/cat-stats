import type { CharacterAbility } from '../../core/personality/types';

interface AbilityCardProps {
  ability: CharacterAbility;
  colorClass: string;
}

export function AbilityCard({ ability, colorClass }: AbilityCardProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-3 mb-3">
      <div className={`${colorClass} font-bold`}>{ability.name}</div>
      <div className="text-gray-300 text-sm italic">{ability.stats}</div>
      <div className="text-gray-200 text-sm">{ability.description}</div>
    </div>
  );
}
