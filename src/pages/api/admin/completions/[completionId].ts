import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { completionId } = req.query;
  
  if (!completionId || typeof completionId !== 'string') {
    return res.status(400).json({ error: 'Invalid completion ID' });
  }

  if (req.method === 'PATCH') {
    try {
      // Check for admin authorization (using service role key)
      const adminKey = req.headers.authorization?.replace('Bearer ', '');
      if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(401).json({ error: 'Admin access required' });
      }

      const { status } = req.body || {};
      
      if (!status || !['pending', 'success', 'failed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, success, or failed' });
      }

      const supabaseAdmin = createAdminClient();

      const { data, error } = await supabaseAdmin
        .from('completions')
        .update({ status })
        .eq('id', completionId)
        .select('id, status, method, created_at')
        .single();

      if (error) {
        return res.status(404).json({ error: 'Completion not found' });
      }

      return res.status(200).json(data);
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'PATCH');
  return res.status(405).end('Method Not Allowed');
}
