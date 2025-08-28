import { useState, useEffect } from 'react';
import type { FriendshipReport } from '../../core/friendship/types';
import { Button } from '../UI/Button';
import { LoadingOverlay } from '../UI/LoadingOverlay';

interface ShowdownPageProps {
  showdownId: string;
  onReset: () => void;
}

export function ShowdownPage({ showdownId, onReset }: ShowdownPageProps) {
  const [report, setReport] = useState<FriendshipReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShowdown = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/showdown/${showdownId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              'Showdown not found. It may have been removed or the link is invalid.'
            );
          }
          throw new Error(`Failed to load showdown: ${response.status}`);
        }

        const showdownData = await response.json();
        setReport(showdownData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load showdown'
        );
      } finally {
        setLoading(false);
      }
    };

    loadShowdown();
  }, [showdownId]);

  if (loading) {
    return <LoadingOverlay message="Loading epic showdown..." visible={true} />;
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">
            ❌ Showdown Not Found
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button onClick={onReset} variant="primary">
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <div className="p-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button onClick={onReset} variant="secondary" size="sm">
            ← Back to Home
          </Button>
          <Button
            onClick={() =>
              navigator.share
                ? navigator
                    .share({
                      title: `${report.petNames.join(' vs ')} - Ultimate Showdown`,
                      text: `Check out this epic pet showdown: ${report.relationshipDynamic}!`,
                      url: window.location.href,
                    })
                    .catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Showdown link copied to clipboard!');
                    })
                : (() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Showdown link copied to clipboard!');
                  })()
            }
            variant="primary"
            size="sm"
          >
            📤 Share Showdown
          </Button>
        </div>
      </div>

      {/* Showdown Content - Remove modal wrapper from FriendshipShowdown */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 border border-gray-600 rounded-xl overflow-hidden">
            {/* Header */}
            <div
              className={`bg-gradient-to-r ${getRelationshipColor(report.overallScore)} p-6 text-center`}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                🏟️ ULTIMATE SHOWDOWN
              </h1>
              <h2 className="text-xl text-white/90 font-semibold">
                {report.petNames.join(' vs ')}
              </h2>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <div className="bg-gray-700 rounded-lg p-6 mb-6 border border-gray-600">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl">
                    {getRelationshipEmoji(report.overallScore)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white text-center mb-3">
                  {report.signatureClash.name}
                </h3>

                <p className="text-gray-300 text-center mb-4">
                  {report.signatureClash.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {report.overallScore}/100
                    </div>
                    <div className="text-sm text-gray-400">
                      Compatibility Score
                    </div>
                  </div>

                  <div>
                    <div className="text-lg font-bold text-yellow-300">
                      {report.relationshipDynamic}
                    </div>
                    <div className="text-sm text-gray-400">
                      Relationship Dynamic
                    </div>
                  </div>

                  <div>
                    <div className="text-lg font-bold text-cyan-300">
                      {report.finalVerdict}
                    </div>
                    <div className="text-sm text-gray-400">Final Verdict</div>
                  </div>
                </div>
              </div>

              {/* Use the expandable sections from FriendshipShowdown */}
              <FriendshipShowdownSections report={report} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions (copied from FriendshipShowdown)
function getRelationshipColor(score: number) {
  if (score >= 75) return 'from-green-600 to-emerald-600'; // Compatible: Green
  if (score >= 50) return 'from-yellow-600 to-orange-600'; // Neutral/Truce: Yellow-Orange
  return 'from-red-600 to-rose-600'; // Enemies: Red
}

function getRelationshipEmoji(score: number) {
  if (score >= 75) return '🤝'; // Compatible: Handshake
  if (score >= 50) return '⚔️'; // Neutral: Crossed swords
  return '💥'; // Enemies: Explosion
}

// Component for the expandable sections (we'll extract this from FriendshipShowdown)
function FriendshipShowdownSections({ report }: { report: FriendshipReport }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
  };

  return (
    <div className="space-y-3">
      {Object.entries(report.expandableSections).map(([key, content]) => {
        const sectionTitles: Record<string, string> = {
          fullBattleReport: '📜 Full Battle Report',
          livingDynamics: '🏠 Living Dynamics',
          signatureMoves: '⚡ Signature Moves',
          chaosIncidents: '🔥 Chaos Incidents',
        };

        const isExpanded = expandedSection === key;

        return (
          <div
            key={key}
            className="bg-gray-700 rounded-lg border border-gray-600"
          >
            <button
              onClick={() => toggleSection(key)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-600 transition-colors rounded-lg"
            >
              <span className="text-white font-semibold">
                {sectionTitles[key] || key}
              </span>
              <span className="text-gray-400 text-xl">
                {isExpanded ? '−' : '+'}
              </span>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4">
                {key === 'signatureMoves' ? (
                  <div className="space-y-2">
                    {(() => {
                      // Same parsing logic as FriendshipShowdown
                      let moves: string[] = [];

                      if (content.includes('•') || content.includes('\n')) {
                        moves = content
                          .split(/\n|•/)
                          .filter((move) => move.trim() && move.includes(':'));
                      } else if (content.match(/[A-Z][a-zA-Z\s]+:/g)) {
                        moves = content.split(/\.(?=\s*[A-Z])/);
                      } else {
                        const movePattern = /([A-Z][a-zA-Z\s]+):\s*([^.]+\.?)/g;
                        const matches = [...content.matchAll(movePattern)];
                        moves = matches.map(
                          (match) => `${match[1]}: ${match[2]}`
                        );
                      }

                      if (moves.length === 0) {
                        return (
                          <div className="bg-gray-800 rounded p-3 border-l-4 border-purple-500">
                            <div className="text-gray-300 text-sm leading-relaxed">
                              {content}
                            </div>
                          </div>
                        );
                      }

                      return moves
                        .map((move, moveIndex) => {
                          const [name, ...descParts] = move.split(':');
                          const description = descParts.join(':').trim();

                          if (!name || !description) return null;

                          return (
                            <div
                              key={moveIndex}
                              className="bg-gray-800 rounded p-3 border-l-4 border-purple-500"
                            >
                              <div className="text-purple-300 font-bold text-sm mb-1">
                                {name.trim()}
                              </div>
                              <div className="text-gray-300 text-sm leading-relaxed">
                                {description}
                              </div>
                            </div>
                          );
                        })
                        .filter(Boolean);
                    })()}
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded p-3 border-l-4 border-cyan-500">
                    <p className="text-gray-300 leading-relaxed">{content}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
