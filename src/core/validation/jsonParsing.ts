import type {
  CharacterData,
  CharacterAbility,
  CharacterWeakness,
  CharacterModifier,
} from '../personality/types';

export interface SafeParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Safely parse JSON with error handling and basic validation
 */
export function safeJsonParse<T>(
  jsonString: string,
  validator?: (data: unknown) => data is T
): SafeParseResult<T> {
  try {
    const parsed = JSON.parse(jsonString);

    if (validator && !validator(parsed)) {
      return {
        success: false,
        error: 'Parsed data failed validation',
      };
    }

    return {
      success: true,
      data: parsed as T,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JSON',
    };
  }
}

/**
 * Type guard for CharacterAbility
 */
function isCharacterAbility(obj: unknown): obj is CharacterAbility {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as CharacterAbility).name === 'string' &&
    typeof (obj as CharacterAbility).stats === 'string' &&
    typeof (obj as CharacterAbility).description === 'string'
  );
}

/**
 * Type guard for CharacterWeakness
 */
function isCharacterWeakness(obj: unknown): obj is CharacterWeakness {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as CharacterWeakness).name === 'string' &&
    typeof (obj as CharacterWeakness).description === 'string'
  );
}

/**
 * Type guard for CharacterModifier
 */
function isCharacterModifier(obj: unknown): obj is CharacterModifier {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as CharacterModifier).name === 'string' &&
    typeof (obj as CharacterModifier).effect === 'string'
  );
}

/**
 * Type guard for CharacterData from Claude API response
 */
export function isCharacterData(obj: unknown): obj is CharacterData {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const data = obj as CharacterData;

  return (
    typeof data.archetype === 'string' &&
    Array.isArray(data.combatMoves) &&
    data.combatMoves.every(isCharacterAbility) &&
    Array.isArray(data.environmentalPowers) &&
    data.environmentalPowers.every(isCharacterAbility) &&
    Array.isArray(data.socialSkills) &&
    data.socialSkills.every(isCharacterAbility) &&
    Array.isArray(data.passiveTraits) &&
    data.passiveTraits.every(isCharacterAbility) &&
    isCharacterWeakness(data.weakness) &&
    Array.isArray(data.timeModifiers) &&
    data.timeModifiers.every(isCharacterModifier)
  );
}

/**
 * Parse and validate CharacterData from Claude API response
 */
export function parseCharacterData(
  jsonString: string
): SafeParseResult<CharacterData> {
  return safeJsonParse(jsonString, isCharacterData);
}
