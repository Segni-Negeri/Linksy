import { useState, useEffect } from 'react'
import { useUser } from '../../hooks/useUser'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Modal from '../../components/ui/Modal'
import { useRouter } from 'next/router'
import { DashboardLayout } from '../../components/layout/DashboardLayout'

export default function CreateLink() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    destination: '',
    brandColor: '#111827',
    logoUrl: ''
  });
  type TaskType = 'telegram' | 'instagram' | 'youtube' | 'discord'
  interface ActiveTask { type: TaskType; label: string; link: string }
  const taskDefaults: Record<TaskType, { name: string; defaultLabel: string; linkPlaceholder: string }> = {
    telegram: { name: 'Telegram Join', defaultLabel: 'Join our Telegram', linkPlaceholder: 'Telegram Join URL' },
    instagram: { name: 'Instagram Follow', defaultLabel: 'Follow us on Instagram', linkPlaceholder: 'Instagram profile URL' },
    youtube: { name: 'YouTube Subscribe', defaultLabel: 'Subscribe to our YouTube', linkPlaceholder: 'YouTube channel URL' },
    discord: { name: 'Discord Join', defaultLabel: 'Join our Discord', linkPlaceholder: 'Discord invite URL' },
  }
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to home if not authenticated
      window.location.href = '/';
    }
  }, [user, loading]);

  // Prefill destination from query param if present
  useEffect(() => {
    const q = router.query?.destination as string | undefined
    if (q && !formData.destination) {
      setFormData(prev => ({ ...prev, destination: q }))
    }
  }, [router.query])

  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

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
        body: JSON.stringify({
          slug: formData.slug,
          title: formData.title,
          destination: formData.destination,
          brandColor: formData.brandColor,
          logoUrl: formData.logoUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        const linkId: string = data.id
        const slug: string = data.slug

        // Create tasks in parallel
        if (activeTasks.length > 0) {
          await Promise.all(
            activeTasks.map(t =>
              fetch(`/api/links/${linkId}/tasks`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  type: t.type,
                  label: t.label,
                  target: t.link,
                  required: true
                })
              })
            )
          )
        }

        const url = `${window.location.origin}/l/${slug}`
        setShareUrl(url)
        setShareOpen(true)
        toast.success('Your link is ready!')
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

  const isTaskActive = (type: TaskType) => activeTasks.some(t => t.type === type)

  const toggleTask = (type: TaskType, checked: boolean) => {
    setActiveTasks(prev => {
      if (checked) {
        if (prev.some(t => t.type === type)) return prev
        const def = taskDefaults[type]
        return [...prev, { type, label: def.defaultLabel, link: '' }]
      }
      return prev.filter(t => t.type !== type)
    })
  }

  const updateTaskField = (type: TaskType, field: 'label' | 'link', value: string) => {
    setActiveTasks(prev => prev.map(t => t.type === type ? { ...t, [field]: value } : t))
  }

  if (loading) {
    return (
      <DashboardLayout title="Create New Link">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Create New Link">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Please sign in to create a link.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create New Link">
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
                      {isSubmitting ? 'Generating...' : 'Generate Link'}
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
                  {/* Telegram */}
                  <div className="p-3 border border-slate-200 rounded-md">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={isTaskActive('telegram')}
                        onChange={(e) => toggleTask('telegram', e.target.checked)}
                      />
                      <span className="font-medium text-sm">{taskDefaults.telegram.name}</span>
                    </label>
                    {isTaskActive('telegram') && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label htmlFor="task-telegram-label">Label</Label>
                          <Input
                            id="task-telegram-label"
                            value={activeTasks.find(t => t.type === 'telegram')?.label || ''}
                            onChange={(e) => updateTaskField('telegram', 'label', e.target.value)}
                            placeholder={taskDefaults.telegram.defaultLabel}
                          />
                        </div>
                        <div>
                          <Label htmlFor="task-telegram-link">Link</Label>
                          <Input
                            id="task-telegram-link"
                            value={activeTasks.find(t => t.type === 'telegram')?.link || ''}
                            onChange={(e) => updateTaskField('telegram', 'link', e.target.value)}
                            placeholder={taskDefaults.telegram.linkPlaceholder}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="p-3 border border-slate-200 rounded-md">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={isTaskActive('instagram')}
                        onChange={(e) => toggleTask('instagram', e.target.checked)}
                      />
                      <span className="font-medium text-sm">{taskDefaults.instagram.name}</span>
                    </label>
                    {isTaskActive('instagram') && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label htmlFor="task-instagram-label">Label</Label>
                          <Input
                            id="task-instagram-label"
                            value={activeTasks.find(t => t.type === 'instagram')?.label || ''}
                            onChange={(e) => updateTaskField('instagram', 'label', e.target.value)}
                            placeholder={taskDefaults.instagram.defaultLabel}
                          />
                        </div>
                        <div>
                          <Label htmlFor="task-instagram-link">Link</Label>
                          <Input
                            id="task-instagram-link"
                            value={activeTasks.find(t => t.type === 'instagram')?.link || ''}
                            onChange={(e) => updateTaskField('instagram', 'link', e.target.value)}
                            placeholder={taskDefaults.instagram.linkPlaceholder}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* YouTube */}
                  <div className="p-3 border border-slate-200 rounded-md">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={isTaskActive('youtube')}
                        onChange={(e) => toggleTask('youtube', e.target.checked)}
                      />
                      <span className="font-medium text-sm">{taskDefaults.youtube.name}</span>
                    </label>
                    {isTaskActive('youtube') && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label htmlFor="task-youtube-label">Label</Label>
                          <Input
                            id="task-youtube-label"
                            value={activeTasks.find(t => t.type === 'youtube')?.label || ''}
                            onChange={(e) => updateTaskField('youtube', 'label', e.target.value)}
                            placeholder={taskDefaults.youtube.defaultLabel}
                          />
                        </div>
                        <div>
                          <Label htmlFor="task-youtube-link">Link</Label>
                          <Input
                            id="task-youtube-link"
                            value={activeTasks.find(t => t.type === 'youtube')?.link || ''}
                            onChange={(e) => updateTaskField('youtube', 'link', e.target.value)}
                            placeholder={taskDefaults.youtube.linkPlaceholder}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Discord */}
                  <div className="p-3 border border-slate-200 rounded-md">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={isTaskActive('discord')}
                        onChange={(e) => toggleTask('discord', e.target.checked)}
                      />
                      <span className="font-medium text-sm">{taskDefaults.discord.name}</span>
                    </label>
                    {isTaskActive('discord') && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label htmlFor="task-discord-label">Label</Label>
                          <Input
                            id="task-discord-label"
                            value={activeTasks.find(t => t.type === 'discord')?.label || ''}
                            onChange={(e) => updateTaskField('discord', 'label', e.target.value)}
                            placeholder={taskDefaults.discord.defaultLabel}
                          />
                        </div>
                        <div>
                          <Label htmlFor="task-discord-link">Link</Label>
                          <Input
                            id="task-discord-link"
                            value={activeTasks.find(t => t.type === 'discord')?.link || ''}
                            onChange={(e) => updateTaskField('discord', 'link', e.target.value)}
                            placeholder={taskDefaults.discord.linkPlaceholder}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                      {activeTasks.length === 0 ? (
                        <div className="text-sm text-slate-500">No tasks selected yet.</div>
                      ) : (
                        activeTasks.map((t) => (
                          <div key={t.type} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                            <div className="w-4 h-4 border border-slate-300 rounded"></div>
                            <span className="text-sm">{t.label || taskDefaults[t.type].defaultLabel}</span>
                          </div>
                        ))
                      )}
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
      {/* Share modal */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title={"Here's Your Link"} size='sm' footer={(
        <Button onClick={() => setShareOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white">Close</Button>
      )}>
        <p className="text-sm text-slate-600 mb-3">Share this with your audience</p>
        <div className="flex items-center gap-2">
          <Input readOnly value={shareUrl} className="flex-1" />
          <Button
            type="button"
            variant="secondary"
            onClick={async () => { await navigator.clipboard.writeText(shareUrl); toast.success('Copied!') }}
          >
            Copy
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
