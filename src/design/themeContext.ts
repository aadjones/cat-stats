/**
 * Theme Context Definition
 *
 * Separated for React Fast Refresh compatibility.
 */

import { createContext } from 'react';
import type { Theme } from './themes';

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
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
