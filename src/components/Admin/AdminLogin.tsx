import { useState } from 'react';
import { Button } from '../UI/Button';

interface AdminLoginProps {
  onLogin: (token: string) => Promise<boolean>;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!token.trim()) {
      setError('Please enter admin token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await onLogin(token);
      if (!success) {
        setError('Invalid admin token');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 20px',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        Admin Panel
      </h1>

      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '2rem',
        }}
      >
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
          }}
        >
          Admin Token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter admin token"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            marginBottom: '1rem',
            boxSizing: 'border-box',
          }}
        />

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

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </Button>

          <Button onClick={onBack} variant="secondary">
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
