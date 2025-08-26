import type { PetStats, UserAnswers } from './types';
import { multipleChoiceQuestions } from './questions';

const BASE_STATS: PetStats = {
  wisdom: 50,
  cunning: 50,
  agility: 50,
  stealth: 50,
  charisma: 50,
  resolve: 50,
  boldness: 50,
};

export function calculatePetStats(answers: UserAnswers): PetStats {
  const stats = { ...BASE_STATS };

  multipleChoiceQuestions.forEach((question) => {
    const answer = answers[question.id];
    if (!answer) return;

    const selectedOption = question.options.find((opt) => opt.value === answer);
    if (!selectedOption?.stats) return;

    Object.entries(selectedOption.stats).forEach(([stat, value]) => {
      if (typeof value === 'number' && Object.prototype.hasOwnProperty.call(stats, stat)) {
        const statKey = stat as keyof PetStats;
        stats[statKey] = Math.max(0, Math.min(100, stats[statKey] + value));
      }
    });
  });

  return stats;
}
