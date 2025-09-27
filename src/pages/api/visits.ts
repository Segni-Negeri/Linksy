import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { link_id } = req.body || {};
      
      if (!link_id) {
        return res.status(400).json({ error: 'Missing link_id' });
      }

      const supabaseAdmin = createAdminClient();
      
      // Get client IP and user agent
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const referer = req.headers.referer || null;

      const { data, error } = await supabaseAdmin
        .from('visits')
        .insert({
          link_id,
          ip: Array.isArray(ip) ? ip[0] : ip,
          user_agent: userAgent,
          referer
        })
        .select('id')
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ id: data.id });
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
