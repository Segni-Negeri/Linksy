import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../lib/supabaseAdmin';
import { validateCompletion } from '../../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { taskId } = req.query;
  
  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  if (req.method === 'POST') {
    try {
      const { visit_id, method = 'redirect_check', status = 'pending', meta = {} } = req.body || {};
      const validation = validateCompletion({ visit_id, status });
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
      }

      const supabaseAdmin = createAdminClient();

      const { data, error } = await supabaseAdmin
        .from('completions')
        .insert({
          visit_id,
          task_id: taskId,
          method,
          status,
          meta
        })
        .select('id, status')
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ id: data.id, status: data.status });
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
