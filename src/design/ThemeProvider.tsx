/**
 * Theme Provider Component
 *
 * Provides theme switching capability throughout the app.
 * Applies CSS custom properties to :root for runtime theming.
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  themes,
  defaultTheme,
  statAccents,
  type Theme,
  type ThemeColors,
  type StatAccent,
} from './themes';
import { ThemeContext, type ColorOverrides } from './themeContext';

const THEME_STORAGE_KEY = 'catstats-theme';
const DEV_PANEL_KEY = 'catstats-dev-panel';

/**
 * Apply theme colors as CSS custom properties
 */
function applyThemeToDOM(
  theme: Theme,
  statAccent?: StatAccent,
  colorOverrides?: ColorOverrides
) {
  const root = document.documentElement;
  // Merge theme colors with any custom overrides
  const colors: ThemeColors = { ...theme.colors, ...colorOverrides };

  // Core colors
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-background-alt', colors.backgroundAlt);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-surface-alt', colors.surfaceAlt);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-border-subtle', colors.borderSubtle);

  // Text colors
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-muted', colors.textMuted);
  root.style.setProperty('--color-text-accent', colors.textAccent);
  root.style.setProperty('--color-text-on-gradient', colors.textOnGradient);

  // Accent (can be overridden by stat)
  const accent = statAccent?.accent ?? colors.accent;
  const accentHover = statAccent?.accentHover ?? colors.accentHover;
  const accentRgb = statAccent?.accentRgb ?? colors.accentRgb;
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-accent-hover', accentHover);
  root.style.setProperty('--color-accent-rgb', accentRgb);
  root.style.setProperty('--accent-color-alpha', `rgba(${accentRgb}, 0.3)`);

  // Gradients (can be overridden by stat)
  const gradientStart = statAccent?.gradientStart ?? colors.gradientStart;
  const gradientMiddle = statAccent?.gradientMiddle ?? colors.gradientMiddle;
  const gradientEnd = statAccent?.gradientEnd ?? colors.gradientEnd;
  root.style.setProperty('--gradient-start', gradientStart);
  root.style.setProperty('--gradient-middle', gradientMiddle);
  root.style.setProperty('--gradient-end', gradientEnd);

  // Semantic colors
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-danger', colors.danger);
  root.style.setProperty('--color-info', colors.info);

  // RPG-specific
  root.style.setProperty('--color-gold', colors.gold);
  root.style.setProperty('--color-parchment', colors.parchment);
  root.style.setProperty('--color-sepia', colors.sepia);

  // Typography
  root.style.setProperty('--font-display', theme.typography.fontDisplay);
  root.style.setProperty('--font-body', theme.typography.fontBody);

  // Effects
  root.style.setProperty('--effect-card-glow', theme.effects.cardGlow);
  root.style.setProperty('--effect-text-shadow', theme.effects.textShadow);

  // Glass morphism
  root.style.setProperty('--glass-bg', theme.effects.glassBg);
  root.style.setProperty('--glass-border', theme.effects.glassBorder);
  root.style.setProperty('--glass-bg-hover', theme.effects.glassHover);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Load saved theme from localStorage
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      const found = themes.find((t) => t.id === saved);
      if (found) return found;
    }
    return defaultTheme;
  });

  const [currentStatAccent, setCurrentStatAccent] = useState<string | null>(
    null
  );

  const [showDevPanel, setShowDevPanel] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DEV_PANEL_KEY) === 'true';
  });

  // Custom color overrides for live editing
  const [colorOverrides, setColorOverrides] = useState<ColorOverrides>({});

  // Apply theme on mount and when it changes
  useEffect(() => {
    const statAccent = currentStatAccent
      ? statAccents[currentStatAccent]
      : undefined;
    applyThemeToDOM(theme, statAccent, colorOverrides);
  }, [theme, currentStatAccent, colorOverrides]);

  // Persist dev panel state
  useEffect(() => {
    localStorage.setItem(DEV_PANEL_KEY, String(showDevPanel));
  }, [showDevPanel]);

  const setTheme = useCallback((themeId: string) => {
    const found = themes.find((t) => t.id === themeId);
    if (found) {
      setThemeState(found);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  }, []);

  const applyStatAccent = useCallback((statName: string) => {
    if (statAccents[statName]) {
      setCurrentStatAccent(statName);
    }
  }, []);

  const clearStatAccent = useCallback(() => {
    setCurrentStatAccent(null);
  }, []);

  // Set a single color override
  const setColorOverride = useCallback(
    (key: keyof ThemeColors, value: string) => {
      setColorOverrides((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Clear all custom overrides
  const clearColorOverrides = useCallback(() => {
    setColorOverrides({});
  }, []);

  // Get effective colors (theme + overrides)
  const getEffectiveColors = useCallback((): ThemeColors => {
    return { ...theme.colors, ...colorOverrides };
  }, [theme.colors, colorOverrides]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        availableThemes: themes,
        setTheme,
        applyStatAccent,
        clearStatAccent,
        currentStatAccent,
        showDevPanel,
        setShowDevPanel,
        colorOverrides,
        setColorOverride,
        clearColorOverrides,
        getEffectiveColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
