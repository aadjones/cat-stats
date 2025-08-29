import type { AnimatedShareCardProps } from './types';
import { AnimationController } from './AnimationController';

export function AnimatedShareCard(props: AnimatedShareCardProps) {
  const { theme } = props;

  // Convert theme gradient to CSS
  const getGradientStyle = () => {
    const gradientMap: Record<string, string> = {
      'from-blue-900 via-indigo-900 to-purple-900':
        'linear-gradient(135deg, #1e3a8a, #312e81, #581c87)',
      'from-emerald-900 via-teal-900 to-cyan-900':
        'linear-gradient(135deg, #064e3b, #134e4a, #164e63)',
      'from-red-900 via-orange-900 to-amber-900':
        'linear-gradient(135deg, #7f1d1d, #7c2d12, #78350f)',
      'from-pink-900 via-purple-900 to-fuchsia-900':
        'linear-gradient(135deg, #831843, #581c87, #701a75)',
      'from-slate-900 via-gray-900 to-zinc-900':
        'linear-gradient(135deg, #0f172a, #111827, #18181b)',
      'from-yellow-900 via-amber-900 to-orange-900':
        'linear-gradient(135deg, #713f12, #78350f, #7c2d12)',
    };
    return (
      gradientMap[theme.gradient] ||
      'linear-gradient(135deg, #312e81, #581c87, #7c2d12)'
    );
  };

  return (
    <div
      className="relative w-[375px] h-[667px] overflow-hidden rounded-2xl shadow-2xl"
      style={{ background: getGradientStyle() }}
    >
      <AnimationController {...props} />

      {/* Global animation styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hidden {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease-out;
        }
        
        .visible {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.8s ease-out;
        }
        
        .animate-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .pet-photo {
          animation: scaleIn 1s ease-out 0.3s both;
        }
        
        .pet-name {
          animation: fadeInUp 0.8s ease-out 0.8s both;
          opacity: 0;
        }
        
        .archetype {
          animation: fadeInUp 0.8s ease-out 1.2s both;
          opacity: 0;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes typewriter {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        
        .vulnerability-flash {
          animation: flashRed 0.6s ease-in-out;
        }
        
        @keyframes flashRed {
          0%, 100% {
            background-color: rgba(127, 29, 29, 0.4);
            transform: scale(1);
          }
          50% {
            background-color: rgba(239, 68, 68, 0.6);
            transform: scale(1.02);
          }
        }
      `,
        }}
      />
    </div>
  );
}
