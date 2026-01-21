import { ImageResponse } from '@vercel/og';
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

// Theme colors mapped from themeService.ts
// Using darker backgrounds for OG images to make text pop
const THEME_COLORS = {
  wisdom: {
    background:
      'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    accent: '#818cf8',
    text: '#e0e7ff',
  },
  cunning: {
    background:
      'linear-gradient(135deg, #064e3b 0%, #115e59 50%, #164e63 100%)',
    accent: '#34d399',
    text: '#d1fae5',
  },
  agility: {
    background:
      'linear-gradient(135deg, #7f1d1d 0%, #7c2d12 50%, #78350f 100%)',
    accent: '#f87171',
    text: '#fef2f2',
  },
  charisma: {
    background:
      'linear-gradient(135deg, #831843 0%, #581c87 50%, #701a75 100%)',
    accent: '#f472b6',
    text: '#fce7f3',
  },
  stealth: {
    background:
      'linear-gradient(135deg, #0f172a 0%, #111827 50%, #18181b 100%)',
    accent: '#94a3b8',
    text: '#e2e8f0',
  },
  resolve: {
    background:
      'linear-gradient(135deg, #713f12 0%, #78350f 50%, #7c2d12 100%)',
    accent: '#fbbf24',
    text: '#fefce8',
  },
};

// Default theme for fallback
const DEFAULT_THEME = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  accent: '#e94560',
  text: '#eaeaea',
};

function getDominantStat(stats) {
  if (!stats) return null;

  const statEntries = [
    ['wisdom', stats.wisdom || 0],
    ['cunning', stats.cunning || 0],
    ['agility', stats.agility || 0],
    ['stealth', stats.stealth || 0],
    ['charisma', stats.charisma || 0],
    ['resolve', stats.resolve || 0],
  ];

  return statEntries.reduce((max, current) =>
    current[1] > max[1] ? current : max
  )[0];
}

function getTheme(stats) {
  const dominant = getDominantStat(stats);
  return dominant ? THEME_COLORS[dominant] : DEFAULT_THEME;
}

export default async function handler(req) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id || id.length !== 6) {
    return createFallbackImage();
  }

  try {
    const character = await kv.get(`character:${id}`);

    if (!character) {
      return createFallbackImage();
    }

    const { petName, petPhoto, characterData, stats } = character;
    const archetype = characterData?.archetype || 'Legendary Pet';
    const theme = getTheme(stats);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background: theme.background,
            padding: '48px',
          }}
        >
          {/* Main content container */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              gap: '48px',
            }}
          >
            {/* Pet photo or empty space */}
            {petPhoto ? (
              <div
                style={{
                  display: 'flex',
                  width: '400px',
                  height: '400px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: `4px solid ${theme.accent}`,
                  boxShadow: `0 0 60px ${theme.accent}40`,
                  flexShrink: 0,
                }}
              >
                <img
                  src={petPhoto}
                  alt={petName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ) : null}

            {/* Text content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
                gap: '16px',
              }}
            >
              {/* Pet name */}
              <div
                style={{
                  fontSize: petPhoto ? '72px' : '96px',
                  fontWeight: 'bold',
                  color: theme.text,
                  lineHeight: 1.1,
                  textShadow: `0 4px 12px ${theme.accent}60`,
                }}
              >
                {petName || 'Unknown Legend'}
              </div>

              {/* Archetype */}
              <div
                style={{
                  fontSize: petPhoto ? '36px' : '48px',
                  color: theme.accent,
                  fontStyle: 'italic',
                  marginTop: '8px',
                }}
              >
                {archetype}
              </div>

              {/* CatStats branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 'auto',
                  paddingTop: '32px',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '28px',
                    color: theme.text,
                    opacity: 0.8,
                  }}
                >
                  CatStats
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return createFallbackImage();
  }
}

function createFallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: DEFAULT_THEME.background,
          gap: '24px',
        }}
      >
        <div
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: DEFAULT_THEME.text,
          }}
        >
          CatStats
        </div>
        <div
          style={{
            fontSize: '36px',
            color: DEFAULT_THEME.accent,
          }}
        >
          Turn Your Pet Into a Legend
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  );
}
