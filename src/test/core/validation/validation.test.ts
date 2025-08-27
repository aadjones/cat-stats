import { validateQuestionnaireForm } from '../../../core/validation/validation';
import type { UserAnswers } from '../../../core/personality/types';

describe('Validation Service', () => {
  describe('validateQuestionnaireForm', () => {
    const validAnswers: UserAnswers = {
      // Multiple choice questions (from questions.ts)
      meeting_people: 'A',
      problem_solving: 'B',
      stress_response: 'C',
      favorite_spot: 'A',
      activity_time: 'B',

      // Open-ended questions
      physical_feat: 'Jumped 6 feet to catch a bird',
      attention_move: 'Sits and stares until I notice',
      weird_habit: 'Sleeps in the sink',
      intelligence: 'Figured out how to open doors',
      superpower: 'Teleportation - always appears when food opens',

      // Special hardcoded field in validation
      stress_weakness: 'Gets scared of loud noises',
    };

    test('accepts valid questionnaire with all fields filled', () => {
      const result = validateQuestionnaireForm('Whiskers', validAnswers);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    test('rejects empty pet name', () => {
      const result = validateQuestionnaireForm('', validAnswers);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Please fill in your pet's name.");
    });

    test('rejects whitespace-only pet name', () => {
      const result = validateQuestionnaireForm('   ', validAnswers);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Please fill in your pet's name.");
    });

    test('rejects missing multiple choice answers', () => {
      const incompleteAnswers = { ...validAnswers };
      delete incompleteAnswers.meeting_people;

      const result = validateQuestionnaireForm('Whiskers', incompleteAnswers);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please answer all multiple choice questions.'
      );
    });

    test('rejects missing open-ended answers', () => {
      const incompleteAnswers = { ...validAnswers };
      delete incompleteAnswers.physical_feat;

      const result = validateQuestionnaireForm('Whiskers', incompleteAnswers);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please answer all open-ended questions.'
      );
    });

    test('rejects empty open-ended answers', () => {
      const answersWithEmpty = {
        ...validAnswers,
        attention_move: '',
      };

      const result = validateQuestionnaireForm('Whiskers', answersWithEmpty);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please answer all open-ended questions.'
      );
    });

    test('rejects whitespace-only open-ended answers', () => {
      const answersWithWhitespace = {
        ...validAnswers,
        weird_habit: '   ',
      };

      const result = validateQuestionnaireForm(
        'Whiskers',
        answersWithWhitespace
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please answer all open-ended questions.'
      );
    });

    test('rejects missing required open-ended question', () => {
      const answersWithoutIntelligence = { ...validAnswers };
      delete answersWithoutIntelligence.intelligence;

      const result = validateQuestionnaireForm(
        'Whiskers',
        answersWithoutIntelligence
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please answer all open-ended questions.'
      );
    });

    test('rejects empty open-ended question', () => {
      const answersWithEmptyField = {
        ...validAnswers,
        superpower: '',
      };

      const result = validateQuestionnaireForm(
        'Whiskers',
        answersWithEmptyField
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please answer all open-ended questions.'
      );
    });

    test('accepts pet names with special characters and numbers', () => {
      const specialNames = [
        'Mr. Whiskers',
        'Fluffy123',
        'Señor Gato',
        'Cat-tastic!',
      ];

      specialNames.forEach((name) => {
        const result = validateQuestionnaireForm(name, validAnswers);
        expect(result.isValid).toBe(true);
      });
    });

    test('handles extra/unknown fields gracefully', () => {
      const answersWithExtra = {
        ...validAnswers,
        unknown_field: 'This should not break validation',
        another_field: 'Neither should this',
      };

      const result = validateQuestionnaireForm('Whiskers', answersWithExtra);

      expect(result.isValid).toBe(true);
    });
  });
});
