/**
 * Dev Theme Panel
 *
 * A floating panel for developers to preview different themes.
 * Toggle visibility with Ctrl+Shift+T (or Cmd+Shift+T on Mac).
 */

import { useEffect } from 'react';
import { useTheme } from './useTheme';
import { statAccents } from './themes';

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
  } = useTheme();

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

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '1rem',
        width: '280px',
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
              onClick={() => setTheme(t.id)}
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
              <div
                style={{
                  display: 'flex',
                  gap: '2px',
                }}
              >
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

      {/* Color Preview */}
      <div>
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
          Active Palette
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '4px',
          }}
        >
          {[
            { label: 'BG', color: 'var(--color-background)' },
            { label: 'Srf', color: 'var(--color-surface)' },
            { label: 'Acc', color: 'var(--color-accent)' },
            { label: 'Txt', color: 'var(--color-text-primary)' },
            { label: 'Gld', color: 'var(--color-gold)' },
            { label: 'Dng', color: 'var(--color-danger)' },
          ].map((c) => (
            <div key={c.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: c.color,
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
              <div
                style={{ fontSize: '0.6rem', color: '#666', marginTop: '2px' }}
              >
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '1rem',
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
