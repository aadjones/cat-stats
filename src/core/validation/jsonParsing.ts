import type {
  CharacterData,
  RpgCharacterData,
  YearbookCharacterData,
  YearbookSuperlative,
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
 * Type guard for YearbookSuperlative
 */
function isYearbookSuperlative(obj: unknown): obj is YearbookSuperlative {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as YearbookSuperlative).category === 'string' &&
    typeof (obj as YearbookSuperlative).title === 'string'
  );
}

/**
 * Type guard for RPG CharacterData
 */
function isRpgCharacterData(obj: unknown): obj is RpgCharacterData {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const data = obj as RpgCharacterData;

  return (
    data.type === 'rpg' &&
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
 * Type guard for Yearbook CharacterData
 */
function isYearbookCharacterData(obj: unknown): obj is YearbookCharacterData {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const data = obj as YearbookCharacterData;

  return (
    data.type === 'yearbook' &&
    typeof data.archetype === 'string' &&
    Array.isArray(data.superlatives) &&
    data.superlatives.every(isYearbookSuperlative) &&
    typeof data.seniorQuote === 'string' &&
    Array.isArray(data.favoriteMoments) &&
    data.favoriteMoments.every((m) => typeof m === 'string') &&
    Array.isArray(data.clubs) &&
    data.clubs.every((c) => typeof c === 'string') &&
    typeof data.futureGoals === 'string'
  );
}

/**
 * Type guard for CharacterData (discriminated union)
 */
export function isCharacterData(obj: unknown): obj is CharacterData {
  return isRpgCharacterData(obj) || isYearbookCharacterData(obj);
}

/**
 * Migrate legacy character data to include type discriminator
 * Old characters don't have 'type' field, so we infer it from structure
 */
function migrateLegacyCharacterData(data: unknown): unknown {
  // Ensure data is an object
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const obj = data as Record<string, unknown>;

  // If it already has a type field, no migration needed
  if (obj.type === 'rpg' || obj.type === 'yearbook') {
    return data;
  }

  // Detect legacy RPG data: has combatMoves but no type
  if ('combatMoves' in obj && Array.isArray(obj.combatMoves)) {
    return {
      ...obj,
      type: 'rpg',
    };
  }

  // Detect legacy yearbook data: has superlatives but no type
  if ('superlatives' in obj && Array.isArray(obj.superlatives)) {
    return {
      ...obj,
      type: 'yearbook',
    };
  }

  // Return as-is if we can't detect type (will fail validation)
  return data;
}

/**
 * Parse and validate CharacterData from Claude API response
 */
export function parseCharacterData(
  jsonString: string
): SafeParseResult<CharacterData> {
  try {
    const parsed = JSON.parse(jsonString);
    const migrated = migrateLegacyCharacterData(parsed);

    if (!isCharacterData(migrated)) {
      return {
        success: false,
        error: 'Parsed data failed validation',
      };
    }

    return {
      success: true,
      data: migrated,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JSON',
    };
  }
}
