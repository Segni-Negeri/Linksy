import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabaseClient';
import { getUserFromReq } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid link ID' });
  }

  if (req.method === 'GET') {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      // Get link with tasks
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .single();

      if (linkError || !link) {
        return res.status(404).json({ error: 'Link not found' });
      }

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('link_id', id);

      if (tasksError) {
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }

      return res.status(200).json({
        ...link,
        tasks: tasks || []
      });
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).end('Method Not Allowed');
}
