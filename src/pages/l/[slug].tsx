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
                <p style={{ margin: '0 0 12px 0', color: '#6b7280' }}>
                  Type: {task.type} {task.target && `• Target: ${task.target}`}
                </p>
                <button 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: completedTasks.has(task.id) ? '#10b981' : (link.brand_color || '#111827'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: completedTasks.has(task.id) ? 'default' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  disabled={completedTasks.has(task.id)}
                  onClick={async () => {
                    if (!visitId) {
                      alert('Visit not logged yet, please wait...');
                      return;
                    }
                    
                    try {
                      // Simulate verification for dev
                      const response = await fetch(`/api/verify/${task.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          visit_id: visitId,
                          method: 'redirect_check',
                          status: 'success'
                        })
                      });
                      
                      if (response.ok) {
                        setCompletedTasks(prev => new Set([...prev, task.id]));
                        alert(`✅ Task "${task.label}" completed successfully!`);
                      } else {
                        const error = await response.json();
                        alert(`❌ Failed to verify task: ${error.error}`);
                      }
                    } catch (err) {
                      alert(`❌ Error: ${err}`);
                    }
                  }}
                >
                  {completedTasks.has(task.id) ? '✅ Completed' : 'I Completed This Task'}
                </button>
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
        
        if (allRequiredCompleted) {
          return (
            <div style={{ 
              textAlign: 'center', 
              padding: '24px', 
              backgroundColor: '#d1fae5', 
              borderRadius: '8px',
              border: '2px solid #10b981'
            }}>
              <h2 style={{ color: '#065f46', margin: '0 0 16px 0' }}>🎉 All Tasks Completed!</h2>
              <p style={{ margin: '0 0 20px 0', color: '#065f46' }}>
                You've successfully completed all required tasks.
              </p>
              <a 
                href={link.destination} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                🔗 Visit Destination
              </a>
            </div>
          );
        }
        
        return (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              Complete all required tasks to unlock the destination link.
            </p>
            {requiredTasks.length > 0 && (
              <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
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
