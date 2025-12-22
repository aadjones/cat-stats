import { useState } from 'react';
import type { UserAnswers } from '../../core/personality/types';
import {
  multipleChoiceQuestions,
  openEndedQuestions,
} from '../../core/personality/questions';
import { Button } from '../UI/Button';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { OpenEndedQuestion } from './OpenEndedQuestion';
import { PhotoUpload } from '../UI/PhotoUpload';

interface QuestionnaireFormProps {
  onSubmit: (
    petName: string,
    answers: UserAnswers,
    petPhoto?: string | null
  ) => void;
  loading?: boolean;
}

export function QuestionnaireForm({
  onSubmit,
  loading = false,
}: QuestionnaireFormProps) {
  const [petName, setPetName] = useState('');
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [petPhoto, setPetPhoto] = useState<string | null>(null);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    const requiredMCQuestions = multipleChoiceQuestions.every(
      (q) => answers[q.id]
    );
    const requiredOpenEnded = openEndedQuestions.every((q) =>
      answers[q.id]?.trim()
    );
    const hasWeakness = answers.stress_weakness?.trim();

    if (!petName.trim()) {
      alert("Please fill in your pet's name.");
      return;
    }

    if (!requiredMCQuestions) {
      alert('Please answer all multiple choice questions.');
      return;
    }

    if (!requiredOpenEnded || !hasWeakness) {
      alert('Please answer all open-ended questions.');
      return;
    }

    onSubmit(petName, answers, petPhoto);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-6 sm:mb-8">
        <div>
          <label className="block text-text-primary font-semibold font-body mb-2 text-sm sm:text-base">
            Pet Name
          </label>
          <input
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="w-full bg-glass border border-glass-border rounded-lg px-3 sm:px-4 py-3 sm:py-2 text-text-primary placeholder-text-muted focus:bg-glass-hover focus:border-theme-accent transition-colors text-base sm:text-sm min-h-[44px] sm:min-h-0 font-body"
            placeholder="e.g., Dr. Mittens"
          />
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <PhotoUpload onPhotoChange={setPetPhoto} currentPhoto={petPhoto} />
      </div>

      {multipleChoiceQuestions.map((question, qIndex) => (
        <MultipleChoiceQuestion
          key={question.id}
          question={question}
          selectedValue={answers[question.id]}
          onAnswerChange={handleAnswerChange}
          questionNumber={qIndex + 1}
        />
      ))}

      {openEndedQuestions.map((question, qIndex) => (
        <OpenEndedQuestion
          key={question.id}
          question={question}
          value={answers[question.id]}
          onAnswerChange={handleAnswerChange}
          questionNumber={qIndex + 6}
          placeholder={
            question.id === 'stress_weakness'
              ? 'e.g., Thunder storms, vacuum cleaner, doorbell...'
              : undefined
          }
        />
      ))}

      <Button
        onClick={handleSubmit}
        disabled={loading || !petName}
        className="w-full"
        size="lg"
      >
        {loading ? 'Creating Your Legend...' : 'Create Pet Legend'}
      </Button>
    </div>
  );
}
