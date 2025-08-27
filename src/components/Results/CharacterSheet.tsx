import { useState } from 'react';
import type { CharacterSheet as CharacterSheetData } from '../../core/personality/types';
import { Button } from '../UI/Button';
import { StatsRadarChart } from './StatsRadarChart';
import { AbilityCard } from './AbilityCard';
import { ShareableCard } from './ShareableCard';
import {
  shareCharacterSheet,
  downloadCharacterImage,
  getShareCapabilities,
  generateShareableImage,
} from '../../services';
import { getCharacterShareUrl } from '../../services/characterStorage';
import { isFeatureEnabled } from '../../config/featureFlags';

interface Theme {
  gradient: string;
  accentRgb: string;
  accent: string;
}

interface CharacterSheetProps {
  characterSheet: CharacterSheetData;
  theme: Theme;
  characterId: string | null;
  onReset: () => void;
  onDownload: () => void;
}

export function CharacterSheet({
  characterSheet,
  theme,
  characterId,
  onReset,
  onDownload,
}: CharacterSheetProps) {
  const { characterData, stats, petName, petPhoto } = characterSheet;
  const [isSharing, setIsSharing] = useState(false);
  const capabilities = getShareCapabilities();

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await shareCharacterSheet(characterSheet);
      if (success && capabilities.hasNativeShare) {
        // Share completed successfully via native sharing
      } else if (success) {
        alert(
          `✨ ${petName}'s character image downloaded and app link copied! Perfect for sharing anywhere.`
        );
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Sorry, there was an error sharing. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadImage = async () => {
    const success = await downloadCharacterImage(characterSheet);
    if (success) {
      alert(`✨ ${petName}'s shareable image downloaded!`);
    } else {
      alert('Sorry, there was an error creating the image. Please try again.');
    }
  };

  const handleShareFullCharacter = async () => {
    if (!characterId) {
      alert('Character not saved yet. Please try again in a moment.');
      return;
    }

    const shareUrl = getCharacterShareUrl(characterId);

    // Generate the preview image first
    const imageBlob = await generateShareableImage('shareable-card');

    try {
      if (navigator.share && imageBlob && 'canShare' in navigator) {
        const imageFile = new File([imageBlob], `${petName}-CatStats.png`, {
          type: 'image/png',
        });

        const shareData = {
          text: `Meet ${petName} - ${characterData.archetype}! 🐈‍⬛⚔️\n\nCheck out the full character sheet: ${shareUrl}`,
          files: [imageFile],
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      // Fallback: native share without image but with URL
      if (navigator.share) {
        await navigator.share({
          title: `Meet ${petName} - ${characterData.archetype}`,
          text: `Check out ${petName}'s complete legendary character sheet! 🐈‍⬛⚔️`,
          url: shareUrl,
        });
      } else {
        // Final fallback: download image and copy link
        if (imageBlob) {
          const url = URL.createObjectURL(imageBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${petName}-CatStats-Preview.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }

        await navigator.clipboard.writeText(shareUrl);
        alert(
          `✨ Preview image downloaded and character link copied! Share both to give the full experience.`
        );
      }
    } catch (error) {
      // User canceled the share dialog - this is normal, do nothing
      if ((error as Error).name === 'AbortError') {
        return;
      }
      console.error('Error sharing character:', error);
      alert('Sorry, there was an error sharing. Please try again.');
    }
  };

  return (
    <>
      {/* Hidden shareable card for image generation */}
      <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
        <ShareableCard characterSheet={characterSheet} theme={theme} />
      </div>

      <div
        className={`min-h-screen bg-gradient-to-br ${theme.gradient} p-2 sm:p-4`}
      >
        <div className="w-full max-w-4xl mx-auto mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 px-2 sm:px-0">
          <Button variant="secondary" onClick={onReset} size="sm">
            ← Create Another Legend
          </Button>
          {isFeatureEnabled('ENABLE_SHARE_IMAGE') && (
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center justify-center gap-2"
              size="sm"
            >
              {isSharing
                ? '📸 Creating...'
                : capabilities.hasNativeShare
                  ? '📱 Share Image'
                  : '📸 Download & Copy Link'}
            </Button>
          )}

          {characterId && (
            <Button
              onClick={handleShareFullCharacter}
              variant="primary"
              className="flex items-center justify-center gap-2"
              size="sm"
            >
              🔗 Share Full Character
            </Button>
          )}

          {isFeatureEnabled('SHOW_SEPARATE_DOWNLOAD_BUTTON') && (
            <Button
              onClick={handleDownloadImage}
              variant="secondary"
              className="flex items-center justify-center gap-2"
              size="sm"
            >
              🖼️ Download Image
            </Button>
          )}

          {isFeatureEnabled('ENABLE_TEXT_EXPORT') && (
            <Button
              onClick={onDownload}
              variant="secondary"
              className="flex items-center justify-center gap-2"
              size="sm"
            >
              📄 Full Character Sheet
            </Button>
          )}
        </div>

        <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl relative">
            {/* Desktop photo - top-right corner */}
            {petPhoto && (
              <div className="hidden sm:block absolute top-6 right-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white/30 bg-white/10">
                  <img
                    src={petPhoto}
                    alt={petName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="text-center mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                {petName.toUpperCase()}
              </h1>
              <p className="text-white/80 text-lg sm:text-xl">
                {characterData.archetype}
              </p>

              {/* Mobile photo - centered under archetype */}
              {petPhoto && (
                <div className="sm:hidden mt-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white/30 bg-white/10 mx-auto">
                    <img
                      src={petPhoto}
                      alt={petName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 sm:mb-8">
              <StatsRadarChart stats={stats} theme={theme} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-4 sm:p-6">
                <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">
                  Combat Moves
                </h3>
                {characterData.combatMoves.map((ability, index) => (
                  <AbilityCard
                    key={index}
                    ability={ability}
                    colorClass="text-red-300"
                  />
                ))}
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-4 sm:p-6">
                <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">
                  Environmental Powers
                </h3>
                {characterData.environmentalPowers.map((ability, index) => (
                  <AbilityCard
                    key={index}
                    ability={ability}
                    colorClass="text-cyan-300"
                  />
                ))}
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-4 sm:p-6">
                <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">
                  Social Skills
                </h3>
                {characterData.socialSkills.map((ability, index) => (
                  <AbilityCard
                    key={index}
                    ability={ability}
                    colorClass="text-yellow-300"
                  />
                ))}
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-4 sm:p-6">
                <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">
                  Passive Traits
                </h3>
                {characterData.passiveTraits.map((ability, index) => (
                  <AbilityCard
                    key={index}
                    ability={ability}
                    colorClass="text-purple-300"
                  />
                ))}
              </div>
            </div>

            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-red-300 font-bold text-base sm:text-lg mb-2">
                ⚠️ Critical Vulnerability
              </h3>
              <div className="text-white">
                <span className="font-bold">
                  {characterData.weakness.name}:
                </span>{' '}
                {characterData.weakness.description}
              </div>
            </div>

            {characterData.timeModifiers &&
              characterData.timeModifiers.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">
                    Situational Modifiers
                  </h3>
                  {characterData.timeModifiers.map((modifier, index) => (
                    <div
                      key={index}
                      className="bg-white/10 rounded-lg p-3 mb-3"
                    >
                      <div className="text-green-300 font-bold">
                        {modifier.name}
                      </div>
                      <div className="text-white/80 text-sm">
                        {modifier.effect}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
