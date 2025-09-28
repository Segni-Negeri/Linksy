import { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { Button } from '../../components/ui/Button';
import {supabase } from '../../lib/supabaseClient';

interface Link {
  id: string;
  slug: string;
  title: string;
  destination: string;
  brand_color: string | null;
  logo_url: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { user, loading } = useUser();
  const [links, setLinks] = useState<Link[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLinks();
    } else if (!loading) {
      // Redirect to home if not authenticated
      window.location.href = '/';
    }
  }, [user, loading]);

  const fetchLinks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch('/api/links', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      } else {
        console.error('Failed to fetch links');
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLinksLoading(false);
    }
  };

  if (loading || linksLoading) {
    return (
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }}>
        <h1>Dashboard</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }}>
        <h1>Dashboard</h1>
        <p>Please sign in to access your dashboard.</p>
        <p>Redirecting to home page...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Dashboard</h1>
        <Button onClick={() => window.location.href = '/dashboard/new'}>
          Create New Link
        </Button>
      </div>

      <div>
        <h2>Your Links ({links.length})</h2>
        
        {links.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            backgroundColor: '#f9fafb', 
            borderRadius: '8px',
            border: '2px dashed #d1d5db'
          }}>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
              You haven't created any links yet.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/new'}>
              Create Your First Link
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {links.map((link) => (
              <div 
                key={link.id}
                style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: link.brand_color || '#111827' }}>
                      {link.title || 'Untitled Link'}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                      Slug: <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{link.slug}</code>
                    </p>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                      Destination: <a href={link.destination} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                        {link.destination}
                      </a>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      variant="secondary"
                      onClick={() => window.open(`/l/${link.slug}`, '_blank')}
                    >
                      View
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => window.location.href = `/dashboard/${link.id}`}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>
                  Created: {new Date(link.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
