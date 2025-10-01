import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { createAdminClient } from '../../lib/supabaseAdmin';

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
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
        <h1>Link Not Found</h1>
        <p>The link you're looking for doesn't exist or has been removed.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        {link.logo_url && (
          <img 
            src={link.logo_url} 
            alt="Logo" 
            style={{ width: '80px', height: '80px', borderRadius: '8px', marginBottom: '16px' }}
          />
        )}
        <h1 style={{ color: link.brand_color || '#111827', marginBottom: '8px' }}>
          {link.title}
        </h1>
        <p>Complete the tasks below to unlock the destination link.</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2>Tasks to Complete:</h2>
        {link.tasks.length === 0 ? (
          <p>No tasks required. <a href={link.destination} target="_blank" rel="noopener noreferrer">Visit destination</a></p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {link.tasks.map((task) => (
              <li key={task.id} style={{ 
                padding: '16px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                marginBottom: '12px',
                backgroundColor: '#f9fafb'
              }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{task.label}</h3>
                {task.target && (
                  <div style={{ margin: '0 0 12px 0', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <a
                      href={task.target}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#10b981', fontWeight: 600 }}
                    >
                      Open Link
                    </a>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#374151' }}>
                      <input
                        type="checkbox"
                        checked={completedTasks.has(task.id)}
                        onChange={async (e) => {
                          if (!visitId) {
                            alert('Visit not logged yet, please wait...');
                            return;
                          }
                          try {
                            const response = await fetch(`/api/verify/${task.id}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                visit_id: visitId,
                                method: 'redirect_check',
                                status: e.target.checked ? 'success' : 'failed'
                              })
                            });
                            if (response.ok) {
                              setCompletedTasks(prev => {
                                const next = new Set(prev)
                                if (e.target.checked) next.add(task.id); else next.delete(task.id)
                                return next
                              })
                            } else {
                              const err = await response.json()
                              alert(`Verification failed: ${err.error}`)
                            }
                          } catch (err) {
                            alert(`Error: ${err}`)
                          }
                        }}
                      />
                      I've done this
                    </label>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Check if all required tasks are completed */}
      {(() => {
        const requiredTasks = link.tasks.filter(task => task.required);
        const completedRequiredTasks = requiredTasks.filter(task => completedTasks.has(task.id));
        const allRequiredCompleted = requiredTasks.length > 0 && completedRequiredTasks.length === requiredTasks.length;
        
        return (
          <div style={{ textAlign: 'center' }}>
            <button
              disabled={!allRequiredCompleted}
              onClick={() => { window.location.href = link.destination }}
              style={{
                padding: '12px 24px',
                backgroundColor: allRequiredCompleted ? '#10b981' : '#d1d5db',
                color: allRequiredCompleted ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: allRequiredCompleted ? 'pointer' : 'not-allowed'
              }}
            >
              {allRequiredCompleted ? 'Unlock Link' : 'Complete all tasks to unlock'}
            </button>
            {requiredTasks.length > 0 && (
              <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>
                Progress: {completedRequiredTasks.length}/{requiredTasks.length} required tasks completed
              </p>
            )}
          </div>
        );
      })()}
    </main>
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
