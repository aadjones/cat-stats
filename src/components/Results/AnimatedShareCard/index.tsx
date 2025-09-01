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
      className="relative overflow-hidden rounded-2xl shadow-2xl mx-auto"
      style={{
        background: getGradientStyle(),
        width: 'min(375px, calc(100vw - 40px))',
        height:
          'min(667px, calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 120px))',
        maxWidth: '375px',
        maxHeight: '667px',
      }}
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
        
        .animate-scale-in {
          animation: scaleIn 1s ease-out 0s forwards;
        }
        
        .animate-typewriter {
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 2s steps(20) 1s forwards;
          width: 0;
          opacity: 1;
        }
        
        .animate-fade-in-delayed {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 3.2s forwards;
        }
        
        .pet-name {
          opacity: 0; /* Start invisible, but typewriter animation will show it */
        }
        
        .pet-name.animate-typewriter {
          opacity: 1; /* Override to visible when typewriter is active */
        }
        
        .archetype {
          opacity: 0; /* Start invisible */
        }
        
        .visible-permanent {
          opacity: 1 !important;
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
        
        /* Mobile viewport optimizations */
        @media (max-height: 700px) {
          .stats-section canvas {
            width: 220px !important;
            height: 220px !important;
          }
          
          /* All ability sections - reduce spacing and size */
          .combat-section, .environmental-section, .passive-section, .social-section {
            margin-bottom: 0.75rem !important;
          }
          .combat-section h3, .environmental-section h3, .passive-section h3, .social-section h3 {
            font-size: 1rem !important;
            margin-bottom: 0.75rem !important;
          }
          .combat-section .space-y-4, .environmental-section .space-y-4, .passive-section .space-y-4, .social-section .space-y-4 {
            gap: 0.5rem !important;
          }
          .combat-move, .environmental-power, .passive-trait, .social-skill {
            padding: 0.625rem !important;
          }
          .combat-move .text-base, .environmental-power .text-base, .passive-trait .text-base, .social-skill .text-base {
            font-size: 0.8rem !important;
            margin-bottom: 0.375rem !important;
          }
          .combat-move .text-sm, .environmental-power .text-sm, .passive-trait .text-sm, .social-skill .text-sm {
            font-size: 0.7rem !important;
            line-height: 1.25 !important;
          }
          .combat-move .text-xs, .environmental-power .text-xs, .passive-trait .text-xs, .social-skill .text-xs {
            font-size: 0.6rem !important;
            margin-top: 0.25rem !important;
          }
          .combat-section .mt-6, .environmental-section .mt-6, .passive-section .mt-6, .social-section .mt-6 {
            margin-top: 0.75rem !important;
          }
          
          /* Vulnerability section */
          .vulnerability-section h3 {
            font-size: 1.375rem !important;
          }
          .vulnerability-section .text-6xl {
            font-size: 2.75rem !important;
            margin-bottom: 1rem !important;
          }
          .vulnerability-section .bg-red-900\\/40 {
            padding: 0.875rem !important;
            margin-left: 0.5rem !important;
            margin-right: 0.5rem !important;
          }
          .vulnerability-section .text-lg {
            font-size: 0.9rem !important;
          }
        }
        
        @media (max-height: 600px) {
          .stats-section canvas {
            width: 180px !important;
            height: 180px !important;
          }
          .stats-section h3 {
            font-size: 1rem !important;
            margin-bottom: 0.5rem !important;
          }
          
          /* All ability sections - more aggressive sizing */
          .combat-section h3, .environmental-section h3, .passive-section h3, .social-section h3 {
            font-size: 1rem !important;
            margin-bottom: 0.75rem !important;
          }
          .combat-section .space-y-4, .environmental-section .space-y-4, .passive-section .space-y-4, .social-section .space-y-4 {
            gap: 0.5rem !important;
          }
          .combat-move, .environmental-power, .passive-trait, .social-skill {
            padding: 0.5rem !important;
          }
          .combat-move .text-base, .environmental-power .text-base, .passive-trait .text-base, .social-skill .text-base {
            font-size: 0.75rem !important;
            margin-bottom: 0.5rem !important;
          }
          .combat-move .text-sm, .environmental-power .text-sm, .passive-trait .text-sm, .social-skill .text-sm {
            font-size: 0.675rem !important;
            line-height: 1.2 !important;
          }
          .combat-move .text-xs, .environmental-power .text-xs, .passive-trait .text-xs, .social-skill .text-xs {
            font-size: 0.6rem !important;
            margin-top: 0.25rem !important;
          }
          .combat-section .mt-6, .environmental-section .mt-6, .passive-section .mt-6, .social-section .mt-6 {
            margin-top: 1rem !important;
          }
          
          /* Vulnerability section - 600px */
          .vulnerability-section h3 {
            font-size: 1.25rem !important;
          }
          .vulnerability-section .text-6xl {
            font-size: 2.5rem !important;
            margin-bottom: 1rem !important;
          }
          .vulnerability-section .bg-red-900\\/40 {
            padding: 0.75rem !important;
            margin-left: 0.5rem !important;
            margin-right: 0.5rem !important;
          }
          .vulnerability-section .text-lg {
            font-size: 0.875rem !important;
          }
          .vulnerability-section .text-sm {
            font-size: 0.75rem !important;
          }
        }
        
        @media (max-height: 500px) {
          /* Extra small screens - very compact */
          .combat-section h3, .environmental-section h3, .passive-section h3, .social-section h3 {
            font-size: 0.875rem !important;
            margin-bottom: 0.5rem !important;
          }
          .combat-section .space-y-4, .environmental-section .space-y-4, .passive-section .space-y-4, .social-section .space-y-4 {
            gap: 0.375rem !important;
          }
          .combat-move, .environmental-power, .passive-trait, .social-skill {
            padding: 0.375rem !important;
          }
          .combat-move .text-base, .environmental-power .text-base, .passive-trait .text-base, .social-skill .text-base {
            font-size: 0.675rem !important;
            margin-bottom: 0.25rem !important;
          }
          .combat-move .text-sm, .environmental-power .text-sm, .passive-trait .text-sm, .social-skill .text-sm {
            font-size: 0.625rem !important;
            line-height: 1.1 !important;
          }
          .combat-move .text-xs, .environmental-power .text-xs, .passive-trait .text-xs, .social-skill .text-xs {
            font-size: 0.55rem !important;
            margin-top: 0.125rem !important;
          }
          .combat-section .mt-6, .environmental-section .mt-6, .passive-section .mt-6, .social-section .mt-6 {
            margin-top: 0.5rem !important;
          }
          
          /* Vulnerability section - 500px */
          .vulnerability-section h3 {
            font-size: 1rem !important;
          }
          .vulnerability-section .text-6xl {
            font-size: 2rem !important;
            margin-bottom: 0.75rem !important;
          }
          .vulnerability-section .bg-red-900\\/40 {
            padding: 0.5rem !important;
            margin-left: 0.25rem !important;
            margin-right: 0.25rem !important;
          }
          .vulnerability-section .text-lg {
            font-size: 0.75rem !important;
            margin-bottom: 0.5rem !important;
          }
          .vulnerability-section .text-sm {
            font-size: 0.675rem !important;
          }
        }
        
        @media (max-height: 450px) {
          /* Extra tight screens - ensure no cutoff */
          .combat-section, .environmental-section, .passive-section, .social-section {
            margin-bottom: 0.5rem !important;
          }
          .combat-section h3, .environmental-section h3, .passive-section h3, .social-section h3 {
            font-size: 0.8rem !important;
            margin-bottom: 0.375rem !important;
          }
          .combat-section .space-y-4, .environmental-section .space-y-4, .passive-section .space-y-4, .social-section .space-y-4 {
            gap: 0.25rem !important;
          }
          .combat-move, .environmental-power, .passive-trait, .social-skill {
            padding: 0.375rem !important;
          }
          .combat-move .text-base, .environmental-power .text-base, .passive-trait .text-base, .social-skill .text-base {
            font-size: 0.7rem !important;
            margin-bottom: 0.25rem !important;
          }
          .combat-move .text-sm, .environmental-power .text-sm, .passive-trait .text-sm, .social-skill .text-sm {
            font-size: 0.6rem !important;
            line-height: 1.1 !important;
          }
          .combat-move .text-xs, .environmental-power .text-xs, .passive-trait .text-xs, .social-skill .text-xs {
            font-size: 0.5rem !important;
            margin-top: 0.125rem !important;
          }
          .combat-section .mt-6, .environmental-section .mt-6, .passive-section .mt-6, .social-section .mt-6 {
            margin-top: 0.375rem !important;
          }
        }
        
        @media (max-width: 400px) {
          .stats-section canvas {
            width: calc(100vw - 120px) !important;
            height: calc(100vw - 120px) !important;
            max-width: 220px !important;
            max-height: 220px !important;
          }
        }
      `,
        }}
      />
    </div>
  );
}
