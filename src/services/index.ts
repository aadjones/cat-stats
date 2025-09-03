export { getColorTheme } from './themeService';
export type { Theme } from './themeService';

export { generateTextExport } from './exportService';

export {
  shareCharacterSheet,
  downloadCharacterImage,
  getShareCapabilities,
  generateShareableImage,
} from './shareService';

export { generateCharacterData, LOADING_MESSAGES } from './api/characterApi';
export type { CharacterGenerationResult } from './api/characterApi';

export { createDebugCharacterData } from './factories/mockCharacterFactory';

export { validateQuestionnaireForm } from '../core/validation';
export type { ValidationResult } from '../core/validation';

export {
  generateFriendshipReport,
  validateFriendshipInput,
  getCharacterDisplayNames,
  FRIENDSHIP_LOADING_MESSAGES,
} from './api/friendshipApi';
export type { FriendshipGenerationResult } from './api/friendshipApi';

export { calculateCompatibility } from '../core/friendship/compatibilityCalculator';
export type {
  FriendshipReport,
  CompatibilityMetrics,
  FriendshipInput,
} from '../core/friendship/types';

export { CharacterWorkflowService } from './characterWorkflowService';
export type {
  WorkflowResult,
  SharedContentInfo,
  CharacterGenerationProgress,
} from './characterWorkflowService';
