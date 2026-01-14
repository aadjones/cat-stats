import { useState, useEffect, useCallback } from 'react';
import { AdminLogin } from './AdminLogin';
import { AnalyticsPage } from '../Analytics/AnalyticsPage';
import { CharacterAdmin } from './CharacterAdmin';
import {
  getAdminToken,
  setAdminToken,
  clearAdminToken,
} from '../../services/adminAuth';
import { Button } from '../UI/Button';

type AdminSection = 'analytics' | 'characters';

interface AdminLayoutProps {
  initialSection?: AdminSection;
  onBack: () => void;
}

export function AdminLayout({
  initialSection = 'analytics',
  onBack,
}: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] =
    useState<AdminSection>(initialSection);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const existingToken = getAdminToken();
    if (existingToken) {
      // Validate the token by making a test request
      validateToken(existingToken);
    }
  }, []);

  const validateToken = async (tokenToValidate: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/analytics?days=1', {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`,
        },
      });

      if (response.ok) {
        setToken(tokenToValidate);
        setIsAuthenticated(true);
        return true;
      }
      // Token invalid, clear it
      clearAdminToken();
      return false;
    } catch {
      return false;
    }
  };

  const handleLogin = useCallback(async (inputToken: string) => {
    const isValid = await validateToken(inputToken);
    if (isValid) {
      setAdminToken(inputToken);
    }
    return isValid;
  }, []);

  const handleLogout = () => {
    clearAdminToken();
    setToken(null);
    setIsAuthenticated(false);
  };

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    // Update URL without reload
    window.history.replaceState({}, '', `/admin/${section}`);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} onBack={onBack} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          Admin Panel
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button onClick={onBack} variant="secondary">
            Back to App
          </Button>
          <Button onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 2rem',
          display: 'flex',
          gap: '0',
        }}
      >
        <TabButton
          active={activeSection === 'analytics'}
          onClick={() => handleSectionChange('analytics')}
        >
          📊 Analytics
        </TabButton>
        <TabButton
          active={activeSection === 'characters'}
          onClick={() => handleSectionChange('characters')}
        >
          🐱 Characters
        </TabButton>
      </div>

      {/* Content */}
      <div style={{ padding: '0' }}>
        {activeSection === 'analytics' && token && (
          <AnalyticsPage adminToken={token} />
        )}
        {activeSection === 'characters' && token && (
          <CharacterAdmin adminToken={token} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '1rem 1.5rem',
        background: 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
        color: active ? '#2563eb' : '#6b7280',
        fontWeight: active ? '600' : '400',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}
