import type { UserAnswers } from '../core/personality/types';
import { openEndedQuestions } from '../core/personality/questions';

export function buildRpgPrompt(petName: string, answers: UserAnswers): string {
  const behavioralInputs = openEndedQuestions
    .map((q) => {
      return `${q.question}: "${answers[q.id] || 'Not specified'}"`;
    })
    .join('\n');

  const stressWeakness = answers.stress_weakness || 'Not specified';

  return `Generate ONLY the creative content for a pet character sheet. Return your response as valid JSON in this exact format:

{
  "type": "rpg",
  "archetype": "The [Creative Archetype Name]",
  "combatMoves": [
    {
      "name": "Ability Name",
      "stats": "Type • Success Rate • Duration",
      "description": "Description of the ability"
    },
    {
      "name": "Second Ability Name",
      "stats": "Type • Success Rate • Duration",
      "description": "Description of the ability"
    }
  ],
  "environmentalPowers": [
    {
      "name": "Power Name",
      "stats": "Type • Effect • Duration",
      "description": "Description"
    },
    {
      "name": "Second Power Name",
      "stats": "Type • Effect • Duration",
      "description": "Description"
    }
  ],
  "socialSkills": [
    {
      "name": "Skill Name",
      "stats": "Type • Success Rate • Effect",
      "description": "Description"
    },
    {
      "name": "Second Skill Name",
      "stats": "Type • Success Rate • Effect",
      "description": "Description"
    }
  ],
  "passiveTraits": [
    {
      "name": "Trait Name",
      "stats": "Type • Always Active • Effect",
      "description": "Description"
    },
    {
      "name": "Second Trait Name",
      "stats": "Type • Always Active • Effect",
      "description": "Description"
    }
  ],
  "weakness": {
    "name": "Weakness Name",
    "description": "Description of the major weakness with game mechanics"
  },
  "timeModifiers": [
    {
      "name": "Time Period or Situation",
      "effect": "Stat changes and effects"
    }
  ]
}

Pet Details:
- Name: ${petName}

Behavioral Input:
${behavioralInputs}
Biggest fear/weakness: "${stressWeakness}"

Create videogame-style abilities based on the pet's behaviors. Make ability names creative and memorable. Include game mechanics in the stats line. Return ONLY valid JSON with no other text.`;
}
