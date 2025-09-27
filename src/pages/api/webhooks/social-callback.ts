import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const supabaseAdmin = createAdminClient();
      
      // Extract webhook payload (format depends on platform)
      const { visit_id, task_id, status = 'success', meta = {} } = req.body || {};
      
      if (!visit_id || !task_id) {
        return res.status(400).json({ error: 'Missing visit_id or task_id' });
      }

      // Create completion via admin client
      const { data, error } = await supabaseAdmin
        .from('completions')
        .insert({
          visit_id,
          task_id,
          method: 'webhook',
          status,
          meta
        })
        .select('id')
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ id: data.id });
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
