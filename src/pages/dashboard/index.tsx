import { useState, useEffect } from 'react'
import { useUser } from '../../hooks/useUser'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabaseClient'
import { motion } from 'framer-motion'
import { DashboardLayout } from '../../components/layout/DashboardLayout'

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
      <DashboardLayout title="Dashboard" showPlanInfo={true} linksCount={links.length}>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Dashboard" showPlanInfo={true} linksCount={links.length}>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Please sign in to access your dashboard.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" showPlanInfo={true} linksCount={links.length}>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-slate-900">Your Links</h2>
          <Button onClick={() => window.location.href = '/dashboard/new'} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Create New Link
          </Button>
        </div>

        {links.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No links yet</h3>
            <p className="text-slate-500 mb-6">Create your first branded link to get started.</p>
            <Button onClick={() => window.location.href = '/dashboard/new'} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Create Your First Link
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link, index) => (
              <motion.div 
                key={link.id} 
                className="bg-white rounded-lg border border-slate-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-slate-900 truncate">
                        {link.title || 'Untitled Link'}
                      </h3>
                      {link.brand_color && (
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: link.brand_color }} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">
                        Slug: <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{link.slug}</code>
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        Destination: <a href={link.destination} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                          {link.destination}
                        </a>
                      </p>
                      <p className="text-xs text-slate-400">
                        Created: {new Date(link.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => window.open(`/l/${link.slug}`, '_blank')}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = `/dashboard/${link.id}`}>
                      Edit
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
