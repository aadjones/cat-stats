export interface PetStats {
  wisdom: number;
  cunning: number;
  agility: number;
  stealth: number;
  charisma: number;
  resolve: number;
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

// Yearbook-specific data structures
export interface YearbookSuperlative {
  category: string;
  title: string;
}

// Base character data
interface BaseCharacterData {
  archetype: string;
}

// RPG-specific character data
export interface RpgCharacterData extends BaseCharacterData {
  type: 'rpg';
  combatMoves: CharacterAbility[];
  environmentalPowers: CharacterAbility[];
  socialSkills: CharacterAbility[];
  passiveTraits: CharacterAbility[];
  weakness: CharacterWeakness;
  timeModifiers: CharacterModifier[];
}

// Yearbook-specific character data
export interface YearbookCharacterData extends BaseCharacterData {
  type: 'yearbook';
  superlatives: YearbookSuperlative[];
  seniorQuote: string;
  favoriteMoments: string[];
  clubs: string[];
  futureGoals: string;
}

// Discriminated union - TypeScript will enforce proper type checking
export type CharacterData = RpgCharacterData | YearbookCharacterData;

// Type guards for runtime checking
export function isRpgCharacterData(
  data: CharacterData
): data is RpgCharacterData {
  return data.type === 'rpg';
}

export function isYearbookCharacterData(
  data: CharacterData
): data is YearbookCharacterData {
  return data.type === 'yearbook';
}

export interface CharacterSheet {
  characterData: CharacterData;
  stats: PetStats;
  petName: string;
  petPhoto?: string | null;
}
