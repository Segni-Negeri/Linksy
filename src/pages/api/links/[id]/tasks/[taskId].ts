import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../../../lib/supabaseAdmin';
import { getUserFromReq } from '../../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, taskId } = req.query;
  
  if (!id || typeof id !== 'string' || !taskId || typeof taskId !== 'string') {
    return res.status(400).json({ error: 'Invalid link ID or task ID' });
  }

  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseAdmin = createAdminClient();

  // Verify user owns the link
  const { data: link, error: linkError } = await supabaseAdmin
    .from('links')
    .select('user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .single();

  if (linkError || !link) {
    return res.status(404).json({ error: 'Link not found' });
  }

  if (req.method === 'PATCH') {
    try {
      const { type, target, label, required } = req.body || {};
      
      const updateData: any = {};
      if (type !== undefined) updateData.type = type;
      if (target !== undefined) updateData.target = target;
      if (label !== undefined) updateData.label = label;
      if (required !== undefined) updateData.required = required;

      const { data, error } = await supabaseAdmin
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('link_id', id)
        .select('id, type, target, label, required, created_at')
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.status(200).json(data);
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('link_id', id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(204).end();
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  return res.status(405).end('Method Not Allowed');
}
