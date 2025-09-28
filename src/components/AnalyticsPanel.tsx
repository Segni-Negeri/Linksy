import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AnalyticsData {
  linkId: string;
  totalVisits: number;
  totalCompletions: number;
  conversionRate: number;
  chartData: Array<{
    date: string;
    visits: number;
  }>;
}

interface AnalyticsPanelProps {
  linkId: string;
}

export function AnalyticsPanel({ linkId }: AnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);

  useEffect(() => {
    fetchAnalytics();
  }, [linkId]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to view analytics');
        return;
      }

      const response = await fetch(`/api/analytics/${linkId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      setError('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Analytics</h3>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#fef2f2', 
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Analytics</h3>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Simple SVG chart for visits over time
  const maxVisits = Math.max(...analytics.chartData.map(d => d.visits), 1);
  const chartWidth = Math.min(400, windowWidth - 80); // Responsive width
  const chartHeight = 200;
  const padding = 40;

  const getX = (index: number) => padding + (index * (chartWidth - 2 * padding)) / (analytics.chartData.length - 1);
  const getY = (visits: number) => chartHeight - padding - ((visits / maxVisits) * (chartHeight - 2 * padding));

  const pathData = analytics.chartData
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.visits)}`)
    .join(' ');

  return (
    <div style={{ 
      padding: windowWidth < 640 ? '16px' : '24px', 
      backgroundColor: '#f9fafb', 
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ margin: '0 0 24px 0', fontSize: windowWidth < 640 ? '18px' : '20px' }}>Analytics</h3>
      
      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: windowWidth < 640 ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: windowWidth < 640 ? '20px' : '24px', fontWeight: 'bold', color: '#3b82f6' }}>
            {analytics.totalVisits}
          </div>
          <div style={{ fontSize: windowWidth < 640 ? '12px' : '14px', color: '#6b7280' }}>Total Visits</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: windowWidth < 640 ? '20px' : '24px', fontWeight: 'bold', color: '#10b981' }}>
            {analytics.totalCompletions}
          </div>
          <div style={{ fontSize: windowWidth < 640 ? '12px' : '14px', color: '#6b7280' }}>Completions</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: windowWidth < 640 ? '20px' : '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {analytics.conversionRate}%
          </div>
          <div style={{ fontSize: windowWidth < 640 ? '12px' : '14px', color: '#6b7280' }}>Conversion Rate</div>
        </div>
      </div>

      {/* Simple Chart */}
      <div>
        <h4 style={{ margin: '0 0 16px 0', fontSize: windowWidth < 640 ? '14px' : '16px' }}>Visits (Last 7 Days)</h4>
        <div style={{ 
          backgroundColor: 'white', 
          padding: windowWidth < 640 ? '8px' : '16px', 
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          overflow: 'auto'
        }}>
          <svg width={chartWidth} height={chartHeight} style={{ maxWidth: '100%', height: 'auto' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <g key={index}>
                <line
                  x1={padding}
                  y1={padding + (ratio * (chartHeight - 2 * padding))}
                  x2={chartWidth - padding}
                  y2={padding + (ratio * (chartHeight - 2 * padding))}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={padding + (ratio * (chartHeight - 2 * padding)) + 4}
                  fontSize={windowWidth < 640 ? "10" : "12"}
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {Math.round(maxVisits * (1 - ratio))}
                </text>
              </g>
            ))}
            
            {/* Chart line */}
            <path
              d={pathData}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {analytics.chartData.map((point, index) => (
              <circle
                key={index}
                cx={getX(index)}
                cy={getY(point.visits)}
                r="4"
                fill="#3b82f6"
              />
            ))}
            
            {/* X-axis labels */}
            {analytics.chartData.map((point, index) => (
              <text
                key={index}
                x={getX(index)}
                y={chartHeight - padding + 20}
                fontSize={windowWidth < 640 ? "10" : "12"}
                fill="#6b7280"
                textAnchor="middle"
              >
                {windowWidth < 640 
                  ? new Date(point.date).toLocaleDateString('en-US', { day: 'numeric' })
                  : new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
