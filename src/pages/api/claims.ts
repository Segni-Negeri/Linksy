import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { visit_id, task_id, proof_url, meta = {} } = req.body || {};

    if (!visit_id || !task_id) {
      return res.status(400).json({ error: 'Missing visit_id or task_id' });
    }

    const supabaseAdmin = createAdminClient();

    const payload = {
      visit_id,
      task_id,
      method: 'manual',
      status: 'pending',
      meta: { proof_url, ...meta }
    };

    const { data, error } = await supabaseAdmin
      .from('completions')
      .insert(payload)
      .select('id, status')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ id: data.id, status: data.status });
  } catch (e: any) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
