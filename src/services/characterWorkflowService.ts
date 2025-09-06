import type { UserAnswers, CharacterSheet } from '../core/personality/types';
import { calculatePetStats } from '../core/personality/statsCalculator';
import { generateCharacterData, validateQuestionnaireForm } from './';
import { loadCharacter, saveCharacter } from './characterStorage';

export interface WorkflowResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SharedContentInfo {
  type: 'character' | 'showdown' | 'hall-of-fame' | null;
  id: string | null;
}

export interface CharacterGenerationProgress {
  onProgress?: (message: string) => void;
  onComplete?: (characterSheet: CharacterSheet) => void;
  onError?: (error: string) => void;
}

export class CharacterWorkflowService {
  private static readonly LOADING_MESSAGES = [
    "Analyzing your pet's personality... 🤔",
    'Calculating combat statistics... ⚔️',
    'Generating unique abilities... ✨',
    'Crafting character sheet... 📝',
    'Adding special touches... 🎨',
    'Almost ready... 🚀',
  ];

  /**
   * Parse URL to determine if we're loading shared content
   */
  static parseSharedContentFromUrl(): SharedContentInfo {
    const path = window.location.pathname;
    const legendMatch = path.match(/^\/legend\/([a-z0-9]{6})$/);
    const showdownMatch = path.match(/^\/showdown\/([a-z0-9]{6,10})$/);
    const hallOfFameMatch = path.match(/^\/hall-of-fame$/);

    if (legendMatch) {
      return { type: 'character', id: legendMatch[1] };
    }
    if (showdownMatch) {
      return { type: 'showdown', id: showdownMatch[1] };
    }
    if (hallOfFameMatch) {
      return { type: 'hall-of-fame', id: null };
    }
    return { type: null, id: null };
  }

  /**
   * Load a shared character by ID
   */
  static async loadSharedCharacter(
    characterId: string
  ): Promise<WorkflowResult<CharacterSheet>> {
    try {
      const sharedCharacter = await loadCharacter(characterId);

      if (!sharedCharacter) {
        return {
          success: false,
          error:
            'Character not found. It may have been removed or the link is invalid.',
        };
      }

      return {
        success: true,
        data: sharedCharacter,
      };
    } catch (error) {
      console.error('Error loading shared character:', error);
      return {
        success: false,
        error: 'Sorry, there was an error loading the shared character.',
      };
    }
  }

  /**
   * Generate a character sheet from questionnaire data with progress callbacks
   */
  static async generateCharacterSheet(
    petName: string,
    answers: UserAnswers,
    petPhoto: string | null = null,
    callbacks: CharacterGenerationProgress = {}
  ): Promise<
    WorkflowResult<{
      characterSheet: CharacterSheet;
      characterId: string | null;
    }>
  > {
    const { onProgress, onComplete, onError } = callbacks;

    // Validate input
    const validation = validateQuestionnaireForm(petName, answers);
    if (!validation.isValid) {
      const error = validation.errorMessage || 'Invalid form data';
      onError?.(error);
      return { success: false, error };
    }

    // Set up progress messaging
    let currentMessageIndex = 0;
    const messageInterval = setInterval(() => {
      currentMessageIndex =
        (currentMessageIndex + 1) % this.LOADING_MESSAGES.length;
      onProgress?.(this.LOADING_MESSAGES[currentMessageIndex]);
    }, 3000);

    onProgress?.(this.LOADING_MESSAGES[0]);

    try {
      // Calculate stats
      const stats = calculatePetStats(answers);

      // Generate character data via AI
      const result = await generateCharacterData(petName, answers);

      if (!result.success || !result.characterData) {
        const error = result.error || 'Failed to generate character sheet';
        onError?.(error);
        return { success: false, error };
      }

      // Create the character sheet
      const characterSheet: CharacterSheet = {
        characterData: result.characterData,
        stats,
        petName,
        petPhoto,
      };

      // Auto-save for sharing
      let characterId: string | null = null;
      try {
        characterId = await saveCharacter(characterSheet);
        console.log(`Character saved with ID: ${characterId}`);
      } catch (saveError) {
        console.error('Error saving character for sharing:', saveError);
        // Don't fail the entire flow if saving fails
      }

      onComplete?.(characterSheet);

      return {
        success: true,
        data: { characterSheet, characterId },
      };
    } catch (error) {
      console.error('Error generating character sheet:', error);
      const errorMessage =
        "Sorry, there was an error generating your pet's character sheet. Please try again.";
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      clearInterval(messageInterval);
    }
  }

  /**
   * Clear shared URL from browser without reload
   */
  static clearSharedUrl(): void {
    if (
      window.location.pathname.includes('/legend/') ||
      window.location.pathname.includes('/showdown/')
    ) {
      window.history.replaceState({}, '', '/');
    }
  }

  /**
   * Navigate to debug character
   */
  static navigateToDebugCharacter(): void {
    window.location.href = '/legend/sente1';
  }

  /**
   * Navigate to hall of fame
   */
  static navigateToHallOfFame(): void {
    window.location.href = '/hall-of-fame';
  }
}
