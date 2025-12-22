/**
 * useTheme hook
 *
 * Separated from ThemeContext.tsx for React Fast Refresh compatibility.
 */

import { useContext } from 'react';
import { ThemeContext } from './themeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
