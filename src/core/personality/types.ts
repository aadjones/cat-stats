export interface PetStats {
  wisdom: number;
  cunning: number;
  agility: number;
  stealth: number;
  charisma: number;
  resolve: number;
  boldness: number;
}

export interface QuestionOption {
  value: string;
  text: string;
  stats: Partial<
    PetStats & {
      territory: string;
      energy: string;
    }
  >;
}

export interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
}

export interface OpenEndedQuestion {
  id: string;
  question: string;
}

export interface UserAnswers {
  [questionId: string]: string;
}

export interface CharacterAbility {
  name: string;
  stats: string;
  description: string;
}

export interface CharacterWeakness {
  name: string;
  description: string;
}

export interface CharacterModifier {
  name: string;
  effect: string;
}

export interface CharacterData {
  archetype: string;
  combatMoves: CharacterAbility[];
  environmentalPowers: CharacterAbility[];
  socialSkills: CharacterAbility[];
  passiveTraits: CharacterAbility[];
  weakness: CharacterWeakness;
  timeModifiers: CharacterModifier[];
}

export interface CharacterSheet {
  characterData: CharacterData;
  stats: PetStats;
  petName: string;
  petPhoto?: string | null;
}
