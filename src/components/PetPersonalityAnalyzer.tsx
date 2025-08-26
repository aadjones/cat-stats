import { useState } from 'react';
import type { UserAnswers, CharacterSheet as CharacterSheetData } from '../core/personality/types';
import { calculatePetStats } from '../core/personality/statsCalculator';
import { 
  generateCharacterData, 
  createDebugCharacterData,
  getColorTheme,
  generateTextExport,
  validateQuestionnaireForm,
  LOADING_MESSAGES
} from '../services';
import { QuestionnaireForm } from './Questionnaire/QuestionnaireForm';
import { CharacterSheet } from './Results/CharacterSheet';
import { LoadingOverlay } from './UI/LoadingOverlay';
import { Button } from './UI/Button';

type AppStep = 'questionnaire' | 'result';

export function PetPersonalityAnalyzer() {
  const [currentStep, setCurrentStep] = useState<AppStep>('questionnaire');
  const [characterSheet, setCharacterSheet] = useState<CharacterSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleFormSubmit = async (petName: string, answers: UserAnswers) => {
    const validation = validateQuestionnaireForm(petName, answers);
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(LOADING_MESSAGES[0]);

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessage(prev => {
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
        };
        
        setCharacterSheet(newCharacterSheet);
        setCurrentStep('result');
      } else {
        alert(result.error || 'Failed to generate character sheet');
      }
    } catch (error) {
      console.error('Error generating character sheet:', error);
      alert('Sorry, there was an error generating your pet\'s character sheet. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
      clearInterval(messageInterval);
    }
  };

  const handleDebugMode = () => {
    const debugStats = {
      wisdom: 90,
      cunning: 60,
      agility: 65,
      stealth: 95,
      charisma: 60,
      resolve: 90,
      boldness: 75,
    };

    const debugCharacterSheet: CharacterSheetData = {
      characterData: createDebugCharacterData(),
      stats: debugStats,
      petName: 'Sente',
    };

    setCharacterSheet(debugCharacterSheet);
    setCurrentStep('result');
  };

  const handleReset = () => {
    setCurrentStep('questionnaire');
    setCharacterSheet(null);
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
            <Button
              onClick={handleDebugMode}
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-xs"
            >
              Debug
            </Button>

            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">CatStats</h1>
              <p className="text-sm sm:text-base text-white/80">Turn your cat into a legend!</p>
            </div>

            <QuestionnaireForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </>
  );
}