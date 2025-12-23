/**
 * Dev Theme Panel
 *
 * A floating panel for developers to preview and customize themes.
 * Toggle visibility with ` (backtick).
 * Features:
 * - Theme preset switching
 * - Stat accent previews
 * - Live color editing with color pickers
 * - Contrast checker for accessibility
 * - Quick color harmony presets
 * - Export customized theme as TypeScript
 */

import { useEffect, useState, useRef } from 'react';
import { useTheme } from './useTheme';
import { statAccents, type ThemeColors } from './themes';

// =============================================================================
// COLOR GROUPS - Organized by semantic role
// =============================================================================

// Primary visual impact colors
const PRIMARY_COLORS: {
  key: keyof ThemeColors;
  label: string;
  shortLabel: string;
}[] = [
  { key: 'gradientStart', label: 'Gradient Start', shortLabel: 'Grd1' },
  { key: 'gradientMiddle', label: 'Gradient Middle', shortLabel: 'Grd2' },
  { key: 'gradientEnd', label: 'Gradient End', shortLabel: 'Grd3' },
  { key: 'surface', label: 'Card Surface', shortLabel: 'Card' },
  { key: 'accent', label: 'Accent', shortLabel: 'Acc' },
  { key: 'textPrimary', label: 'Text', shortLabel: 'Txt' },
];

// Surface & background colors
const SURFACE_COLORS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'backgroundAlt', label: 'Background Alt' },
  { key: 'surfaceAlt', label: 'Surface Alt' },
  { key: 'border', label: 'Border' },
  { key: 'borderSubtle', label: 'Border Subtle' },
];

// Text colors
const TEXT_COLORS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'textSecondary', label: 'Secondary' },
  { key: 'textMuted', label: 'Muted' },
  { key: 'textAccent', label: 'Accent' },
  { key: 'textOnGradient', label: 'On Gradient' },
];

// Accent & action colors
const ACCENT_COLORS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'accentHover', label: 'Accent Hover' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'danger', label: 'Danger' },
  { key: 'info', label: 'Info' },
  { key: 'gold', label: 'Gold' },
];

// =============================================================================
// AVAILABLE FONTS
// =============================================================================

const DISPLAY_FONTS = [
  { value: "'Cinzel', serif", label: 'Cinzel (High Fantasy)' },
  { value: "'Almendra', serif", label: 'Almendra (Parchment)' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  {
    value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    label: 'System Sans',
  },
];

const BODY_FONTS = [
  { value: "'Crimson Text', Georgia, serif", label: 'Crimson Text' },
  { value: "'Spectral', Georgia, serif", label: 'Spectral' },
  { value: 'Georgia, serif', label: 'Georgia' },
  {
    value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    label: 'System Sans',
  },
];

// =============================================================================
// CONTRAST UTILITIES (WCAG 2.1)
// =============================================================================

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Handle rgba
  if (hex.startsWith('rgba')) {
    const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    }
    return null;
  }
  // Handle hex
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

type ContrastLevel = 'AAA' | 'AA' | 'Fail';

function getContrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}

// =============================================================================
// COLOR HARMONY GENERATORS
// =============================================================================

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary';

function generateHarmony(baseHex: string, type: HarmonyType): string[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [baseHex];
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);

  switch (type) {
    case 'complementary':
      return [baseHex, hslToHex((h + 180) % 360, s, l)];
    case 'analogous':
      return [
        hslToHex((h - 30 + 360) % 360, s, l),
        baseHex,
        hslToHex((h + 30) % 360, s, l),
      ];
    case 'triadic':
      return [
        baseHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
      ];
    case 'split-complementary':
      return [
        baseHex,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ];
    default:
      return [baseHex];
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

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

  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'contrast'>(
    'colors'
  );
  const [showExtended, setShowExtended] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Font overrides (stored separately since they're not in ThemeColors)
  const [fontOverrides, setFontOverrides] = useState<{
    display?: string;
    body?: string;
  }>({});

  // Draggable panel state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Drag handling
  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e: MouseEvent) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    // Initialize position if not set
    if (!position) {
      setPosition({ x: rect.left, y: rect.top });
    }
  };

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

  // Apply harmony to gradient colors
  const applyHarmony = (type: HarmonyType) => {
    const baseColor = normalizeColor(effectiveColors.gradientStart);
    const harmony = generateHarmony(baseColor, type);
    if (harmony.length >= 2) {
      handleColorChange('gradientStart', harmony[0]);
      handleColorChange('gradientMiddle', harmony[1] || harmony[0]);
      handleColorChange('gradientEnd', harmony[harmony.length - 1]);
    }
  };

  // Handle font change
  const handleFontChange = (type: 'display' | 'body', value: string) => {
    setFontOverrides((prev) => ({ ...prev, [type]: value }));
    // Apply to DOM immediately
    const root = document.documentElement;
    if (type === 'display') {
      root.style.setProperty('--font-display', value);
    } else {
      root.style.setProperty('--font-body', value);
    }
  };

  // Reset to base theme
  const handleReset = () => {
    clearColorOverrides();
    setFontOverrides({});
    // Reset fonts to theme defaults
    const root = document.documentElement;
    root.style.setProperty('--font-display', theme.typography.fontDisplay);
    root.style.setProperty('--font-body', theme.typography.fontBody);
    setShowExport(false);
  };

  // Get contrast issues
  const getContrastIssues = () => {
    const issues: { pair: string; ratio: number; level: ContrastLevel }[] = [];

    // Text on surface
    const textOnSurface = getContrastRatio(
      normalizeColor(effectiveColors.textPrimary),
      normalizeColor(effectiveColors.surface)
    );
    const surfaceLevel = getContrastLevel(textOnSurface);
    if (surfaceLevel === 'Fail') {
      issues.push({
        pair: 'Text on Surface',
        ratio: textOnSurface,
        level: surfaceLevel,
      });
    }

    // Text on gradient (approximate with gradientMiddle)
    const textOnGradient = getContrastRatio(
      normalizeColor(effectiveColors.textOnGradient),
      normalizeColor(effectiveColors.gradientMiddle)
    );
    const gradientLevel = getContrastLevel(textOnGradient);
    if (gradientLevel === 'Fail') {
      issues.push({
        pair: 'Text on Gradient',
        ratio: textOnGradient,
        level: gradientLevel,
      });
    }

    // Secondary text on surface
    const secondaryOnSurface = getContrastRatio(
      normalizeColor(effectiveColors.textSecondary),
      normalizeColor(effectiveColors.surface)
    );
    const secondaryLevel = getContrastLevel(secondaryOnSurface);
    if (secondaryLevel === 'Fail') {
      issues.push({
        pair: 'Secondary on Surface',
        ratio: secondaryOnSurface,
        level: secondaryLevel,
      });
    }

    return issues;
  };

  const contrastIssues = getContrastIssues();
  const effectiveDisplayFont =
    fontOverrides.display || theme.typography.fontDisplay;
  const effectiveBodyFont = fontOverrides.body || theme.typography.fontBody;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        ...(position
          ? { left: position.x, top: position.y, bottom: 'auto', right: 'auto' }
          : { bottom: '1rem', right: '1rem' }),
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '1rem',
        width: showExtended ? '380px' : '300px',
        maxHeight: '85vh',
        overflowY: 'auto',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.875rem',
        color: '#fff',
        boxShadow: isDragging
          ? '0 15px 50px rgba(0, 0, 0, 0.7)'
          : '0 10px 40px rgba(0, 0, 0, 0.5)',
        transition: isDragging ? 'none' : 'box-shadow 0.2s',
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleDragStart}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
          THEME SWATCH
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {contrastIssues.length > 0 && (
            <span
              style={{
                fontSize: '0.65rem',
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                padding: '2px 6px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab('contrast')}
            >
              {contrastIssues.length} contrast issue
              {contrastIssues.length > 1 ? 's' : ''}
            </span>
          )}
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
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {(['colors', 'fonts', 'contrast'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '0.375rem 0.5rem',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor:
                activeTab === tab ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              color: activeTab === tab ? '#fff' : '#888',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ===== COLORS TAB ===== */}
      {activeTab === 'colors' && (
        <>
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
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
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

          {/* Color Harmony Presets */}
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
              Quick Harmony
            </label>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {(
                [
                  'complementary',
                  'analogous',
                  'triadic',
                  'split-complementary',
                ] as HarmonyType[]
              ).map((type) => (
                <button
                  key={type}
                  onClick={() => applyHarmony(type)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.65rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    color: '#aaa',
                    textTransform: 'capitalize',
                  }}
                >
                  {type.replace('-', ' ')}
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
              {PRIMARY_COLORS.map((c) => (
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

            {/* Extended colors by category */}
            {showExtended && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {/* Surfaces */}
                <div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: '#666',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Surfaces
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.5rem',
                    }}
                  >
                    {SURFACE_COLORS.map((c) => (
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
                </div>
                {/* Text */}
                <div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: '#666',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Text
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.5rem',
                    }}
                  >
                    {TEXT_COLORS.map((c) => (
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
                </div>
                {/* Accents & Status */}
                <div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: '#666',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Accents & Status
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.5rem',
                    }}
                  >
                    {ACCENT_COLORS.map((c) => (
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
                </div>
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
        </>
      )}

      {/* ===== FONTS TAB ===== */}
      {activeTab === 'fonts' && (
        <>
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
              Display Font (Headers)
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              {DISPLAY_FONTS.map((font) => (
                <button
                  key={font.value}
                  onClick={() => handleFontChange('display', font.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    fontFamily: font.value,
                    backgroundColor:
                      effectiveDisplayFont === font.value
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border:
                      effectiveDisplayFont === font.value
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '1px solid transparent',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    color: '#fff',
                    textAlign: 'left',
                  }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

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
              Body Font (Text)
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              {BODY_FONTS.map((font) => (
                <button
                  key={font.value}
                  onClick={() => handleFontChange('body', font.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    fontFamily: font.value,
                    backgroundColor:
                      effectiveBodyFont === font.value
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border:
                      effectiveBodyFont === font.value
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '1px solid transparent',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    color: '#fff',
                    textAlign: 'left',
                  }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Preview */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                fontFamily: effectiveDisplayFont,
                fontSize: '1.25rem',
                marginBottom: '0.5rem',
              }}
            >
              The Quick Brown Fox
            </div>
            <div
              style={{
                fontFamily: effectiveBodyFont,
                fontSize: '0.875rem',
                color: '#aaa',
              }}
            >
              Jumps over the lazy dog. This is how your body text will look with
              the selected fonts.
            </div>
          </div>
        </>
      )}

      {/* ===== CONTRAST TAB ===== */}
      {activeTab === 'contrast' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#888',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Contrast Checker (WCAG 2.1)
            </div>

            {/* Key color pairs */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <ContrastPair
                label="Text on Surface"
                fg={effectiveColors.textPrimary}
                bg={effectiveColors.surface}
              />
              <ContrastPair
                label="Text on Gradient"
                fg={effectiveColors.textOnGradient}
                bg={effectiveColors.gradientMiddle}
              />
              <ContrastPair
                label="Secondary on Surface"
                fg={effectiveColors.textSecondary}
                bg={effectiveColors.surface}
              />
              <ContrastPair
                label="Muted on Surface"
                fg={effectiveColors.textMuted}
                bg={effectiveColors.surface}
              />
              <ContrastPair
                label="Accent on Surface"
                fg={effectiveColors.accent}
                bg={effectiveColors.surface}
              />
            </div>
          </div>

          {/* WCAG Legend */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.375rem',
              padding: '0.75rem',
              fontSize: '0.65rem',
              color: '#888',
            }}
          >
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
              WCAG Standards:
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span>
                <span style={{ color: '#22c55e' }}>AAA</span> 7:1+
              </span>
              <span>
                <span style={{ color: '#fbbf24' }}>AA</span> 4.5:1+
              </span>
              <span>
                <span style={{ color: '#ef4444' }}>Fail</span> &lt;4.5:1
              </span>
            </div>
          </div>
        </>
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

// Contrast pair display for WCAG checking
function ContrastPair({
  label,
  fg,
  bg,
}: {
  label: string;
  fg: string;
  bg: string;
}) {
  const fgHex = normalizeColor(fg);
  const bgHex = normalizeColor(bg);
  const ratio = getContrastRatio(fgHex, bgHex);
  const level = getContrastLevel(ratio);

  const levelColors: Record<ContrastLevel, string> = {
    AAA: '#22c55e',
    AA: '#fbbf24',
    Fail: '#ef4444',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '0.375rem',
      }}
    >
      {/* Preview swatch */}
      <div
        style={{
          width: '40px',
          height: '28px',
          backgroundColor: bgHex,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.65rem',
          fontWeight: 600,
          color: fgHex,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        Aa
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.7rem', color: '#ccc' }}>{label}</div>
        <div style={{ fontSize: '0.6rem', color: '#666' }}>
          {ratio.toFixed(2)}:1
        </div>
      </div>
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 600,
          color: levelColors[level],
          padding: '2px 6px',
          backgroundColor: `${levelColors[level]}20`,
          borderRadius: '4px',
        }}
      >
        {level}
      </span>
    </div>
  );
}
