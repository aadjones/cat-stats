import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy PDF/image libraries into separate chunks
          'pdf-export': ['@react-pdf/renderer'],
          'image-processing': ['html2canvas'],

          // Animation system (only loaded when needed)
          animations: [
            'src/components/Results/AnimatedShareCard/AnimationController',
            'src/components/Results/AnimatedShareCard/phases/AnalyzingPhase',
            'src/components/Results/AnimatedShareCard/phases/IntroPhase',
            'src/components/Results/AnimatedShareCard/phases/LoopPhase',
            'src/components/Results/AnimatedShareCard/phases/PassivePhase',
            'src/components/Results/AnimatedShareCard/phases/SignoffPhase',
            'src/components/Results/AnimatedShareCard/phases/StatsPhase',
            'src/components/Results/AnimatedShareCard/phases/CombatPhase',
            'src/components/Results/AnimatedShareCard/phases/EnvironmentalPhase',
            'src/components/Results/AnimatedShareCard/phases/SocialPhase',
            'src/components/Results/AnimatedShareCard/phases/VulnerabilityPhase',
          ],

          // Hall of Fame (separate route)
          'hall-of-fame': [
            'src/components/HallOfFame/HallOfFame',
            'src/components/HallOfFame/CharacterModal',
          ],

          // Showdown features
          showdown: [
            'src/components/Results/ShowdownPage',
            'src/components/Results/FriendshipModal',
            'src/components/Results/FriendshipShowdown',
            'src/core/friendship/compatibilityCalculator',
            'src/services/api/friendshipApi',
          ],
        },
      },
    },
    // Reduce chunk size warning threshold since we're intentionally splitting
    chunkSizeWarningLimit: 300,
  },
});
