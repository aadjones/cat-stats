/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom colors that reference CSS variables (set by ThemeContext)
      colors: {
        // Theme-aware semantic colors
        theme: {
          bg: 'var(--color-background)',
          'bg-alt': 'var(--color-background-alt)',
          surface: 'var(--color-surface)',
          'surface-alt': 'var(--color-surface-alt)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          accent: 'var(--color-accent)',
          'accent-hover': 'var(--color-accent-hover)',
          gold: 'var(--color-gold)',
          parchment: 'var(--color-parchment)',
          sepia: 'var(--color-sepia)',
        },
        // Glass morphism
        glass: {
          DEFAULT: 'var(--glass-bg)',
          border: 'var(--glass-border)',
          hover: 'var(--glass-bg-hover)',
        },
        // Semantic text colors
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'text-accent': 'var(--color-text-accent)',
        'text-on-gradient': 'var(--color-text-on-gradient)',
        // Semantic status colors
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
      },
      // Font families from design tokens
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'Georgia', 'serif'],
      },
      // Box shadow using theme accent
      boxShadow: {
        glow: 'var(--effect-card-glow)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
