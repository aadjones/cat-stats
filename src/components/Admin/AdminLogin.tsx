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
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textAlign: 'center',
            color: 'var(--color-text-on-gradient)',
          }}
        >
          Admin Panel
        </h1>

        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '2rem',
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
            Admin Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter admin token"
            autoFocus
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              marginBottom: '1rem',
              boxSizing: 'border-box',
              background: 'var(--color-surface-alt)',
              color: 'var(--color-text-primary)',
            }}
          />

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
    </div>
  );
}
