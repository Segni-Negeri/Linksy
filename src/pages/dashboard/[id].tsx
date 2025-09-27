import { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabaseClient';

interface Link {
  id: string;
  slug: string;
  title: string;
  destination: string;
  brand_color: string | null;
  logo_url: string | null;
  created_at: string;
  tasks: Array<{
    id: string;
    type: string;
    target: string | null;
    label: string;
    required: boolean;
  }>;
}

interface Props {
  linkId: string;
}

export default function LinkEditor({ linkId }: Props) {
  const { user, loading } = useUser();
  const [link, setLink] = useState<Link | null>(null);
  const [linkLoading, setLinkLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    brandColor: '#111827',
    logoUrl: ''
  });

  useEffect(() => {
    if (user && linkId) {
      fetchLink();
    }
  }, [user, linkId]);

  const fetchLink = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/links/${linkId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLink(data);
        setFormData({
          title: data.title || '',
          destination: data.destination || '',
          brandColor: data.brand_color || '#111827',
          logoUrl: data.logo_url || ''
        });
      } else {
        setError('Failed to load link');
      }
    } catch (err) {
      setError('Error loading link');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Link updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update link');
      }
    } catch (err) {
      setError('An error occurred while updating the link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading || linkLoading) {
    return (
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }}>
        <h1>Link Editor</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }}>
        <h1>Link Editor</h1>
        <p>Please sign in to edit links.</p>
      </main>
    );
  }

  if (!link) {
    return (
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }}>
        <h1>Link Editor</h1>
        <p>Link not found.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1>Edit Link</h1>
        <p style={{ color: '#6b7280' }}>
          Edit your link settings and manage tasks.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Link Settings */}
        <div>
          <h2 style={{ marginBottom: '20px' }}>Link Settings</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Slug
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#6b7280' }}>linksy.com/l/</span>
                <code style={{ 
                  backgroundColor: '#f3f4f6', 
                  padding: '8px 12px', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {link.slug}
                </code>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                Slug cannot be changed after creation
              </p>
            </div>

            <div>
              <label htmlFor="title" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="My Awesome Link"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label htmlFor="destination" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Destination URL
              </label>
              <input
                type="url"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label htmlFor="brandColor" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Brand Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  id="brandColor"
                  name="brandColor"
                  value={formData.brandColor}
                  onChange={handleChange}
                  style={{
                    width: '50px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={handleChange}
                  name="brandColor"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="logoUrl" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Logo URL
              </label>
              <input
                type="url"
                id="logoUrl"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                color: '#166534'
              }}>
                {success}
              </div>
            )}

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Tasks Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Tasks ({link.tasks.length})</h2>
            <Button variant="secondary" onClick={() => alert('Add task functionality coming soon!')}>
              Add Task
            </Button>
          </div>

          {link.tasks.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
                No tasks added yet.
              </p>
              <Button variant="secondary" onClick={() => alert('Add task functionality coming soon!')}>
                Add Your First Task
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {link.tasks.map((task) => (
                <div 
                  key={task.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                        {task.label}
                      </h3>
                      <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                        Type: {task.type}
                      </p>
                      {task.target && (
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                          Target: {task.target}
                        </p>
                      )}
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                        Required: {task.required ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button 
                        variant="secondary"
                        onClick={() => alert('Edit task functionality coming soon!')}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => alert('Delete task functionality coming soon!')}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Preview</h3>
            <p style={{ margin: '0 0 12px 0', color: '#6b7280' }}>
              Public URL: <a href={`/l/${link.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                linksy.com/l/{link.slug}
              </a>
            </p>
            <Button 
              variant="secondary"
              onClick={() => window.open(`/l/${link.slug}`, '_blank')}
            >
              View Public Page
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export async function getServerSideProps({ params }: { params: { id: string } }) {
  return {
    props: {
      linkId: params.id
    }
  };
}
