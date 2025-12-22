import type { Question } from '../../core/personality/types';

interface MultipleChoiceQuestionProps {
  question: Question;
  selectedValue?: string;
  onAnswerChange: (questionId: string, value: string) => void;
  questionNumber: number;
}

export function MultipleChoiceQuestion({
  question,
  selectedValue,
  onAnswerChange,
  questionNumber,
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-text-primary font-semibold font-body text-base sm:text-lg">
        {questionNumber}. {question.question}
      </h3>
      <div className="space-y-2">
        {question.options.map((option) => (
          <div
            key={option.value}
            className={`flex items-start space-x-3 p-3 sm:p-3 rounded-lg cursor-pointer transition-colors min-h-[44px] ${
              selectedValue === option.value
                ? 'bg-theme-accent/30 border border-theme-accent'
                : 'bg-glass hover:bg-glass-hover active:bg-glass-hover'
            }`}
            onClick={() => onAnswerChange(question.id, option.value)}
          >
            <div
              className={`w-5 h-5 sm:w-4 sm:h-4 rounded-full border-2 mt-1 flex items-center justify-center flex-shrink-0 ${
                selectedValue === option.value
                  ? 'border-theme-accent bg-theme-accent'
                  : 'border-text-muted'
              }`}
            >
              {selectedValue === option.value && (
                <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full bg-text-primary"></div>
              )}
            </div>
            <span className="text-text-secondary text-sm sm:text-sm leading-relaxed font-body">
              {option.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
