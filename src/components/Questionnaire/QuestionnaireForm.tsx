import { useState } from 'react';
import type { UserAnswers } from '../../core/personality/types';
import { multipleChoiceQuestions, openEndedQuestions } from '../../core/personality/questions';
import { Button } from '../UI/Button';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { OpenEndedQuestion } from './OpenEndedQuestion';

interface QuestionnaireFormProps {
  onSubmit: (petName: string, answers: UserAnswers) => void;
  loading?: boolean;
}

export function QuestionnaireForm({ onSubmit, loading = false }: QuestionnaireFormProps) {
  const [petName, setPetName] = useState('');
  const [answers, setAnswers] = useState<UserAnswers>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    const requiredMCQuestions = multipleChoiceQuestions.every((q) => answers[q.id]);
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

    onSubmit(petName, answers);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div>
          <label className="block text-white font-semibold mb-2">
            Pet Name
          </label>
          <input
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/50 transition-colors"
            placeholder="e.g., Fluffy"
          />
        </div>
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

      <div className="space-y-3">
        <h3 className="text-white font-semibold text-lg">
          What's your pet's biggest fear or weakness?
        </h3>
        <textarea
          value={answers.stress_weakness || ''}
          onChange={(e) =>
            handleAnswerChange('stress_weakness', e.target.value)
          }
          className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/50 transition-colors h-16"
          placeholder="e.g., Thunder storms, vacuum cleaner, doorbell..."
        />
      </div>

      {openEndedQuestions.map((question, qIndex) => (
        <OpenEndedQuestion
          key={question.id}
          question={question}
          value={answers[question.id]}
          onAnswerChange={handleAnswerChange}
          questionNumber={qIndex + 6}
        />
      ))}

      <Button
        onClick={handleSubmit}
        disabled={loading || !petName}
        className="w-full"
        size="lg"
      >
        {loading ? 'Creating Your Legend...' : 'Create Cat Legend'}
      </Button>
    </div>
  );
}