import { useState, useRef } from 'react';
import { Button } from '../UI/Button';

interface CharacterInfo {
  id: string;
  petName: string;
  archetype: string;
  petPhoto: string | null;
  isInHallOfFame: boolean;
}

interface SearchResult {
  id: string;
  petName: string;
  archetype: string;
}

interface CharacterAdminProps {
  adminToken: string;
}

export function CharacterAdmin({ adminToken }: CharacterAdminProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [character, setCharacter] = useState<CharacterInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchCharacters = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setSearching(true);
    setError(null);
    setSearchResults([]);

    // Check if it looks like an ID (6 character lowercase alphanumeric, no uppercase letters)
    // IDs are always lowercase, so "Stella" won't match but "qaqbm2" will
    const trimmed = searchQuery.trim();
    if (/^[a-z0-9]{6}$/.test(trimmed) && trimmed === trimmed.toLowerCase()) {
      // Direct ID lookup
      await fetchCharacter(trimmed);
      setSearching(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/search-characters?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('No characters found');
        } else {
          setError('Search failed');
        }
        setSearching(false);
        return;
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setError('No characters found matching that name');
      }
    } catch {
      setError('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const fetchCharacter = async (id: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCharacter(null);
    setNewPhoto(null);
    setSearchResults([]);

    try {
      const charResponse = await fetch(`/api/character/${id}`);
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

      const hofResponse = await fetch('/api/hall-of-fame');
      const hofData = await hofResponse.json();
      const isInHallOfFame = hofData.characterIds?.includes(id) || false;

      setCharacter({
        id,
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
      setSuccess(`Photo updated!`);
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
          color: 'var(--color-text-on-gradient)',
        }}
      >
        Character Admin
      </h2>

      {/* Search */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
          }}
        >
          Search by ID or Name
        </label>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCharacters()}
            placeholder="e.g., us0suh or Whiskers"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-surface-alt)',
              color: 'var(--color-text-primary)',
              boxSizing: 'border-box',
            }}
          />
          <Button onClick={searchCharacters} disabled={loading || searching}>
            {loading || searching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.75rem',
            }}
          >
            Found {searchResults.length} character
            {searchResults.length !== 1 ? 's' : ''}:
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => fetchCharacter(result.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {result.petName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {result.archetype}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'monospace',
                  }}
                >
                  {result.id}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div
          style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            padding: '0.75rem',
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#4ade80',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          {success}
        </div>
      )}

      {/* Character Info */}
      {character && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
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
                  background: 'var(--color-surface-alt)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  border: '3px solid var(--color-border)',
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
                  <span style={{ fontSize: '4rem' }}>🐈‍⬛</span>
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
                  color: 'var(--color-text-primary)',
                }}
              >
                {character.petName}
              </h3>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  marginBottom: '1rem',
                }}
              >
                {character.archetype}
              </p>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                  fontFamily: 'monospace',
                }}
              >
                ID: {character.id}
              </p>

              {/* Hall of Fame Toggle */}
              <div
                style={{
                  padding: '1rem',
                  background: character.isInHallOfFame
                    ? 'rgba(234, 179, 8, 0.2)'
                    : 'var(--color-surface-alt)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: character.isInHallOfFame
                    ? '1px solid rgba(234, 179, 8, 0.3)'
                    : '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Hall of Fame
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
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
