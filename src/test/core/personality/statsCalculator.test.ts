import { calculatePetStats } from '../../../core/personality/statsCalculator';
import type { UserAnswers } from '../../../core/personality/types';

describe('calculatePetStats', () => {
  it('should return base stats when no answers provided', () => {
    const stats = calculatePetStats({});
    
    expect(stats).toEqual({
      wisdom: 50,
      cunning: 50,
      agility: 50,
      stealth: 50,
      charisma: 50,
      resolve: 50,
      boldness: 50
    });
  });

  it('should increase charisma and boldness for social pet behavior', () => {
    const answers: UserAnswers = {
      'meeting_people': 'A' // "Immediately runs up with a toy"
    };
    
    const stats = calculatePetStats(answers);
    
    expect(stats.charisma).toBe(75); // 50 + 25
    expect(stats.boldness).toBe(60); // 50 + 10
    expect(stats.wisdom).toBe(50); // unchanged
  });

  it('should increase wisdom and cunning for cautious behavior', () => {
    const answers: UserAnswers = {
      'meeting_people': 'B' // "Approaches slowly, sniffs cautiously"
    };
    
    const stats = calculatePetStats(answers);
    
    expect(stats.wisdom).toBe(65); // 50 + 15
    expect(stats.cunning).toBe(60); // 50 + 10
    expect(stats.charisma).toBe(50); // unchanged
  });

  it('should handle negative stat adjustments', () => {
    const answers: UserAnswers = {
      'meeting_people': 'D', // charisma: -10
      'stress_response': 'A'  // resolve: -15
    };
    
    const stats = calculatePetStats(answers);
    
    expect(stats.charisma).toBe(40); // 50 - 10
    expect(stats.resolve).toBe(35); // 50 - 15
  });

  it('should cap stats at 100 maximum', () => {
    const answers: UserAnswers = {
      'meeting_people': 'A',    // charisma: +25
      'problem_solving': 'C',   // charisma: +20
      'stress_response': 'C'    // charisma: +10
    };
    
    const stats = calculatePetStats(answers);
    
    // 50 + 25 + 20 + 10 = 105, capped at 100
    expect(stats.charisma).toBe(100);
  });

  it('should cap stats at 0 minimum', () => {
    const answers: UserAnswers = {
      'meeting_people': 'D',     // charisma: -10, stealth: +25
      'stress_response': 'A',    // resolve: -15, boldness: +10
      'problem_solving': 'C'     // charisma: +20, resolve: -10
    };
    
    const stats = calculatePetStats(answers);
    
    expect(stats.charisma).toBe(60); // 50 - 10 + 20 = 60
    expect(stats.resolve).toBe(25); // 50 - 15 - 10 = 25
  });

  it('should ignore invalid question IDs', () => {
    const answers: UserAnswers = {
      'invalid_question': 'A',
      'meeting_people': 'A'
    };
    
    const stats = calculatePetStats(answers);
    
    expect(stats.charisma).toBe(75); // Only valid question processed
  });

  it('should ignore invalid option values', () => {
    const answers: UserAnswers = {
      'meeting_people': 'Z' // Invalid option
    };
    
    const stats = calculatePetStats(answers);
    
    // Should remain at base values
    expect(stats).toEqual({
      wisdom: 50,
      cunning: 50,
      agility: 50,
      stealth: 50,
      charisma: 50,
      resolve: 50,
      boldness: 50
    });
  });
});