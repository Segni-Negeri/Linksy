import type { NextApiRequest, NextApiResponse } from 'next';

import { supabase } from '../../../lib/supabaseClient';
import { getUserFromReq } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const { slug, destination, title, logoUrl, brandColor } = req.body || {};
      if (!slug || !destination) {
        return res.status(400).json({ error: 'Missing required fields: slug, destination' });
      }

      const { data, error } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          slug,
          destination,
          title: title ?? null,
          logo_url: logoUrl ?? null,
          brand_color: brandColor ?? null,
        })
        .select('id, slug')
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ id: data.id, slug: data.slug });
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'GET') {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('links')
      .select('id, slug, title, destination, brand_color, logo_url, created_at')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data ?? []);
  }

  res.setHeader('Allow', 'POST, GET');
  return res.status(405).end('Method Not Allowed');
}




