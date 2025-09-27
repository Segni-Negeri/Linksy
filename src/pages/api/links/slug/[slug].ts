import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  if (req.method === 'GET') {
    try {
      const supabaseAdmin = createAdminClient();
      
      // Get public link with tasks (no auth required)
      const { data: link, error } = await supabaseAdmin
        .from('links')
        .select('id, slug, destination, title, logo_url, brand_color, created_at, tasks(*)')
        .eq('slug', slug)
        .eq('is_deleted', false)
        .single();

      if (error || !link) {
        return res.status(404).json({ error: 'Link not found' });
      }

      return res.status(200).json(link);
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).end('Method Not Allowed');
}
