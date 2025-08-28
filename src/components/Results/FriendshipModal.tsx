import { useState } from 'react';
import type { CharacterSheet } from '../../core/personality/types';
import type { FriendshipReport } from '../../core/friendship/types';
import { Button } from '../UI/Button';
import { FriendshipShowdown } from './FriendshipShowdown';
import {
  generateFriendshipReport,
  FRIENDSHIP_LOADING_MESSAGES,
} from '../../services/api/friendshipApi';

interface FriendshipModalProps {
  currentCharacter: CharacterSheet;
  characterId: string | null;
  onClose: () => void;
}

export function FriendshipModal({
  currentCharacter,
  characterId,
  onClose,
}: FriendshipModalProps) {
  const [friendCharacterId, setFriendCharacterId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [showdownReport, setShowdownReport] = useState<FriendshipReport | null>(
    null
  );

  const handleGenerateShowdown = async () => {
    if (!friendCharacterId.trim()) {
      setError("Please enter your friend's character ID");
      return;
    }

    if (!characterId) {
      setError(
        'Your character needs to be saved first. Please try again in a moment.'
      );
      return;
    }

    setLoading(true);
    setError('');
    setLoadingMessage(FRIENDSHIP_LOADING_MESSAGES[0]);

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessage((prev) => {
        const currentIndex = FRIENDSHIP_LOADING_MESSAGES.indexOf(prev);
        const nextIndex =
          (currentIndex + 1) % FRIENDSHIP_LOADING_MESSAGES.length;
        return FRIENDSHIP_LOADING_MESSAGES[nextIndex];
      });
    }, 3000);

    try {
      const report = await generateFriendshipReport(
        characterId,
        friendCharacterId.trim()
      );
      setShowdownReport(report);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate showdown'
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
      clearInterval(messageInterval);
    }
  };

  if (showdownReport) {
    return (
      <FriendshipShowdown
        report={showdownReport}
        onClose={() => setShowdownReport(null)}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-md w-full p-6 relative">
          {/* Loading overlay for friendship generation */}
          {loading && (
            <div className="absolute inset-0 bg-gray-800/95 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center p-6">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-white font-bold text-lg mb-2">
                  ⚔️ Generating Showdown
                </h3>
                <p className="text-white/80 text-sm mb-4">{loadingMessage}</p>
                <div className="w-full bg-purple-500/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse"
                    style={{ width: '70%' }}
                  ></div>
                </div>
                <p className="text-white/60 text-xs mt-4">
                  This usually takes 20-30 seconds
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">🏟️ Create Showdown</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              Enter your friend's character ID to see how{' '}
              <strong>{currentCharacter.petName}</strong> would fare against
              their pet!
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Friend's Character ID
                </label>
                <input
                  type="text"
                  value={friendCharacterId}
                  onChange={(e) => setFriendCharacterId(e.target.value)}
                  placeholder="e.g., 5xk1je"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {!loading && (
            <div className="flex gap-3">
              <Button onClick={onClose} variant="secondary" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleGenerateShowdown}
                disabled={!friendCharacterId.trim()}
                className="flex-1"
              >
                ⚔️ Begin Showdown
              </Button>
            </div>
          )}

          {!loading && (
            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
              <p className="text-blue-200 text-xs">
                💡 <strong>Tip:</strong> Ask your friends to share their
                character links with you to get their IDs easily!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
