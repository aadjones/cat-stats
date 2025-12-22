/**
 * CatStats Theme Definitions
 *
 * Each theme provides a complete visual identity.
 * Themes use CSS custom properties for runtime switching.
 */

export interface ThemeColors {
  // Core palette
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderSubtle: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  textOnGradient: string; // For text directly on gradient backgrounds

  // Accents
  accent: string;
  accentHover: string;
  accentRgb: string; // For alpha compositing

  // Gradients (CSS values, not Tailwind classes)
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;

  // Semantic colors
  success: string;
  warning: string;
  danger: string;
  info: string;

  // RPG-specific
  gold: string;
  parchment: string;
  sepia: string;
}

export interface ThemeTypography {
  fontDisplay: string;
  fontBody: string;
}

export interface ThemeEffects {
  cardGlow: string;
  textShadow: string;
  borderStyle: string;
  // Glass morphism (for inputs, buttons on cards)
  glassBg: string;
  glassBorder: string;
  glassHover: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  effects: ThemeEffects;
}

// =============================================================================
// THEME: ORIGINAL (Matches current deployed site exactly)
// =============================================================================

export const originalTheme: Theme = {
  id: 'original',
  name: 'Original',
  description: 'Current purple gradient with gray cards',
  colors: {
    background: '#581c87', // purple-900 (gradient start)
    backgroundAlt: '#312e81', // indigo-900 (gradient middle)
    surface: '#1f2937', // gray-800
    surfaceAlt: '#374151', // gray-700
    border: '#4b5563', // gray-600
    borderSubtle: '#374151', // gray-700

    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)', // text-white/80
    textMuted: 'rgba(255, 255, 255, 0.5)', // text-white/50
    textAccent: '#60a5fa', // blue-400
    textOnGradient: '#ffffff', // White on dark gradient

    accent: '#2563eb', // blue-600
    accentHover: '#1d4ed8', // blue-700
    accentRgb: '37, 99, 235',

    gradientStart: '#581c87', // purple-900
    gradientMiddle: '#312e81', // indigo-900
    gradientEnd: '#1e3a8a', // blue-900

    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',

    gold: '#fbbf24',
    parchment: '#fef3c7',
    sepia: '#78716c',
  },
  typography: {
    fontDisplay:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontBody:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  effects: {
    cardGlow: '0 0 30px rgba(37, 99, 235, 0.3)',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
    borderStyle: 'solid',
    glassBg: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    glassHover: 'rgba(255, 255, 255, 0.2)',
  },
};

// =============================================================================
// THEME: PARCHMENT (D&D character sheet aesthetic)
// =============================================================================

export const parchmentTheme: Theme = {
  id: 'parchment',
  name: 'Parchment',
  description: 'Classic D&D character sheet with aged paper feel',
  colors: {
    background: '#2c1810', // Dark wood
    backgroundAlt: '#3d2914', // Warm brown
    surface: '#f5e6d3', // Lighter parchment for better contrast
    surfaceAlt: '#e8d5b7', // Standard parchment
    border: '#6b5344', // Darker leather for contrast
    borderSubtle: '#8b7355', // Medium leather

    textPrimary: '#1a0f0a', // Very dark brown (for text on parchment)
    textSecondary: '#3d2914', // Dark brown (lighter secondary text)
    textMuted: '#6b5344', // Medium brown
    textAccent: '#8b0000', // Blood red accent
    textOnGradient: '#f5e6d3', // Cream/parchment on dark wood gradient

    accent: '#8b0000', // Blood red (classic D&D)
    accentHover: '#a50000',
    accentRgb: '139, 0, 0',

    gradientStart: '#3d2914',
    gradientMiddle: '#5c4033',
    gradientEnd: '#2c1810',

    success: '#2e5a1c', // Forest green
    warning: '#b8860b', // Goldenrod
    danger: '#a50000', // Blood red
    info: '#4a2c6a', // Deep purple

    gold: '#d4a726',
    parchment: '#f5e6d3',
    sepia: '#5c4033',
  },
  typography: {
    fontDisplay: "'Almendra', serif",
    fontBody: "'Spectral', Georgia, serif",
  },
  effects: {
    cardGlow: '0 0 20px rgba(201, 162, 39, 0.2)',
    textShadow: '1px 1px 2px rgba(44, 24, 16, 0.3)',
    borderStyle: 'solid',
    // Dark glass for light parchment surface
    glassBg: 'rgba(90, 60, 40, 0.08)',
    glassBorder: 'rgba(90, 60, 40, 0.4)',
    glassHover: 'rgba(90, 60, 40, 0.15)',
  },
};

// =============================================================================
// THEME: HIGH FANTASY (Vibrant magical aesthetic)
// =============================================================================

export const highFantasyTheme: Theme = {
  id: 'high-fantasy',
  name: 'High Fantasy',
  description: 'Vibrant magical realm with glowing accents',
  colors: {
    background: '#0a0a1a', // Deep void
    backgroundAlt: '#12122a', // Midnight blue
    surface: '#1a1a3a', // Dark mystical
    surfaceAlt: '#252550', // Lighter mystical
    border: '#4a3a8a', // Purple glow
    borderSubtle: '#3a2a6a', // Subtle purple

    textPrimary: '#f0e6ff', // Ethereal white
    textSecondary: '#c9b8e8', // Soft lavender
    textMuted: '#8a7ab8', // Muted purple
    textAccent: '#ffd700', // Pure gold
    textOnGradient: '#f0e6ff', // Ethereal white on purple gradient

    accent: '#9333ea', // Bright purple
    accentHover: '#a855f7', // Lighter purple
    accentRgb: '147, 51, 234',

    gradientStart: '#4c1d95', // Deep purple
    gradientMiddle: '#5b21b6', // Rich purple
    gradientEnd: '#6d28d9', // Bright purple

    success: '#10b981', // Emerald
    warning: '#fbbf24', // Amber
    danger: '#f43f5e', // Rose
    info: '#06b6d4', // Cyan

    gold: '#ffd700',
    parchment: '#fef3c7',
    sepia: '#92400e',
  },
  typography: {
    fontDisplay: "'Cinzel', serif",
    fontBody: "'Crimson Text', Georgia, serif",
  },
  effects: {
    cardGlow: '0 0 40px rgba(147, 51, 234, 0.4)',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    borderStyle: 'solid',
    glassBg: 'rgba(147, 51, 234, 0.15)',
    glassBorder: 'rgba(147, 51, 234, 0.4)',
    glassHover: 'rgba(147, 51, 234, 0.25)',
  },
};

// =============================================================================
// STAT-BASED ACCENT OVERRIDES
// These modify the accent color based on the pet's dominant stat
// =============================================================================

export interface StatAccent {
  accent: string;
  accentHover: string;
  accentRgb: string;
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;
}

export const statAccents: Record<string, StatAccent> = {
  wisdom: {
    accent: '#4F46E5',
    accentHover: '#4338CA',
    accentRgb: '79, 70, 229',
    gradientStart: '#1e3a8a',
    gradientMiddle: '#312e81',
    gradientEnd: '#581c87',
  },
  cunning: {
    accent: '#059669',
    accentHover: '#047857',
    accentRgb: '5, 150, 105',
    gradientStart: '#064e3b',
    gradientMiddle: '#115e59',
    gradientEnd: '#155e75',
  },
  agility: {
    accent: '#DC2626',
    accentHover: '#B91C1C',
    accentRgb: '220, 38, 38',
    gradientStart: '#7f1d1d',
    gradientMiddle: '#9a3412',
    gradientEnd: '#92400e',
  },
  charisma: {
    accent: '#EC4899',
    accentHover: '#DB2777',
    accentRgb: '236, 72, 153',
    gradientStart: '#831843',
    gradientMiddle: '#701a75',
    gradientEnd: '#86198f',
  },
  stealth: {
    accent: '#475569',
    accentHover: '#334155',
    accentRgb: '71, 85, 105',
    gradientStart: '#0f172a',
    gradientMiddle: '#1e293b',
    gradientEnd: '#27272a',
  },
  resolve: {
    accent: '#F59E0B',
    accentHover: '#D97706',
    accentRgb: '245, 158, 11',
    gradientStart: '#78350f',
    gradientMiddle: '#92400e',
    gradientEnd: '#9a3412',
  },
};

// =============================================================================
// ALL THEMES
// =============================================================================

export const themes: Theme[] = [
  originalTheme,
  parchmentTheme,
  highFantasyTheme,
];

export const defaultTheme = originalTheme;
