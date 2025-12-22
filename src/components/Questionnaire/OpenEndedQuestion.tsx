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
      <h3 className="text-text-primary font-semibold font-body text-base sm:text-lg">
        {questionNumber}. {question.question}
      </h3>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className={`w-full bg-glass border rounded-lg px-3 sm:px-4 py-3 sm:py-2 text-text-primary placeholder-text-muted focus:bg-glass-hover transition-colors h-20 sm:h-16 text-base sm:text-sm resize-none font-body ${
            isOverLimit
              ? 'border-danger focus:border-danger'
              : 'border-glass-border focus:border-theme-accent'
          }`}
          placeholder={placeholder}
          maxLength={MAX_ANSWER_LENGTH}
        />
        <div
          className={`text-right text-xs mt-1 font-body ${
            isOverLimit
              ? 'text-danger'
              : isNearLimit
                ? 'text-warning'
                : 'text-text-muted'
          }`}
        >
          {value.length}/{MAX_ANSWER_LENGTH}
        </div>
      </div>
    </div>
  );
}
