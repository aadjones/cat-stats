import type { OpenEndedQuestion } from '../../core/personality/types';

interface OpenEndedQuestionProps {
  question: OpenEndedQuestion;
  value?: string;
  onAnswerChange: (questionId: string, value: string) => void;
  questionNumber: number;
  placeholder?: string;
}

const MAX_ANSWER_LENGTH = 500;

export function OpenEndedQuestion({
  question,
  value = '',
  onAnswerChange,
  questionNumber,
  placeholder = "Share your pet's story...",
}: OpenEndedQuestionProps) {
  const isNearLimit = value.length > MAX_ANSWER_LENGTH * 0.8;
  const isOverLimit = value.length > MAX_ANSWER_LENGTH;

  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold text-base sm:text-lg">
        {questionNumber}. {question.question}
      </h3>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className={`w-full bg-white/10 border rounded-lg px-3 sm:px-4 py-3 sm:py-2 text-white placeholder-white/50 focus:bg-white/20 transition-colors h-20 sm:h-16 text-base sm:text-sm resize-none ${
            isOverLimit
              ? 'border-red-400 focus:border-red-400'
              : 'border-white/30 focus:border-white/50'
          }`}
          placeholder={placeholder}
          maxLength={MAX_ANSWER_LENGTH}
        />
        <div
          className={`text-right text-xs mt-1 ${
            isOverLimit
              ? 'text-red-300'
              : isNearLimit
                ? 'text-yellow-300'
                : 'text-white/50'
          }`}
        >
          {value.length}/{MAX_ANSWER_LENGTH}
        </div>
      </div>
    </div>
  );
}
