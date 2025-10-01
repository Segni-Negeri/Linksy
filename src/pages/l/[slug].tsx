import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { createAdminClient } from '../../lib/supabaseAdmin';
import { Card, CardContent } from '../../components/ui/Card';

interface LinkData {
  id: string;
  slug: string;
  destination: string;
  title: string;
  logo_url: string | null;
  brand_color: string | null;
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
  link: LinkData | null;
  error?: string;
}

export default function PublicLinkPage({ link, error }: Props) {
  const [visitId, setVisitId] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [verifyingTasks, setVerifyingTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (link?.id) {
      // Log visit on initial client load
      fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: link.id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setVisitId(data.id);
        }
      })
      .catch(err => console.error('Failed to log visit:', err));
    }
  }, [link?.id]);

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Link Not Found</h1>
            <p className="text-slate-600">The link you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to get social media icon
  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'instagram_follow':
        return (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        );
      case 'telegram_join':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
        );
      case 'youtube_subscribe':
        return (
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        );
      case 'discord_join':
        return (
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-slate-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        );
    }
  };

  // Handle automatic verification when "Open Link" is clicked
  const handleOpenLink = async (taskId: string, targetUrl: string) => {
    if (!visitId) {
      alert('Visit not logged yet, please wait...');
      return;
    }

    // Open the target URL in a new tab
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // Start verification process
    setVerifyingTasks(prev => new Set([...prev, taskId]));

    // Wait 5 seconds, then auto-complete
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/verify/${taskId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visit_id: visitId,
            method: 'time_based_verification',
            status: 'success'
          })
        });

        if (response.ok) {
          setCompletedTasks(prev => new Set([...prev, taskId]));
        } else {
          console.error('Failed to verify task:', await response.json());
        }
      } catch (err) {
        console.error('Error verifying task:', err);
      } finally {
        setVerifyingTasks(prev => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }
    }, 5000);
  };

  const requiredTasks = link.tasks.filter(task => task.required);
  const completedRequiredTasks = requiredTasks.filter(task => completedTasks.has(task.id));
  const allRequiredCompleted = requiredTasks.length > 0 && completedRequiredTasks.length === requiredTasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {link.logo_url && (
              <img 
                src={link.logo_url} 
                alt="Creator Avatar" 
                className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-emerald-200"
              />
            )}
            <h1 
              className="text-2xl font-bold mb-3 leading-tight"
              style={{ color: link.brand_color || '#065f46' }}
            >
              {link.title}
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Complete the tasks below to unlock the destination link.
            </p>
          </div>

          {/* Tasks */}
          {link.tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">No tasks required.</p>
              <a 
                href={link.destination} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Visit Destination
              </a>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {link.tasks.map((task) => (
                <div key={task.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-3">
                    {getSocialIcon(task.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">{task.label}</h3>
                      {task.target && (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleOpenLink(task.id, task.target!)}
                            disabled={verifyingTasks.has(task.id) || completedTasks.has(task.id)}
                            className={`text-sm font-medium transition-colors ${
                              verifyingTasks.has(task.id) || completedTasks.has(task.id)
                                ? 'text-slate-400 cursor-not-allowed'
                                : 'text-emerald-600 hover:text-emerald-700'
                            }`}
                          >
                            {verifyingTasks.has(task.id) ? 'Verifying...' : 'Open Link'}
                          </button>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`task-${task.id}`}
                              checked={completedTasks.has(task.id)}
                              disabled={true}
                              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                            />
                            <label htmlFor={`task-${task.id}`} className={`text-sm cursor-default ${
                              completedTasks.has(task.id) ? 'text-slate-500' : 'text-slate-700'
                            }`}>
                              {completedTasks.has(task.id) ? 'Completed' : 'I\'ve done this'}
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress and Unlock Button */}
          <div className="border-t border-slate-200 pt-6">
            <div className="text-center">
              <p className="text-slate-500 text-sm mb-4">
                {completedRequiredTasks.length}/{requiredTasks.length} tasks completed
              </p>
              <button
                disabled={!allRequiredCompleted}
                onClick={() => { window.location.href = link.destination }}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  allRequiredCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                {!allRequiredCompleted && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                )}
                {allRequiredCompleted ? 'Unlock Link' : 'Complete all tasks to unlock'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-400">Made with Linksy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const { slug } = params!;
    
    if (!slug || typeof slug !== 'string') {
      return { props: { link: null, error: 'Invalid slug' } };
    }

    const supabaseAdmin = createAdminClient();
    
    const { data: link, error } = await supabaseAdmin
      .from('links')
      .select('id, slug, destination, title, logo_url, brand_color, created_at, tasks(*)')
      .eq('slug', slug)
      .eq('is_deleted', false)
      .single();

    if (error || !link) {
      return { props: { link: null, error: 'Link not found' } };
    }

    return { props: { link } };
  } catch (error) {
    return { props: { link: null, error: 'Server error' } };
  }
};
