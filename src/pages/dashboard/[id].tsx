import { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { Button } from '../../components/ui/Button';
import { TaskList } from '../../components/TaskList';
import { AnalyticsPanel } from '../../components/AnalyticsPanel';
import { supabase } from '../../lib/supabaseClient';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

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
    } else if (!loading && !user) {
      // Redirect to home if not authenticated
      window.location.href = '/';
    }
  }, [user, linkId, loading]);

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
      <DashboardLayout title="Edit Link">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Edit Link">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Please sign in to edit links.</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!link) {
    return (
      <DashboardLayout title="Edit Link">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Link not found.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Link">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-slate-900 mb-2">Edit Link</h2>
          <p className="text-slate-600">
            Edit your link settings and manage tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Link Settings */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-6">Link Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">linksy.com/l/</span>
                  <code className="bg-slate-100 px-3 py-1 rounded text-sm font-mono">
                    {link.slug}
                  </code>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Slug cannot be changed after creation
                </p>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="My Awesome Link"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-2">
                  Destination URL
                </label>
                <input
                  type="url"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="brandColor" className="block text-sm font-medium text-slate-700 mb-2">
                  Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="brandColor"
                    name="brandColor"
                    value={formData.brandColor}
                    onChange={handleChange}
                    className="w-12 h-10 border border-slate-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brandColor}
                    onChange={handleChange}
                    name="brandColor"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                  {success}
                </div>
              )}

              <Button onClick={handleSave} disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <TaskList 
              linkId={linkId}
              tasks={link.tasks}
              onTaskAdded={(task) => setLink(prev => prev ? { ...prev, tasks: [...prev.tasks, task] } : null)}
              onTaskUpdated={(updatedTask) => setLink(prev => prev ? { 
                ...prev, 
                tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
              } : null)}
              onTaskDeleted={(taskId) => setLink(prev => prev ? { 
                ...prev, 
                tasks: prev.tasks.filter(t => t.id !== taskId)
              } : null)}
            />

            <div className="mt-8 p-6 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-medium text-slate-900 mb-3">Preview</h3>
              <p className="text-sm text-slate-600 mb-4">
                Public URL: <a href={`/l/${link.slug}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  linksy.com/l/{link.slug}
                </a>
              </p>
              <Button 
                variant="outline"
                onClick={() => window.open(`/l/${link.slug}`, '_blank')}
                className="w-full"
              >
                View Public Page
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-12">
          <AnalyticsPanel linkId={linkId} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export async function getServerSideProps({ params }: { params: { id: string } }) {
  return {
    props: {
      linkId: params.id
    }
  };
}
