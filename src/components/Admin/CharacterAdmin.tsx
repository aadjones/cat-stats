import { useState, useRef } from 'react';
import { Button } from '../UI/Button';

interface CharacterInfo {
  id: string;
  petName: string;
  archetype: string;
  petPhoto: string | null;
  isInHallOfFame: boolean;
}

interface CharacterAdminProps {
  adminToken: string;
}

export function CharacterAdmin({ adminToken }: CharacterAdminProps) {
  const [characterId, setCharacterId] = useState('');
  const [character, setCharacter] = useState<CharacterInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCharacter = async () => {
    if (!characterId.trim()) {
      setError('Please enter a character ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setCharacter(null);
    setNewPhoto(null);

    try {
      // Fetch character data
      const charResponse = await fetch(`/api/character/${characterId}`);
      if (!charResponse.ok) {
        if (charResponse.status === 404) {
          setError('Character not found');
        } else {
          setError('Failed to fetch character');
        }
        setLoading(false);
        return;
      }

      const charData = await charResponse.json();

      // Check if in Hall of Fame
      const hofResponse = await fetch('/api/hall-of-fame');
      const hofData = await hofResponse.json();
      const isInHallOfFame =
        hofData.characterIds?.includes(characterId) || false;

      setCharacter({
        id: characterId,
        petName: charData.petName,
        archetype: charData.characterData?.archetype || 'Unknown',
        petPhoto: charData.petPhoto || null,
        isInHallOfFame,
      });
    } catch {
      setError('Failed to fetch character');
    } finally {
      setLoading(false);
    }
  };

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Calculate new dimensions (max 800x800, maintain aspect ratio)
          const maxSize = 800;
          let { width, height } = img;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress to JPEG at 85% quality
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      const processed = await processImage(file);
      setNewPhoto(processed);
      setError(null);
    } catch {
      setError('Failed to process image');
    }
  };

  const savePhoto = async () => {
    if (!character || !newPhoto) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/update-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          id: character.id,
          petPhoto: newPhoto,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update photo');
        return;
      }

      const result = await response.json();
      setSuccess(`Photo updated! URL: ${result.photoUrl}`);
      setCharacter({ ...character, petPhoto: result.photoUrl });
      setNewPhoto(null);
    } catch {
      setError('Failed to save photo');
    } finally {
      setUploading(false);
    }
  };

  const toggleHallOfFame = async () => {
    if (!character) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/hall-of-fame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: character.isInHallOfFame ? 'remove' : 'add',
          characterId: character.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update Hall of Fame');
        return;
      }

      const newStatus = !character.isInHallOfFame;
      setCharacter({ ...character, isInHallOfFame: newStatus });
      setSuccess(
        newStatus
          ? `${character.petName} added to Hall of Fame!`
          : `${character.petName} removed from Hall of Fame`
      );
    } catch {
      setError('Failed to update Hall of Fame');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
        }}
      >
        Character Admin
      </h2>

      {/* Search */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
          }}
        >
          Character ID
        </label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCharacter()}
            placeholder="e.g., us0suh"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
            }}
          />
          <Button onClick={fetchCharacter} disabled={loading}>
            {loading ? 'Loading...' : 'Lookup'}
          </Button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div
          style={{
            padding: '0.75rem',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            padding: '0.75rem',
            background: '#d1fae5',
            color: '#065f46',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {success}
        </div>
      )}

      {/* Character Info */}
      {character && (
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              gap: '2rem',
            }}
          >
            {/* Photo Section */}
            <div>
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  border: '3px solid #e5e7eb',
                }}
              >
                {newPhoto ? (
                  <img
                    src={newPhoto}
                    alt="New photo preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : character.petPhoto ? (
                  <img
                    src={character.petPhoto}
                    alt={character.petName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '4rem' }}>🐱</span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                >
                  {character.petPhoto ? 'Change Photo' : 'Upload Photo'}
                </Button>

                {newPhoto && (
                  <Button onClick={savePhoto} disabled={uploading}>
                    {uploading ? 'Saving...' : 'Save Photo'}
                  </Button>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                {character.petName}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {character.archetype}
              </p>
              <p
                style={{
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                }}
              >
                ID: {character.id}
              </p>

              {/* Hall of Fame Toggle */}
              <div
                style={{
                  padding: '1rem',
                  background: character.isInHallOfFame ? '#fef3c7' : '#f3f4f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>Hall of Fame</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {character.isInHallOfFame
                      ? '⭐ Currently featured'
                      : 'Not featured'}
                  </div>
                </div>
                <Button
                  onClick={toggleHallOfFame}
                  disabled={uploading}
                  variant={character.isInHallOfFame ? 'secondary' : 'primary'}
                >
                  {uploading
                    ? 'Updating...'
                    : character.isInHallOfFame
                      ? 'Remove'
                      : 'Add to HoF'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
