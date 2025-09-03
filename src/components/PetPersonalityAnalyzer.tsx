import { useState, useEffect } from 'react';
import type {
  UserAnswers,
  CharacterSheet as CharacterSheetData,
} from '../core/personality/types';
import {
  getColorTheme,
  generateTextExport,
  CharacterWorkflowService,
} from '../services';
import { isFeatureEnabled } from '../config/featureFlags';
import { QuestionnaireForm } from './Questionnaire/QuestionnaireForm';
import { CharacterSheet } from './Results/CharacterSheet';
import { ShowdownPage } from './Results/ShowdownPage';
import { LoadingOverlay } from './UI/LoadingOverlay';
import { Button } from './UI/Button';
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
import { CharacterGenerationErrorBoundary } from './ErrorBoundary/CharacterGenerationErrorBoundary';

type AppStep = 'questionnaire' | 'result' | 'showdown';

export function PetPersonalityAnalyzer() {
  const [currentStep, setCurrentStep] = useState<AppStep>('questionnaire');
  const [characterSheet, setCharacterSheet] =
    useState<CharacterSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(
    null
  );
  const [showdownId, setShowdownId] = useState<string | null>(null);

  // Check for shared character or showdown URL on mount
  useEffect(() => {
    const checkForSharedContent = async () => {
      const sharedContent =
        CharacterWorkflowService.parseSharedContentFromUrl();

      if (sharedContent.type === 'character' && sharedContent.id) {
        setLoading(true);
        setLoadingMessage('Loading shared character...');

        const result = await CharacterWorkflowService.loadSharedCharacter(
          sharedContent.id
        );

        if (result.success && result.data) {
          setCharacterSheet(result.data);
          setCurrentCharacterId(sharedContent.id);
          setCurrentStep('result');
        } else {
          alert(result.error || 'Failed to load character');
          CharacterWorkflowService.clearSharedUrl();
        }

        setLoading(false);
        setLoadingMessage('');
      } else if (sharedContent.type === 'showdown' && sharedContent.id) {
        setShowdownId(sharedContent.id);
        setCurrentStep('showdown');
      }
    };

    checkForSharedContent();
  }, []);

  const handleFormSubmit = async (
    petName: string,
    answers: UserAnswers,
    petPhoto?: string | null
  ) => {
    setLoading(true);

    const result = await CharacterWorkflowService.generateCharacterSheet(
      petName,
      answers,
      petPhoto || null,
      {
        onProgress: (message: string) => setLoadingMessage(message),
        onComplete: (characterSheet: CharacterSheetData) => {
          setCharacterSheet(characterSheet);
          setCurrentStep('result');
        },
        onError: (error: string) => alert(error),
      }
    );

    if (result.success && result.data) {
      setCurrentCharacterId(result.data.characterId);
    }

    setLoading(false);
    setLoadingMessage('');
  };

  const handleDebugMode = () => {
    CharacterWorkflowService.navigateToDebugCharacter();
  };

  const handleReset = () => {
    setCurrentStep('questionnaire');
    setCharacterSheet(null);
    setCurrentCharacterId(null);
    CharacterWorkflowService.clearSharedUrl();
  };

  const handleDownload = () => {
    if (characterSheet) {
      generateTextExport(characterSheet);
    }
  };

  if (currentStep === 'result' && characterSheet) {
    const theme = getColorTheme(characterSheet.stats);

    return (
      <ErrorBoundary
        onError={(error) => {
          console.error('Character sheet display error:', error);
        }}
      >
        <CharacterSheet
          characterSheet={characterSheet}
          theme={theme}
          characterId={currentCharacterId}
          onReset={handleReset}
          onDownload={handleDownload}
        />
      </ErrorBoundary>
    );
  }

  if (currentStep === 'showdown' && showdownId) {
    return (
      <ErrorBoundary
        onError={(error) => {
          console.error('Showdown page error:', error);
        }}
      >
        <ShowdownPage showdownId={showdownId} onReset={handleReset} />
      </ErrorBoundary>
    );
  }

  return (
    <CharacterGenerationErrorBoundary onRetry={handleReset}>
      <LoadingOverlay message={loadingMessage} visible={loading} />
      <div
        className="min-h-screen p-2 sm:p-4"
        style={{
          background: 'linear-gradient(135deg, #581c87, #312e81, #1e3a8a)',
        }}
      >
        <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
          <div className="bg-gray-800 border border-gray-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl relative">
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
    </CharacterGenerationErrorBoundary>
  );
}
