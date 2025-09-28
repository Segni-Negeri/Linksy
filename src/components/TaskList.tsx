import { useState } from 'react';
import {Button } from '../components/ui/Button'; // Alternative import if path alias is not set up
import { supabase } from '../lib/supabaseClient';

interface Task {
  id: string;
  type: string;
  target: string | null;
  label: string;
  required: boolean;
}

interface TaskListProps {
  linkId: string;
  tasks: Task[];
  onTaskAdded: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

export function TaskList({ linkId, tasks, onTaskAdded, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: 'manual',
    target: '',
    label: '',
    required: true
  });

  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    type: '',
    target: '',
    label: '',
    required: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // FIX #3: Use the imported supabase client, not window.supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to add tasks');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/links/${linkId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        onTaskAdded(data);
        setFormData({ type: 'manual', target: '', label: '', required: true });
        setShowAddForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add task');
      }
    } catch (err) {
      console.error("Error adding task:", err); // Best practice: Log the real error
      setError('An error occurred while adding the task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setEditFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
  };

  const startEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditFormData({
      type: task.type,
      target: task.target || '',
      label: task.label,
      required: task.required
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to edit tasks');
        return;
      }

      const response = await fetch(`/api/links/${linkId}/tasks/${editingTask}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const data = await response.json();
        onTaskUpdated(data);
        setEditingTask(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update task');
      }
    } catch (err) {
      setError('An error occurred while updating the task');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      // FIX #3 (Applied here too): Use the imported supabase client
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // NOTE: The API for deleting a task (e.g., `/api/links/[id]/tasks/[taskId]`)
      // has not been built by your assistant yet, so this will fail with a 404 error.
      // This is expected. We are only fixing the client-side code for now.
      const response = await fetch(`/api/links/${linkId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        onTaskDeleted(taskId);
      } else {
        alert('Failed to delete task (API endpoint may not exist yet)');
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert('Error deleting task');
    }
  };

  // Your JSX (the visual part) is perfectly fine and does not need to be changed.
  // I am including it here so you have the complete, functional file.
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Tasks ({tasks.length})</h2>
        <Button variant="secondary" onClick={() => setShowAddForm(!showAddForm)}>
          Add Task
        </Button>
      </div>

      {showAddForm && (
        <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Add New Task</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="type" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Task Type</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }}>
                <option value="manual">Manual Verification</option>
                <option value="youtube">YouTube Subscribe</option>
                <option value="instagram">Instagram Follow</option>
                <option value="join_telegram">Join Telegram</option>
              </select>
            </div>
            <div>
              <label htmlFor="label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Task Label *</label>
              <input type="text" id="label" name="label" value={formData.label} onChange={handleChange} required placeholder="Follow us on Instagram" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }} />
            </div>
            <div>
              <label htmlFor="target" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Target URL/Handle</label>
              <input type="text" id="target" name="target" value={formData.target} onChange={handleChange} placeholder="https://instagram.com/yourhandle or @yourhandle" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="required" name="required" checked={formData.required} onChange={handleChange} />
              <label htmlFor="required" style={{ fontWeight: '600' }}>Required task</label>
            </div>
            {error && (
              <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626' }}>{error}</div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Task'}</Button>
            </div>
          </form>
        </div>
      )}

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '2px dashed #d1d5db' }}>
          <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>No tasks added yet.</p>
          <Button variant="secondary" onClick={() => setShowAddForm(true)}>Add Your First Task</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => (
            <div key={task.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>
              {editingTask === task.id ? (
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0' }}>Edit Task</h3>
                  <div>
                    <label htmlFor={`edit-type-${task.id}`} style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Task Type</label>
                    <select id={`edit-type-${task.id}`} name="type" value={editFormData.type} onChange={handleEditChange} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }}>
                      <option value="manual">Manual Verification</option>
                      <option value="youtube">YouTube Subscribe</option>
                      <option value="instagram">Instagram Follow</option>
                      <option value="join_telegram">Join Telegram</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`edit-label-${task.id}`} style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Task Label *</label>
                    <input type="text" id={`edit-label-${task.id}`} name="label" value={editFormData.label} onChange={handleEditChange} required placeholder="Follow us on Instagram" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }} />
                  </div>
                  <div>
                    <label htmlFor={`edit-target-${task.id}`} style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Target URL/Handle</label>
                    <input type="text" id={`edit-target-${task.id}`} name="target" value={editFormData.target} onChange={handleEditChange} placeholder="https://instagram.com/yourhandle or @yourhandle" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id={`edit-required-${task.id}`} name="required" checked={editFormData.required} onChange={handleEditChange} />
                    <label htmlFor={`edit-required-${task.id}`} style={{ fontWeight: '600' }}>Required task</label>
                  </div>
                  {error && (
                    <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626' }}>{error}</div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button type="button" variant="secondary" onClick={() => setEditingTask(null)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                      {task.label}
                      {task.required && (<span style={{ marginLeft: '8px', padding: '2px 6px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>REQUIRED</span>)}
                    </h3>
                    <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>Type: {task.type}</p>
                    {task.target && (<p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>Target: {task.target}</p>)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" onClick={() => startEdit(task)}>Edit</Button>
                    <Button variant="secondary" onClick={() => handleDelete(task.id)}>Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}