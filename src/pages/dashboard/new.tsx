import { useState, useEffect } from 'react'
import { useUser } from '../../hooks/useUser'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

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

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to home if not authenticated
      window.location.href = '/';
    }
  }, [user, loading]);

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
        toast.success('Link created successfully!');
        window.location.href = `/dashboard/${data.id}`;
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create link';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An error occurred while creating the link';
      setError(errorMessage);
      toast.error(errorMessage);
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
      <div className="min-h-screen bg-slate-50 flex">
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold">⛓️</div>
              <span className="font-semibold text-lg">Linksy</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold">⛓️</div>
              <span className="font-semibold text-lg">Linksy</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500">Please sign in to create a link.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold">⛓️</div>
            <span className="font-semibold text-lg">Linksy</span>
          </a>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">
            <span>📊</span>
            Dashboard
          </a>
          <a href="/dashboard/new" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md">
            <span>➕</span>
            Create Link
          </a>
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">
            <span>🔗</span>
            My Links
          </a>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">Create New Link</h1>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Left Column - Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Link Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="destination">Destination URL *</Label>
                        <Input
                          type="url"
                          id="destination"
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="My Awesome Link"
                        />
                      </div>

                      <div>
                        <Label htmlFor="slug">Slug *</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">linksy.com/l/</span>
                          <Input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="my-link"
                            required
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Only letters, numbers, and hyphens allowed
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="brandColor">Brand Color</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            id="brandColor"
                            name="brandColor"
                            value={formData.brandColor}
                            onChange={handleChange}
                            className="w-12 h-10 border border-slate-300 rounded-md cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={formData.brandColor}
                            onChange={handleChange}
                            name="brandColor"
                            placeholder="#111827"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          type="url"
                          id="logoUrl"
                          name="logoUrl"
                          value={formData.logoUrl}
                          onChange={handleChange}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => window.location.href = '/dashboard'}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isSubmitting ? 'Creating...' : 'Create Link'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Tasks Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-md">
                        <input type="checkbox" className="rounded" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Follow on Instagram</div>
                          <div className="text-xs text-slate-500">@yourusername</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-md">
                        <input type="checkbox" className="rounded" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Subscribe to YouTube</div>
                          <div className="text-xs text-slate-500">@yourchannel</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-md">
                        <input type="checkbox" className="rounded" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Join Telegram</div>
                          <div className="text-xs text-slate-500">@yourgroup</div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      + Add Task
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Live Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
                      {/* Preview Header */}
                      <div className="flex items-center gap-3">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-8 h-8 rounded" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                            <span className="text-xs">⛓️</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold" style={{ color: formData.brandColor }}>
                            {formData.title || 'Untitled Link'}
                          </h3>
                          <p className="text-xs text-slate-500">linksy.com/l/{formData.slug || 'my-link'}</p>
                        </div>
                      </div>

                      {/* Preview Tasks */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-700">Complete these tasks to unlock:</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                            <div className="w-4 h-4 border border-slate-300 rounded"></div>
                            <span className="text-sm">Follow on Instagram</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                            <div className="w-4 h-4 border border-slate-300 rounded"></div>
                            <span className="text-sm">Subscribe to YouTube</span>
                          </div>
                        </div>
                      </div>

                      {/* Preview Button */}
                      <div className="pt-4">
                        <div className="w-full h-10 bg-slate-200 rounded flex items-center justify-center text-sm text-slate-500">
                          Complete tasks to unlock
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
