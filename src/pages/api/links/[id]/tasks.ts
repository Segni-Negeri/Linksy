import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../../lib/supabaseAdmin';
import { getUserFromReq } from '../../../../lib/auth';
import { validateCreateTask } from '../../../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid link ID' });
  }

  if (req.method === 'POST') {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const { type, target, label, required = true } = req.body || {};
      const validation = validateCreateTask({ type, target, label, required });
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
      }

      const supabaseAdmin = createAdminClient();
      
      // First verify the user owns this link
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

      // Insert the task
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .insert({
          link_id: id,
          type,
          target: target || null,
          label,
          required
        })
        .select('id, type, target, label, required, created_at')
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json(data);
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
