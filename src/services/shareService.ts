import html2canvas from 'html2canvas';
import type { CharacterSheet } from '../core/personality/types';

interface ShareData {
  title: string;
  text: string;
  url?: string;
  files?: File[];
}

export async function generateShareableImage(
  elementId: string
): Promise<Blob | null> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found for image generation');
      return null;
    }

    // Configure html2canvas for high quality output
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: 375,
      height: 600,
    });

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', 1.0);
    });
  } catch (error) {
    console.error('Error generating shareable image:', error);
    return null;
  }
}

export async function shareCharacterSheet(
  characterSheet: CharacterSheet
): Promise<boolean> {
  const { petName, characterData } = characterSheet;

  // Generate the image first
  const imageBlob = await generateShareableImage('shareable-card');

  const shareData: ShareData = {
    title: `Meet ${petName} - ${characterData.archetype}`,
    text: `Check out ${petName}'s legendary character sheet! 🐈‍⬛⚔️ Create your own: https://cat-stats-six.vercel.app/`,
  };

  // If we have an image and native sharing is supported, include the image
  if (imageBlob && navigator.share && 'canShare' in navigator) {
    const imageFile = new File([imageBlob], `${petName}-CatStats.png`, {
      type: 'image/png',
    });

    const shareWithFile = { ...shareData, files: [imageFile] };

    if (navigator.canShare(shareWithFile)) {
      try {
        await navigator.share(shareWithFile);
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing with file:', error);
          // Fall back to sharing without file
        } else {
          return false; // User cancelled
        }
      }
    }
  }

  // Fall back to native share without file
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fall back to manual methods
      } else {
        return false; // User cancelled
      }
    }
  }

  // Final fallback: download image and copy app link
  if (imageBlob) {
    downloadImage(imageBlob, petName);
  }

  // Copy app link to clipboard for easy sharing
  try {
    await navigator.clipboard.writeText('https://cat-stats-six.vercel.app/');
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return true; // Still return success since image was downloaded
  }
}

function downloadImage(blob: Blob, petName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${petName}-CatStats-Legend.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getShareCapabilities() {
  return {
    hasNativeShare: !!navigator.share,
    hasFileShare: !!navigator.share, // Simplified - actual canShare check happens at usage time
    hasClipboard: !!navigator.clipboard,
  };
}

export async function downloadCharacterImage(
  characterSheet: CharacterSheet
): Promise<boolean> {
  const { petName } = characterSheet;
  const imageBlob = await generateShareableImage('shareable-card');

  if (imageBlob) {
    downloadImage(imageBlob, petName);
    return true;
  }

  return false;
}
