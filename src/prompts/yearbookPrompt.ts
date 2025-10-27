import type { UserAnswers } from '../core/personality/types';
import { openEndedQuestions } from '../core/personality/questions';

export function buildYearbookPrompt(
  petName: string,
  answers: UserAnswers
): string {
  const behavioralInputs = openEndedQuestions
    .map((q) => {
      return `${q.question}: "${answers[q.id] || 'Not specified'}"`;
    })
    .join('\n');

  const stressWeakness = answers.stress_weakness || 'Not specified';

  return `You're writing a yearbook profile for ${petName}, who just graduated from high school. They're a cat/dog, but everyone at this school treats them like a regular student - some superlatives should sound like they could apply to a human OR a pet (that's the funny part), others can be more obviously pet-specific.

Tone: Mix of sweet/nostalgic and slightly catty. Like if the yearbook committee had one dramatic theater kid and one popular girl who low-key throws shade. Some entries genuine, some with a subtle edge.

Return ONLY valid JSON in this EXACT format:

{
  "type": "yearbook",
  "archetype": "Most Likely to [Something Actually Funny - not generic]",
  "superlatives": [
    {
      "category": "Most Likely To",
      "title": "Sleep through graduation / Be found under the bleachers / etc - be specific and behavior-based"
    },
    {
      "category": "Biggest / Best / Worst / Most",
      "title": "Use REAL yearbook language - 'Worst case of senioritis', 'Best at avoiding eye contact', etc"
    },
    {
      "category": "Always Caught",
      "title": "Their signature move - 'Stealing food from the cafeteria', 'Napping in the library', etc"
    }
  ],
  "seniorQuote": "10 words MAX. Make it sound like something a teenager would actually pick - could be trying-too-hard deep, could be a joke, could be lyrics. Should match their personality.",
  "favoriteMoments": [
    "2-3 specific moments only. Reference actual high school things (cafeteria, prom, class trip) but make it about their behavior. Examples: 'That time they knocked over the entire lunch tray tower', 'Getting caught sleeping during the SATs'"
  ],
  "clubs": [
    "2 clubs MAX. Make them sound like real high school clubs but slightly absurd. 'Nap Club President', 'Unofficial Parking Lot Security', 'Drama Club (but just for the snacks)'"
  ],
  "futureGoals": "One sentence only. Keep it realistic but funny - like what the guidance counselor would write knowing full well it won't happen."
}

Their actual personality:
${behavioralInputs}
Their fear/weakness: "${stressWeakness}"

Remember: The humor comes from imagining your pet as an actual high school student. Some things should be ambiguous enough that you're like "wait, is this about a human or a cat?" Return ONLY valid JSON.`;
}
