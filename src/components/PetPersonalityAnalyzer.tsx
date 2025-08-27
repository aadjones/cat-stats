import { useState, useEffect } from 'react';
import type {
  UserAnswers,
  CharacterSheet as CharacterSheetData,
} from '../core/personality/types';
import { calculatePetStats } from '../core/personality/statsCalculator';
import {
  generateCharacterData,
  getColorTheme,
  generateTextExport,
  validateQuestionnaireForm,
  LOADING_MESSAGES,
} from '../services';
import { loadCharacter, saveCharacter } from '../services/characterStorage';
import { isFeatureEnabled } from '../config/featureFlags';
import { QuestionnaireForm } from './Questionnaire/QuestionnaireForm';
import { CharacterSheet } from './Results/CharacterSheet';
import { LoadingOverlay } from './UI/LoadingOverlay';
import { Button } from './UI/Button';

type AppStep = 'questionnaire' | 'result';

export function PetPersonalityAnalyzer() {
  const [currentStep, setCurrentStep] = useState<AppStep>('questionnaire');
  const [characterSheet, setCharacterSheet] =
    useState<CharacterSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(
    null
  );

  // Check for shared character URL on mount
  useEffect(() => {
    const checkForSharedCharacter = async () => {
      const path = window.location.pathname;
      const legendMatch = path.match(/^\/legend\/([a-z0-9]{6})$/);

      if (legendMatch) {
        const characterId = legendMatch[1];
        setLoading(true);
        setLoadingMessage('Loading shared character...');

        try {
          const sharedCharacter = await loadCharacter(characterId);
          if (sharedCharacter) {
            setCharacterSheet(sharedCharacter);
            setCurrentCharacterId(characterId);
            setCurrentStep('result');
          } else {
            alert(
              'Character not found. It may have been removed or the link is invalid.'
            );
            // Clear the URL and return to questionnaire
            window.history.replaceState({}, '', '/');
          }
        } catch (error) {
          console.error('Error loading shared character:', error);
          alert('Sorry, there was an error loading the shared character.');
          window.history.replaceState({}, '', '/');
        } finally {
          setLoading(false);
          setLoadingMessage('');
        }
      }
    };

    checkForSharedCharacter();
  }, []);

  const handleFormSubmit = async (
    petName: string,
    answers: UserAnswers,
    petPhoto?: string | null
  ) => {
    const validation = validateQuestionnaireForm(petName, answers);
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(LOADING_MESSAGES[0]);

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessage((prev) => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIndex];
      });
    }, 3000);

    try {
      const stats = calculatePetStats(answers);
      const result = await generateCharacterData(petName, answers);

      if (result.success && result.characterData) {
        const newCharacterSheet: CharacterSheetData = {
          characterData: result.characterData,
          stats,
          petName,
          petPhoto,
        };

        setCharacterSheet(newCharacterSheet);
        setCurrentStep('result');

        // Auto-save the character for sharing
        try {
          const characterId = await saveCharacter(newCharacterSheet);
          setCurrentCharacterId(characterId);
          console.log(`Character saved with ID: ${characterId}`);
        } catch (saveError) {
          console.error('Error saving character for sharing:', saveError);
          // Don't block the user flow if saving fails
        }
      } else {
        alert(result.error || 'Failed to generate character sheet');
      }
    } catch (error) {
      console.error('Error generating character sheet:', error);
      alert(
        "Sorry, there was an error generating your pet's character sheet. Please try again."
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
      clearInterval(messageInterval);
    }
  };

  const handleDebugMode = () => {
    // Redirect to the shared character URL
    window.location.href = '/legend/sente1';
  };

  const handleReset = () => {
    setCurrentStep('questionnaire');
    setCharacterSheet(null);
    setCurrentCharacterId(null);
    // Clear the URL if we're on a shared character page
    if (window.location.pathname.includes('/legend/')) {
      window.history.replaceState({}, '', '/');
    }
  };

  const handleDownload = () => {
    if (characterSheet) {
      generateTextExport(characterSheet);
    }
  };

  if (currentStep === 'result' && characterSheet) {
    const theme = getColorTheme(characterSheet.stats);

    return (
      <CharacterSheet
        characterSheet={characterSheet}
        theme={theme}
        characterId={currentCharacterId}
        onReset={handleReset}
        onDownload={handleDownload}
      />
    );
  }

  return (
    <>
      <LoadingOverlay message={loadingMessage} visible={loading} />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-2 sm:p-4">
        <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl relative">
            {isFeatureEnabled('SHOW_DEBUG_BUTTON') && (
              <Button
                onClick={handleDebugMode}
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-xs"
              >
                See Example
              </Button>
            )}

            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                CatStats
              </h1>
              <p className="text-sm sm:text-base text-white/80">
                Turn your pet into a legend!
              </p>
            </div>

            <QuestionnaireForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </>
  );
}
