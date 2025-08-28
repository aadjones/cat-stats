import { useState } from 'react';
import type { FriendshipReport } from '../../core/friendship/types';

interface FriendshipShowdownProps {
  report: FriendshipReport;
  onClose: () => void;
}

export function FriendshipShowdown({
  report,
  onClose,
}: FriendshipShowdownProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
  };

  const getRelationshipColor = (score: number) => {
    if (score >= 75) return 'from-green-600 to-emerald-600'; // Compatible: Green
    if (score >= 50) return 'from-yellow-600 to-orange-600'; // Neutral/Truce: Yellow-Orange
    return 'from-red-600 to-rose-600'; // Enemies: Red
  };

  const getRelationshipEmoji = (score: number) => {
    if (score >= 75) return '🤝'; // Compatible: Handshake
    if (score >= 50) return '⚔️'; // Neutral: Crossed swords
    return '💥'; // Enemies: Explosion
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${getRelationshipColor(report.overallScore)} p-6 text-center relative rounded-t-xl`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-xl font-bold"
          >
            ×
          </button>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            🏟️ ULTIMATE SHOWDOWN
          </h2>
          <h3 className="text-xl text-white/90 font-semibold">
            {report.petNames.join(' vs ')}
          </h3>
        </div>

        {/* Main Showdown Card */}
        <div className="p-6">
          <div className="bg-gray-700 rounded-lg p-6 mb-6 border border-gray-600">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl">
                {getRelationshipEmoji(report.overallScore)}
              </span>
            </div>

            <h4 className="text-xl font-bold text-white text-center mb-3">
              {report.signatureClash.name}
            </h4>

            <p className="text-gray-300 text-center mb-4">
              {report.signatureClash.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">
                  {report.overallScore}/100
                </div>
                <div className="text-sm text-gray-400">Compatibility Score</div>
              </div>

              <div>
                <div className="text-lg font-bold text-yellow-300">
                  {report.relationshipDynamic}
                </div>
                <div className="text-sm text-gray-400">
                  Relationship Dynamic
                </div>
              </div>

              <div className="sm:col-span-1 col-span-1">
                <div className="text-lg font-bold text-cyan-300">
                  {report.finalVerdict}
                </div>
                <div className="text-sm text-gray-400">Final Verdict</div>
              </div>
            </div>
          </div>

          {/* Expandable Sections */}
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
                            // Try multiple parsing strategies
                            let moves: string[] = [];

                            // Strategy 1: Split by bullet points or newlines
                            if (
                              content.includes('•') ||
                              content.includes('\n')
                            ) {
                              moves = content
                                .split(/\n|•/)
                                .filter(
                                  (move) => move.trim() && move.includes(':')
                                );
                            }
                            // Strategy 2: Split by periods if we find move-like patterns
                            else if (content.match(/[A-Z][a-zA-Z\s]+:/g)) {
                              moves = content.split(/\.(?=\s*[A-Z])/);
                            }
                            // Strategy 3: Fallback - treat as single block and try to extract moves
                            else {
                              const movePattern =
                                /([A-Z][a-zA-Z\s]+):\s*([^.]+\.?)/g;
                              const matches = [
                                ...content.matchAll(movePattern),
                              ];
                              moves = matches.map(
                                (match) => `${match[1]}: ${match[2]}`
                              );
                            }

                            // If no moves found, show as single text block
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
                          <p className="text-gray-300 leading-relaxed">
                            {content}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
