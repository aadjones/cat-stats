import type { UserAnswers } from '../core/personality/types';
import { multipleChoiceQuestions, openEndedQuestions } from '../core/personality/questions';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateQuestionnaireForm(
  petName: string,
  answers: UserAnswers
): ValidationResult {
  if (!petName.trim()) {
    return {
      isValid: false,
      errorMessage: "Please fill in your pet's name.",
    };
  }

  const requiredMCQuestions = multipleChoiceQuestions.every((q) => answers[q.id]);
  if (!requiredMCQuestions) {
    return {
      isValid: false,
      errorMessage: 'Please answer all multiple choice questions.',
    };
  }

  const requiredOpenEnded = openEndedQuestions.every((q) =>
    answers[q.id]?.trim()
  );
  const hasWeakness = answers.stress_weakness?.trim();

  if (!requiredOpenEnded || !hasWeakness) {
    return {
      isValid: false,
      errorMessage: 'Please answer all open-ended questions.',
    };
  }

  return { isValid: true };
}