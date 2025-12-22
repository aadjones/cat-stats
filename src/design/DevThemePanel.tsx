/**
 * Dev Theme Panel
 *
 * A floating panel for developers to preview and customize themes.
 * Toggle visibility with ` (backtick).
 * Features:
 * - Theme preset switching
 * - Stat accent previews
 * - Live color editing with color pickers
 * - Export customized theme as TypeScript
 */

import { useEffect, useState } from 'react';
import { useTheme } from './useTheme';
import { statAccents, type ThemeColors } from './themes';

// Editable color tokens with their labels and CSS variable mappings
const EDITABLE_COLORS: {
  key: keyof ThemeColors;
  label: string;
  shortLabel: string;
}[] = [
  { key: 'background', label: 'Background', shortLabel: 'BG' },
  { key: 'surface', label: 'Surface', shortLabel: 'Srf' },
  { key: 'accent', label: 'Accent', shortLabel: 'Acc' },
  { key: 'textPrimary', label: 'Text Primary', shortLabel: 'Txt' },
  { key: 'gold', label: 'Gold', shortLabel: 'Gld' },
  { key: 'danger', label: 'Danger', shortLabel: 'Dng' },
];

// Extended set of editable colors (shown in expanded mode)
const EXTENDED_COLORS: {
  key: keyof ThemeColors;
  label: string;
}[] = [
  { key: 'backgroundAlt', label: 'Background Alt' },
  { key: 'surfaceAlt', label: 'Surface Alt' },
  { key: 'border', label: 'Border' },
  { key: 'borderSubtle', label: 'Border Subtle' },
  { key: 'textSecondary', label: 'Text Secondary' },
  { key: 'textMuted', label: 'Text Muted' },
  { key: 'textAccent', label: 'Text Accent' },
  { key: 'textOnGradient', label: 'Text On Gradient' },
  { key: 'accentHover', label: 'Accent Hover' },
  { key: 'gradientStart', label: 'Gradient Start' },
  { key: 'gradientMiddle', label: 'Gradient Middle' },
  { key: 'gradientEnd', label: 'Gradient End' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
  { key: 'parchment', label: 'Parchment' },
  { key: 'sepia', label: 'Sepia' },
];

export function DevThemePanel() {
  const {
    theme,
    availableThemes,
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
  } = useTheme();

  const [showExtended, setShowExtended] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Keyboard shortcut: ` (backtick)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setShowDevPanel(!showDevPanel);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDevPanel, setShowDevPanel]);

  if (!showDevPanel) return null;

  const statNames = Object.keys(statAccents);
  const effectiveColors = getEffectiveColors();
  const hasOverrides = Object.keys(colorOverrides).length > 0;

  // Generate export code
  const generateExportCode = () => {
    const colors = getEffectiveColors();
    const lines = Object.entries(colors).map(([key, value]) => {
      return `    ${key}: '${value}',`;
    });
    return `export const customTheme: Theme = {
  id: 'custom',
  name: 'Custom Theme',
  description: 'Your custom theme',
  colors: {
${lines.join('\n')}
  },
  typography: {
    fontDisplay: "${theme.typography.fontDisplay}",
    fontBody: "${theme.typography.fontBody}",
  },
  effects: {
    cardGlow: '${theme.effects.cardGlow}',
    textShadow: '${theme.effects.textShadow}',
    borderStyle: '${theme.effects.borderStyle}',
    glassBg: '${theme.effects.glassBg}',
    glassBorder: '${theme.effects.glassBorder}',
    glassHover: '${theme.effects.glassHover}',
  },
};`;
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(generateExportCode());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle color change from picker
  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColorOverride(key, value);
  };

  // Reset to base theme
  const handleReset = () => {
    clearColorOverrides();
    setShowExport(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '1rem',
        width: showExtended ? '360px' : '280px',
        maxHeight: '85vh',
        overflowY: 'auto',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.875rem',
        color: '#fff',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
          THEME SWATCH
        </span>
        <button
          onClick={() => setShowDevPanel(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
          }}
        >
          x
        </button>
      </div>

      {/* Theme Selection */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#888',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Base Theme
        </label>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          {availableThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                clearColorOverrides();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                backgroundColor:
                  theme.id === t.id
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                border:
                  theme.id === t.id
                    ? '1px solid rgba(255, 255, 255, 0.3)'
                    : '1px solid transparent',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                color: '#fff',
                textAlign: 'left',
              }}
            >
              {/* Color swatch */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '24px',
                    backgroundColor: t.colors.gradientStart,
                    borderRadius: '2px 0 0 2px',
                  }}
                />
                <div
                  style={{
                    width: '12px',
                    height: '24px',
                    backgroundColor: t.colors.accent,
                  }}
                />
                <div
                  style={{
                    width: '12px',
                    height: '24px',
                    backgroundColor: t.colors.gradientEnd,
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#888' }}>
                  {t.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stat Accent Override */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#888',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Stat Accent
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={() => clearStatAccent()}
            style={{
              padding: '0.375rem',
              fontSize: '0.7rem',
              backgroundColor:
                currentStatAccent === null
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
              border:
                currentStatAccent === null
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid transparent',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            None
          </button>
          {statNames.map((stat) => (
            <button
              key={stat}
              onClick={() => applyStatAccent(stat)}
              style={{
                padding: '0.375rem',
                fontSize: '0.7rem',
                backgroundColor:
                  currentStatAccent === stat
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                border:
                  currentStatAccent === stat
                    ? `1px solid ${statAccents[stat].accent}`
                    : '1px solid transparent',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                color: statAccents[stat].accent,
                textTransform: 'capitalize',
              }}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Color Editors */}
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <label
            style={{
              color: '#888',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Edit Colors
          </label>
          <button
            onClick={() => setShowExtended(!showExtended)}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '0.65rem',
              textDecoration: 'underline',
            }}
          >
            {showExtended ? 'Show Less' : 'Show All'}
          </button>
        </div>

        {/* Primary colors grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '4px',
            marginBottom: showExtended ? '0.75rem' : 0,
          }}
        >
          {EDITABLE_COLORS.map((c) => (
            <ColorPickerCell
              key={c.key}
              colorKey={c.key}
              label={c.shortLabel}
              value={effectiveColors[c.key]}
              hasOverride={c.key in colorOverrides}
              onChange={handleColorChange}
            />
          ))}
        </div>

        {/* Extended colors */}
        {showExtended && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
            }}
          >
            {EXTENDED_COLORS.map((c) => (
              <ColorPickerRow
                key={c.key}
                colorKey={c.key}
                label={c.label}
                value={effectiveColors[c.key]}
                hasOverride={c.key in colorOverrides}
                onChange={handleColorChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: hasOverrides || showExport ? '1rem' : 0,
        }}
      >
        {hasOverrides && (
          <button
            onClick={handleReset}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              color: '#ef4444',
            }}
          >
            Reset
          </button>
        )}
        <button
          onClick={() => setShowExport(!showExport)}
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '0.75rem',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            color: '#22c55e',
          }}
        >
          {showExport ? 'Hide Export' : 'Export Theme'}
        </button>
      </div>

      {/* Export Panel */}
      {showExport && (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#888' }}>
              TypeScript Theme Object
            </span>
            <button
              onClick={handleCopyExport}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.65rem',
                backgroundColor: copySuccess
                  ? 'rgba(34, 197, 94, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                color: copySuccess ? '#22c55e' : '#fff',
              }}
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre
            style={{
              fontSize: '0.6rem',
              color: '#aaa',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: '200px',
              overflowY: 'auto',
              margin: 0,
              fontFamily: 'monospace',
            }}
          >
            {generateExportCode()}
          </pre>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.65rem',
          color: '#555',
          textAlign: 'center',
        }}
      >
        Press ` to toggle
      </div>
    </div>
  );
}

// Color picker as a small grid cell
function ColorPickerCell({
  colorKey,
  label,
  value,
  hasOverride,
  onChange,
}: {
  colorKey: keyof ThemeColors;
  label: string;
  value: string;
  hasOverride: boolean;
  onChange: (key: keyof ThemeColors, value: string) => void;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <label
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: '1',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <input
          type="color"
          value={normalizeColor(value)}
          onChange={(e) => onChange(colorKey, e.target.value)}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: value,
            borderRadius: '4px',
            border: hasOverride
              ? '2px solid #22c55e'
              : '1px solid rgba(255, 255, 255, 0.2)',
          }}
        />
      </label>
      <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '2px' }}>
        {label}
      </div>
    </div>
  );
}

// Color picker as a row with label
function ColorPickerRow({
  colorKey,
  label,
  value,
  hasOverride,
  onChange,
}: {
  colorKey: keyof ThemeColors;
  label: string;
  value: string;
  hasOverride: boolean;
  onChange: (key: keyof ThemeColors, value: string) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <label
        style={{
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <input
          type="color"
          value={normalizeColor(value)}
          onChange={(e) => onChange(colorKey, e.target.value)}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: value,
            borderRadius: '4px',
            border: hasOverride
              ? '2px solid #22c55e'
              : '1px solid rgba(255, 255, 255, 0.2)',
          }}
        />
      </label>
      <span style={{ fontSize: '0.65rem', color: '#888', flex: 1 }}>
        {label}
      </span>
      <span
        style={{ fontSize: '0.55rem', color: '#555', fontFamily: 'monospace' }}
      >
        {normalizeColor(value)}
      </span>
    </div>
  );
}

// Normalize color values to hex for the color picker
function normalizeColor(value: string): string {
  // Handle rgba values - just return a fallback for the picker
  if (value.startsWith('rgba')) {
    // Extract the RGB part and convert to hex
    const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return '#888888';
  }
  // Already a hex value
  if (value.startsWith('#')) {
    return value;
  }
  return '#888888';
}
