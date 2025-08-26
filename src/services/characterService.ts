import type { UserAnswers, CharacterData } from '../core/personality/types';
import { openEndedQuestions } from '../core/personality/questions';

export const LOADING_MESSAGES = [
  "Analyzing your pet's personality... 🤔",
  'Calculating combat statistics... ⚔️',
  'Generating unique abilities... ✨',
  'Crafting character sheet... 📝',
  'Adding special touches... 🎨',
  'Almost ready... 🚀',
];

export interface CharacterGenerationResult {
  success: boolean;
  characterData?: CharacterData;
  error?: string;
}

export async function generateCharacterData(
  petName: string,
  answers: UserAnswers
): Promise<CharacterGenerationResult> {
  const behavioralInputs = openEndedQuestions
    .map((q) => {
      return `${q.question}: "${answers[q.id] || 'Not specified'}"`;
    })
    .join('\n');

  const stressWeakness = answers.stress_weakness || 'Not specified';

  const prompt = `Generate ONLY the creative content for a pet character sheet. Return your response as valid JSON in this exact format:

{
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

  try {
    const response = await fetch('/api/character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    let jsonContent = data.content[0].text;

    jsonContent = jsonContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const characterData = JSON.parse(jsonContent);

    return {
      success: true,
      characterData,
    };
  } catch (error) {
    console.error('Error generating character sheet:', error);
    return {
      success: false,
      error: "Sorry, there was an error generating your pet's character sheet. Please try again.",
    };
  }
}

export function createDebugCharacterData(): CharacterData {
  return {
    archetype: 'The Contemplative Defender',
    combatMoves: [
      {
        name: 'Tail Inflation',
        stats: 'Intimidation • 85% Success • 3s Windup',
        description: 'Signature defensive move that inflates tail to maximum size',
      },
      {
        name: 'Growl Warning',
        stats: 'Area Effect • 70% Success • Instant',
        description: 'Low-frequency threat display that affects all nearby targets',
      },
    ],
    environmentalPowers: [
      {
        name: 'Blanket Fort Mastery',
        stats: 'Territory Control • Horizontal Spaces • Permanent',
        description: 'Complete dominance of under-cover zones and bedding areas',
      },
      {
        name: 'Silent Stealth Protocol',
        stats: 'Invisibility • No Coverage Required • Passive',
        description: 'Predators cannot detect waste regardless of concealment effort',
      },
    ],
    socialSkills: [
      {
        name: 'Gradual Bond Formation',
        stats: 'Trust Building • High Loyalty • Slow Activation',
        description: 'Takes time to warm up but forms deep, lasting connections',
      },
      {
        name: 'Guardian Protocol',
        stats: 'Ally Protection • Auto-Trigger • High Priority',
        description: 'Automatically intervenes to rescue or defend allies when needed',
      },
    ],
    passiveTraits: [
      {
        name: 'Contemplative Focus',
        stats: 'Mental Clarity • Constant • Stress Resistance',
        description: 'Maintains calm and clear thinking in stressful situations like vet visits',
      },
      {
        name: 'Muppet Face Advantage',
        stats: 'Charm Bonus • Visual Effect • Always Active',
        description: 'Natural endearing appearance provides social advantages',
      },
    ],
    weakness: {
      name: 'AC Startle Response',
      description: 'Sudden air conditioning activation causes -30 to all stats for 10 seconds',
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