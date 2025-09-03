import type { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '../UI/Button';

interface CharacterGenerationErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

export function CharacterGenerationErrorBoundary({
  children,
  onRetry,
}: CharacterGenerationErrorBoundaryProps) {
  const handleRetry = () => {
    onRetry?.();
    window.location.reload();
  };

  const fallback = (
    <div
      className="min-h-screen p-2 sm:p-4"
      style={{
        background: 'linear-gradient(135deg, #581c87, #312e81, #1e3a8a)',
      }}
    >
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
        <div className="bg-gray-800 border border-gray-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl">
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">🐱💥</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Character Generation Failed
            </h2>
            <p className="text-white/80 mb-6">
              Your pet's personality was too powerful for our system to handle!
              Let's try again with a fresh start.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                variant="primary"
                className="w-full"
              >
                Generate New Character
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="secondary"
                className="w-full"
              >
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(error, errorInfo) => {
        // Log specific character generation errors
        console.error('Character generation error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
