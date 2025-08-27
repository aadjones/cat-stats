import type { CharacterSheet as CharacterSheetData } from '../../core/personality/types';

interface Theme {
  gradient: string;
  accentRgb: string;
  accent: string;
}

interface ShareableCardProps {
  characterSheet: CharacterSheetData;
  theme: Theme;
}

export function ShareableCard({ characterSheet, theme }: ShareableCardProps) {
  const { characterData, stats, petName, petPhoto } = characterSheet;

  // Get top 3 stats for highlight
  const topStats = Object.entries(stats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    }));

  // Get the most impressive ability from each category
  const bestCombatMove = characterData.combatMoves[0];
  const bestSocialSkill = characterData.socialSkills[0];

  // Convert theme gradient to actual CSS gradient for html2canvas
  const getGradientStyle = () => {
    const gradientMap: Record<string, string> = {
      'from-blue-900 via-indigo-900 to-purple-900':
        'linear-gradient(135deg, #1e3a8a, #312e81, #581c87)',
      'from-emerald-900 via-teal-900 to-cyan-900':
        'linear-gradient(135deg, #064e3b, #134e4a, #164e63)',
      'from-red-900 via-orange-900 to-amber-900':
        'linear-gradient(135deg, #7f1d1d, #7c2d12, #78350f)',
      'from-pink-900 via-purple-900 to-fuchsia-900':
        'linear-gradient(135deg, #831843, #581c87, #701a75)',
      'from-slate-900 via-gray-900 to-zinc-900':
        'linear-gradient(135deg, #0f172a, #111827, #18181b)',
      'from-yellow-900 via-amber-900 to-orange-900':
        'linear-gradient(135deg, #713f12, #78350f, #7c2d12)',
    };
    return (
      gradientMap[theme.gradient] ||
      'linear-gradient(135deg, #312e81, #581c87, #7c2d12)'
    );
  };

  const containerStyle: React.CSSProperties = {
    width: '375px',
    height: '600px',
    background: getGradientStyle(),
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '24px',
  };

  const photoStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0 auto 16px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '4px',
  };

  const subtitleStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '18px',
    fontWeight: '500',
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '12px',
  };

  const statRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  };

  const statNameStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  };

  const statBarContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const statBarStyle: React.CSSProperties = {
    width: '64px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    height: '8px',
    overflow: 'hidden',
  };

  const statValueStyle: React.CSSProperties = {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    width: '32px',
    textAlign: 'right',
  };

  const abilityStyle: React.CSSProperties = {
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
  };

  const abilityTitleStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '4px',
  };

  const abilityDescStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '12px',
    lineHeight: '1.4',
  };

  const vulnerabilityStyle: React.CSSProperties = {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '16px',
  };

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
  };

  const footerSmallStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    marginBottom: '4px',
  };

  const footerTitleStyle: React.CSSProperties = {
    color: 'white',
    fontWeight: 'bold',
  };

  const footerTaglineStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
  };

  return (
    <div id="shareable-card" style={containerStyle}>
      {/* Background pattern for visual interest */}
      <div style={{ position: 'absolute', inset: '0', opacity: '0.1' }}>
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '40px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        ></div>
      </div>

      <div style={contentStyle}>
        {/* Header with pet photo and name */}
        <div style={headerStyle}>
          {petPhoto && (
            <div style={photoStyle}>
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
          )}
          <h1 style={titleStyle}>{petName.toUpperCase()}</h1>
          <p style={subtitleStyle}>{characterData.archetype}</p>
        </div>

        {/* Top 3 Stats */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Legendary Stats</h3>
          <div>
            {topStats.map((stat) => (
              <div key={stat.name} style={statRowStyle}>
                <span style={statNameStyle}>{stat.name}</span>
                <div style={statBarContainerStyle}>
                  <div style={statBarStyle}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '10px',
                        width: `${stat.value}%`,
                        transition: 'width 0.5s ease',
                      }}
                    ></div>
                  </div>
                  <span style={statValueStyle}>{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Abilities */}
        <div style={{ ...sectionStyle, flexGrow: 1 }}>
          <h3 style={sectionTitleStyle}>Signature Moves</h3>
          <div>
            {bestCombatMove && (
              <div
                style={{
                  ...abilityStyle,
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                }}
              >
                <div style={{ ...abilityTitleStyle, color: '#fecaca' }}>
                  ⚔️ {bestCombatMove.name}
                </div>
                <div style={abilityDescStyle}>{bestCombatMove.description}</div>
              </div>
            )}
            {bestSocialSkill && (
              <div
                style={{
                  ...abilityStyle,
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                }}
              >
                <div style={{ ...abilityTitleStyle, color: '#fde68a' }}>
                  💬 {bestSocialSkill.name}
                </div>
                <div style={abilityDescStyle}>
                  {bestSocialSkill.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Critical Vulnerability (fun factor) */}
        <div style={vulnerabilityStyle}>
          <div style={{ ...abilityTitleStyle, color: '#fecaca' }}>
            ⚠️ {characterData.weakness.name}
          </div>
          <div style={{ ...abilityDescStyle, fontSize: '12px' }}>
            {characterData.weakness.description}
          </div>
        </div>

        {/* Footer with CTA */}
        <div style={footerStyle}>
          <div style={footerSmallStyle}>Created with</div>
          <div style={footerTitleStyle}>CatStats</div>
          <div style={footerTaglineStyle}>Turn your pet into a legend!</div>
        </div>
      </div>
    </div>
  );
}
