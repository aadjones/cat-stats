import { useState, useEffect, useCallback } from 'react';

interface DailyAnalytics {
  date: string;
  totalCalls: number;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  endpoints: {
    [key: string]: {
      calls: number;
      cost: number;
      inputTokens: number;
      outputTokens: number;
    };
  };
}

interface AnalyticsData {
  analytics: DailyAnalytics[];
  totals: {
    totalCalls: number;
    totalCost: number;
    totalInputTokens: number;
    totalOutputTokens: number;
  };
  daysRequested: number;
}

interface UsageAnalytics {
  charactersCreated: number;
  photosUploaded: number;
  hallOfFameViews: number;
  pdfDownloads: number;
  shareButtonClicks: number;
}

type Tab = 'costs' | 'usage';

interface AnalyticsPageProps {
  adminToken: string;
}

export function AnalyticsPage({ adminToken }: AnalyticsPageProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [usageData, setUsageData] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<Tab>('costs');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics?days=${days}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);

      // Also fetch usage analytics
      const usageResponse = await fetch('/api/get-usage-analytics', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (usageResponse.ok) {
        const usage = await usageResponse.json();
        setUsageData(usage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [adminToken, days]);

  // Fetch on mount and when days change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#991b1b' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Calculate daily average
  const dailyAverage = data.analytics.length
    ? data.totals.totalCost / data.analytics.length
    : 0;

  // Find most expensive day
  const mostExpensiveDay = data.analytics.reduce(
    (max, day) => (day.totalCost > max.totalCost ? day : max),
    data.analytics[0] || { totalCost: 0, date: 'N/A' }
  );

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 1.25rem)',
      }}
    >
      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb',
        }}
      >
        <button
          onClick={() => setActiveTab('costs')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'costs' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'costs' ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === 'costs' ? 'bold' : 'normal',
            cursor: 'pointer',
            marginBottom: '-2px',
            fontSize: '1rem',
          }}
        >
          💰 Costs
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'usage' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'usage' ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === 'usage' ? 'bold' : 'normal',
            cursor: 'pointer',
            marginBottom: '-2px',
            fontSize: '1rem',
          }}
        >
          📊 Usage
        </button>
      </div>

      {/* Usage Tab Content */}
      {activeTab === 'usage' && usageData && (
        <>
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.75rem 1rem',
              background: '#f9fafb',
              borderRadius: '6px',
              borderLeft: '3px solid #3b82f6',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#4b5563',
              }}
            >
              📈 <strong>All-time totals</strong> — These metrics show
              cumulative counts since launch
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                background: 'white',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🐈‍⬛</div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                }}
              >
                {usageData.charactersCreated}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                }}
              >
                Characters Created
              </div>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📸</div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                {usageData.photosUploaded}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                }}
              >
                With Photo
              </div>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                {usageData.hallOfFameViews}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                }}
              >
                Hall of Fame Views
              </div>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📑</div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                {usageData.pdfDownloads}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                }}
              >
                PDF Downloads
              </div>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📤</div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                {usageData.shareButtonClicks}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                }}
              >
                Share Button Clicks
              </div>
            </div>
          </div>
        </>
      )}

      {/* Costs Tab Content */}
      {activeTab === 'costs' && (
        <>
          {/* Pricing Info Banner */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                fontWeight: '600',
                marginBottom: '0.5rem',
              }}
            >
              💰 Pricing Assumptions (as of January 2026)
            </div>
            <div
              style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <strong>Claude Sonnet 4.5</strong> (currently in use)
                <br />
                Input: $3.00/M tokens
                <br />
                Output: $15.00/M tokens
              </div>
              <div>
                <strong>Claude Haiku 4.5</strong> (for comparison)
                <br />
                Input: $1.00/M tokens
                <br />
                Output: $5.00/M tokens
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Verify current pricing at{' '}
                <a
                  href="https://www.anthropic.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#2563eb', textDecoration: 'underline' }}
                >
                  anthropic.com/pricing
                </a>
              </div>
            </div>
          </div>

          {/* Time Range Selector */}
          <div style={{ marginBottom: '2rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
              }}
            >
              Time Range:
            </label>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              {[
                { value: 7, label: '7 days' },
                { value: 30, label: '30 days' },
                { value: 365, label: '1 year' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDays(option.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: days === option.value ? '#3b82f6' : '#e5e7eb',
                    color: days === option.value ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: '1 1 auto',
                    minWidth: '80px',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                background: 'white',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Total Cost ({days} days)
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                }}
              >
                {formatCurrency(data.totals.totalCost)}
              </div>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Daily Average
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                {formatCurrency(dailyAverage)}
              </div>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Total API Calls
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                {formatNumber(data.totals.totalCalls)}
              </div>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Most Expensive Day
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                {formatCurrency(mostExpensiveDay.totalCost)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {mostExpensiveDay.date}
              </div>
            </div>
          </div>

          {/* Token Usage */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
              }}
            >
              Token Usage
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Input Tokens
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                  }}
                >
                  {formatNumber(data.totals.totalInputTokens)}
                </div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Output Tokens
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                  }}
                >
                  {formatNumber(data.totals.totalOutputTokens)}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
              }}
            >
              Daily Breakdown
            </h2>
            <div
              style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                      Date
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                      Calls
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                      Input Tokens
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                      Output Tokens
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.analytics
                    .slice()
                    .reverse()
                    .map((day) => (
                      <tr
                        key={day.date}
                        style={{ borderBottom: '1px solid #f3f4f6' }}
                      >
                        <td style={{ padding: '0.75rem', color: '#1f2937' }}>
                          {day.date}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'right',
                            color: '#1f2937',
                          }}
                        >
                          {day.totalCalls}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'right',
                            color: '#1f2937',
                          }}
                        >
                          {formatNumber(day.totalInputTokens)}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'right',
                            color: '#1f2937',
                          }}
                        >
                          {formatNumber(day.totalOutputTokens)}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#1f2937',
                          }}
                        >
                          {formatCurrency(day.totalCost)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
