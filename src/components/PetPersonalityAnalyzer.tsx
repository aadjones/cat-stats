import { useState, useEffect } from 'react';
import type {
  UserAnswers,
  CharacterSheet as CharacterSheetData,
} from '../core/personality/types';
import {
  getColorTheme,
  generateTextExport,
  generatePdfExport,
  CharacterWorkflowService,
} from '../services';
import { isFeatureEnabled } from '../config/featureFlags';
import { QuestionnaireForm } from './Questionnaire/QuestionnaireForm';
import { CharacterSheet } from './Results/CharacterSheet';
import { AnimatedShareCard } from './Results/AnimatedShareCard';
import { ShowdownPage } from './Results/ShowdownPage';
import { LoadingOverlay } from './UI/LoadingOverlay';
import { Button } from './UI/Button';
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
import { CharacterGenerationErrorBoundary } from './ErrorBoundary/CharacterGenerationErrorBoundary';
import { HallOfFame } from './HallOfFame/HallOfFame';
import { CharacterSheetPreview } from './Landing/CharacterSheetPreview';
import { AdminLayout } from './Admin/AdminLayout';
import type { AdminSection } from '../services/characterWorkflowService';

type AppStep =
  | 'questionnaire'
  | 'result'
  | 'showdown'
  | 'hall-of-fame'
  | 'admin';
type ViewMode = 'animated' | 'static';

export function PetPersonalityAnalyzer() {
  const [currentStep, setCurrentStep] = useState<AppStep>('questionnaire');
  const [viewMode, setViewMode] = useState<ViewMode>('animated');
  const [characterSheet, setCharacterSheet] =
    useState<CharacterSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(
    null
  );
  const [showdownId, setShowdownId] = useState<string | null>(null);
  const [adminSection, setAdminSection] = useState<AdminSection>('analytics');

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
      } else if (sharedContent.type === 'hall-of-fame') {
        setCurrentStep('hall-of-fame');
      } else if (sharedContent.type === 'admin') {
        setAdminSection(sharedContent.adminSection || 'analytics');
        setCurrentStep('admin');
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

  const handleExamples = () => {
    CharacterWorkflowService.navigateToHallOfFame();
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

  const handlePdfDownload = async () => {
    if (characterSheet) {
      try {
        // Track PDF download click
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'pdf_downloads' }),
        }).catch((err) => console.error('Failed to track PDF download:', err));

        await generatePdfExport(characterSheet, currentCharacterId);
      } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Sorry, PDF generation failed. Please try again.');
      }
    }
  };

  if (currentStep === 'result' && characterSheet) {
    const theme = getColorTheme(characterSheet.stats);

    return (
      <ErrorBoundary
        onError={(error) => {
          console.error('Character display error:', error);
        }}
      >
        <div
          className="min-h-screen p-2 sm:p-4"
          style={{ backgroundColor: theme.accent }}
        >
          {/* Hidden shareable card for image generation - BROKEN as of 4 Sep 2025 */}
          {isFeatureEnabled('ENABLE_SHAREABLE_CARD_IMAGE') && (
            <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
              <div id="shareable-card">
                <AnimatedShareCard
                  characterSheet={characterSheet}
                  theme={theme}
                  onAnimationComplete={() => {}}
                />
              </div>
            </div>
          )}
          {/* Toggle between animated and static views */}
          <div className="w-full max-w-4xl mx-auto mb-0 px-2 sm:px-0">
            <div className="flex justify-center">
              <div className="bg-theme-surface border border-theme-border rounded-md p-0.5 flex">
                <button
                  onClick={() => setViewMode('animated')}
                  className={`px-2 py-1.5 rounded text-xs font-medium font-body transition-all ${
                    viewMode === 'animated'
                      ? 'bg-theme-accent text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-glass'
                  }`}
                >
                  🎬 Video Highlights
                </button>
                <button
                  onClick={() => setViewMode('static')}
                  className={`px-2 py-1.5 rounded text-xs font-medium font-body transition-all ${
                    viewMode === 'static'
                      ? 'bg-theme-accent text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-glass'
                  }`}
                >
                  📊 Full Stats
                </button>
              </div>
            </div>
          </div>

          {/* Render the appropriate view */}
          {viewMode === 'animated' ? (
            <div className="flex items-center justify-center">
              <AnimatedShareCard
                characterSheet={characterSheet}
                theme={theme}
                onAnimationComplete={() => {
                  // Could add loop counter or other logic here
                }}
              />
            </div>
          ) : (
            <CharacterSheet
              characterSheet={characterSheet}
              theme={theme}
              characterId={currentCharacterId}
              onReset={handleReset}
              onDownload={handleDownload}
            />
          )}

          {/* Shared actions at the bottom */}
          <div className="w-full max-w-4xl mx-auto mt-1 px-2 sm:px-0">
            <div className="flex flex-row gap-1.5 justify-center items-center">
              {currentCharacterId && (
                <Button
                  onClick={async () => {
                    // Reuse the sharing logic from CharacterSheet
                    const { getCharacterShareUrl } = await import(
                      '../services/characterStorage'
                    );
                    const { generateShareableImage } = await import(
                      '../services'
                    );

                    const shareUrl = getCharacterShareUrl(currentCharacterId);
                    const imageBlob = isFeatureEnabled(
                      'ENABLE_SHAREABLE_CARD_IMAGE'
                    )
                      ? await generateShareableImage('shareable-card')
                      : null;

                    try {
                      // Track share button click
                      fetch('/api/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ event: 'share_button_clicks' }),
                      }).catch((err) =>
                        console.error('Failed to track share click:', err)
                      );

                      if (
                        navigator.share &&
                        imageBlob &&
                        'canShare' in navigator
                      ) {
                        const imageFile = new File(
                          [imageBlob],
                          `${characterSheet.petName}-CatStats.png`,
                          {
                            type: 'image/png',
                          }
                        );

                        const shareData = {
                          text: `Meet ${characterSheet.petName} - ${characterSheet.characterData.archetype}! 🐈‍⬛⚔️\n\nCheck out the full character sheet: ${shareUrl}`,
                          files: [imageFile],
                        };

                        if (navigator.canShare(shareData)) {
                          await navigator.share(shareData);
                          return;
                        }
                      }

                      if (navigator.share) {
                        await navigator.share({
                          title: `Meet ${characterSheet.petName} - ${characterSheet.characterData.archetype}`,
                          text: `Check out ${characterSheet.petName}'s complete legendary character sheet! 🐈‍⬛⚔️`,
                          url: shareUrl,
                        });
                      } else {
                        await navigator.clipboard.writeText(shareUrl);
                        alert(`✨ Character link copied! Share it anywhere.`);
                      }
                    } catch (error) {
                      if ((error as Error).name === 'AbortError') return;
                      console.error('Error sharing:', error);
                      alert(
                        'Sorry, there was an error sharing. Please try again.'
                      );
                    }
                  }}
                  variant="primary"
                  size="sm"
                  className="!min-h-0 !py-1.5"
                >
                  📤 Share
                </Button>
              )}

              {isFeatureEnabled('ENABLE_TEXT_EXPORT') && (
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  size="sm"
                  className="!min-h-0 !py-1.5"
                >
                  📄 Download TXT
                </Button>
              )}

              <Button
                onClick={handlePdfDownload}
                variant="secondary"
                size="sm"
                className="!min-h-0 !py-1.5"
              >
                📑 Download PDF
              </Button>

              <Button
                onClick={handleReset}
                variant="secondary"
                size="sm"
                className="!min-h-0 !py-1.5"
              >
                ← Create Another
              </Button>

              {isFeatureEnabled('ENABLE_CHARACTER_COMPARISON') && (
                <Button
                  onClick={() => {
                    // TODO: Implement character comparison when feature is enabled
                  }}
                  variant="secondary"
                  size="sm"
                  className="!min-h-0 !py-1.5"
                >
                  ⚔️ Compare
                </Button>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (currentStep === 'hall-of-fame') {
    return <HallOfFame />;
  }

  if (currentStep === 'admin') {
    return <AdminLayout initialSection={adminSection} onBack={handleReset} />;
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
          background:
            'linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))',
        }}
      >
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-0">
          <div className="bg-theme-surface border border-theme-border rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-xl relative">
            {/* Desktop: Absolute positioned button */}
            {isFeatureEnabled('SHOW_DEBUG_BUTTON') && (
              <Button
                onClick={handleExamples}
                variant="primary"
                size="sm"
                className="hidden sm:block absolute top-4 right-4 text-xs"
              >
                Hall of Fame
              </Button>
            )}

            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-text-primary mb-3 leading-tight">
                CatStats
              </h1>
              <p className="text-lg sm:text-xl text-text-primary mb-3 font-medium font-body px-1 leading-snug">
                Turn your pet into a legend!
              </p>
              <p className="text-sm sm:text-base text-text-secondary mb-4 px-2 leading-relaxed font-body">
                Get your pet's personality breakdown with epic stats, unique
                abilities, and a shareable character sheet.
              </p>
            </div>

            {/* Character Sheet Preview */}
            <div className="mb-4">
              <CharacterSheetPreview />
            </div>

            {/* Hall of Fame call-to-action */}
            {isFeatureEnabled('SHOW_DEBUG_BUTTON') && (
              <div className="text-center mb-4">
                <Button
                  onClick={handleExamples}
                  variant="secondary"
                  size="md"
                  className="bg-white/10 hover:bg-white/20 border-white/20 w-full sm:w-auto"
                >
                  🏆 Check out the Hall of Fame
                </Button>
              </div>
            )}

            {/* Visual Separator */}
            <div className="flex items-center my-6 sm:my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-theme-accent/50 to-transparent"></div>
              <div className="px-3 sm:px-4 text-text-secondary text-sm font-medium text-center font-body">
                <div>Create Your Legend</div>
                <div className="text-xs text-text-muted mt-1">
                  11 quick questions
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-theme-accent/50 to-transparent"></div>
            </div>

            <QuestionnaireForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </CharacterGenerationErrorBoundary>
  );
}
