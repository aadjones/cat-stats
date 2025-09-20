import type { Question, OpenEndedQuestion } from './types';

export const multipleChoiceQuestions: Question[] = [
  {
    id: 'meeting_people',
    question: 'When meeting a new person, your pet typically...',
    options: [
      {
        value: 'A',
        text: 'Runs up with a toy or starts showing off',
        stats: { charisma: 25, boldness: 10 },
      },
      {
        value: 'B',
        text: 'Approaches slowly, sniffs cautiously, then decides if the human is worthy',
        stats: { wisdom: 15, cunning: 10 },
      },
      {
        value: 'C',
        text: 'Watches from a safe distance until the human proves itself',
        stats: { stealth: 20, wisdom: 15 },
      },
      {
        value: 'D',
        text: 'Hides completely until the human leaves',
        stats: { charisma: -10, stealth: 25 },
      },
    ],
  },
  {
    id: 'problem_solving',
    question: "Your pet's problem-solving approach is to...",
    options: [
      {
        value: 'A',
        text: 'Find the most acrobatic route - climb, jump, or parkour their way there',
        stats: { agility: 20, boldness: 15 },
      },
      {
        value: 'B',
        text: 'Study the situation carefully, then execute a precise plan',
        stats: { wisdom: 25, cunning: 10 },
      },
      {
        value: 'C',
        text: 'Use pure persistence - stare, whine, or paw until you help',
        stats: { charisma: 20, resolve: -10 },
      },
      {
        value: 'D',
        text: "Find a sneaky workaround when no one's watching",
        stats: { cunning: 20, stealth: 15 },
      },
    ],
  },
  {
    id: 'stress_response',
    question:
      'During stressful situations (loud noises, vet visits), your pet...',
    options: [
      {
        value: 'A',
        text: 'Gets agitated and protests - this is an outrage!',
        stats: { resolve: -15, boldness: 10 },
      },
      {
        value: 'B',
        text: 'Stays calm and handles it like a pro',
        stats: { resolve: 25, wisdom: 15 },
      },
      {
        value: 'C',
        text: 'Seeks comfort but remains relatively composed',
        stats: { resolve: 10, charisma: 10 },
      },
      {
        value: 'D',
        text: "Completely shuts down or hides until it's over",
        stats: { stealth: 15, boldness: -10 },
      },
    ],
  },
  {
    id: 'favorite_spot',
    question: "Your pet's favorite hangout spot is...",
    options: [
      {
        value: 'A',
        text: 'The highest perch - on top of furniture, appliances, etc.',
        stats: { agility: 15, territory: 'Vertical' },
      },
      {
        value: 'B',
        text: 'Hidden under blankets, beds, or cozy enclosed spaces',
        stats: { stealth: 20, territory: 'Horizontal' },
      },
      {
        value: 'C',
        text: 'Right in the middle of family activity - kitchen, living room',
        stats: { charisma: 15, territory: 'Social' },
      },
      {
        value: 'D',
        text: 'A sunny window spot where they can survey everything',
        stats: { wisdom: 10, territory: 'Surveillance' },
      },
    ],
  },
  {
    id: 'activity_time',
    question: 'Your pet is most active and social during...',
    options: [
      {
        value: 'A',
        text: 'Early morning - ready to start the day!',
        stats: { energy: 'Morning' },
      },
      {
        value: 'B',
        text: 'Afternoon - peak performance time',
        stats: { energy: 'Afternoon' },
      },
      {
        value: 'C',
        text: 'Evening - suddenly becomes super affectionate or energetic',
        stats: { energy: 'Evening' },
      },
      {
        value: 'D',
        text: "They're pretty consistent throughout the day",
        stats: { energy: 'Balanced' },
      },
    ],
  },
];

export const openEndedQuestions: OpenEndedQuestion[] = [
  {
    id: 'physical_feat',
    question:
      "What's the most impressive physical thing your pet has ever done?",
  },
  {
    id: 'attention_move',
    question:
      "Describe your pet's signature move when they want attention or treats.",
  },
  {
    id: 'weird_habit',
    question: "What's the weirdest habit or quirk your pet has?",
  },
  {
    id: 'intelligence',
    question:
      'Tell us about a time your pet surprised you with their intelligence or problem-solving.',
  },
  {
    id: 'superpower',
    question:
      'If your pet were a superhero, what would their special power be?',
  },
  {
    id: 'stress_weakness',
    question: "What's your pet's biggest fear or weakness?",
  },
];
