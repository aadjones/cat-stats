import type { UserAnswers } from '../personality/types';
import {
  multipleChoiceQuestions,
  openEndedQuestions,
} from '../personality/questions';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Input length limits
const MAX_PET_NAME_LENGTH = 50;
const MAX_ANSWER_LENGTH = 500;

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

  if (petName.length > MAX_PET_NAME_LENGTH) {
    return {
      isValid: false,
      errorMessage: `Pet name must be ${MAX_PET_NAME_LENGTH} characters or less.`,
    };
  }

  const requiredMCQuestions = multipleChoiceQuestions.every(
    (q) => answers[q.id]
  );
  if (!requiredMCQuestions) {
    return {
      isValid: false,
      errorMessage: 'Please answer all multiple choice questions.',
    };
  }

  // Check open-ended questions exist and are within length limits
  for (const q of openEndedQuestions) {
    const answer = answers[q.id]?.trim();
    if (!answer) {
      return {
        isValid: false,
        errorMessage: 'Please answer all open-ended questions.',
      };
    }
    if (answer.length > MAX_ANSWER_LENGTH) {
      return {
        isValid: false,
        errorMessage: `Please keep answers to ${MAX_ANSWER_LENGTH} characters or less.`,
      };
    }
  }

  return { isValid: true };
}
