import type { AnimatedShareCardProps } from './types';
import { AnimationController } from './AnimationController';
import { CSSTimelineController } from './CSSTimelineController';

/**
 * Side-by-side comparison of old setTimeout vs new CSS timeline animation systems
 * For testing and migration validation
 */
export function AnimationComparison(props: AnimatedShareCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white text-center">
          Old System (setTimeout)
        </h3>
        <div
          className="animated-card-container relative overflow-hidden rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #312e81, #581c87, #7c2d12)',
            width: '100%',
            height: 'auto',
            maxWidth: '360px',
            maxHeight: '480px',
            aspectRatio: '3/4',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimationController {...props} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white text-center">
          New System (CSS Timeline)
        </h3>
        <div
          className="animated-card-container relative overflow-hidden rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #312e81, #581c87, #7c2d12)',
            width: '100%',
            height: 'auto',
            maxWidth: '360px',
            maxHeight: '480px',
            aspectRatio: '3/4',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <CSSTimelineController {...props} />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="lg:col-span-2 text-center text-white/80 text-sm space-y-2">
        <p>
          <strong>Test Instructions:</strong> Scroll during animation to see the
          difference
        </p>
        <p>
          Left (setTimeout): Animation timing gets affected by scroll events
        </p>
        <p>
          Right (CSS Timeline): Animation continues smoothly regardless of
          scroll
        </p>
      </div>
    </div>
  );
}
