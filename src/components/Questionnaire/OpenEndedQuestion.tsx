import type { OpenEndedQuestion } from '../../core/personality/types';

interface OpenEndedQuestionProps {
  question: OpenEndedQuestion;
  value?: string;
  onAnswerChange: (questionId: string, value: string) => void;
  questionNumber: number;
  placeholder?: string;
}

export function OpenEndedQuestion({
  question,
  value = '',
  onAnswerChange,
  questionNumber,
  placeholder = "Share your pet's story...",
}: OpenEndedQuestionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold text-base sm:text-lg">
        {questionNumber}. {question.question}
      </h3>
      <textarea
        value={value}
        onChange={(e) => onAnswerChange(question.id, e.target.value)}
        className="w-full bg-white/10 border border-white/30 rounded-lg px-3 sm:px-4 py-3 sm:py-2 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/50 transition-colors h-20 sm:h-16 text-base sm:text-sm resize-none"
        placeholder={placeholder}
      />
    </div>
  );
}