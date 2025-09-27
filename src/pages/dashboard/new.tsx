import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabaseClient';

export default function CreateLink() {
  const { user, loading } = useUser();
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    destination: '',
    brandColor: '#111827',
    logoUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to create a link');
        return;
      }

      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/dashboard/${data.id}`;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create link');
      }
    } catch (err) {
      setError('An error occurred while creating the link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
        <h1>Create New Link</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
        <h1>Create New Link</h1>
        <p>Please sign in to create a link.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1>Create New Link</h1>
        <p style={{ color: '#6b7280' }}>
          Create a branded short link that gates your destination behind social tasks.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="slug" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Slug *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6b7280' }}>linksy.com/l/</span>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="my-link"
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Only letters, numbers, and hyphens allowed
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
            Destination URL *
          </label>
          <input
            type="url"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
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

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => window.location.href = '/dashboard'}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Link'}
          </Button>
        </div>
      </form>
    </main>
  );
}
