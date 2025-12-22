/**
 * Theme Context Definition
 *
 * Separated for React Fast Refresh compatibility.
 */

import { createContext } from 'react';
import type { Theme, ThemeColors } from './themes';

// Partial color overrides for live editing
export type ColorOverrides = Partial<ThemeColors>;

export interface ThemeContextValue {
  // Current theme
  theme: Theme;
  // All available themes
  availableThemes: Theme[];
  // Switch to a different theme by ID
  setTheme: (themeId: string) => void;
  // Apply stat-based accent override
  applyStatAccent: (statName: string) => void;
  // Clear stat accent and use theme default
  clearStatAccent: () => void;
  // Current stat accent (if any)
  currentStatAccent: string | null;
  // Toggle dev panel visibility
  showDevPanel: boolean;
  setShowDevPanel: (show: boolean) => void;
  // Custom color overrides for live editing
  colorOverrides: ColorOverrides;
  setColorOverride: (key: keyof ThemeColors, value: string) => void;
  clearColorOverrides: () => void;
  // Get effective colors (theme + overrides)
  getEffectiveColors: () => ThemeColors;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
