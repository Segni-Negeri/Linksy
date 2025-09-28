import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../lib/supabaseAdmin';
import { getUserFromReq } from '../../../lib/auth';
import { validateCreateLink } from '../../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const supabaseAdmin = createAdminClient();
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const validation = validateCreateLink(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    const { slug, destination, title, logoUrl, brandColor } = req.body;
    const { data, error } = await supabaseAdmin.from('links').insert({ user_id: user.id, slug, destination, title, logo_url: logoUrl, brand_color: brandColor }).select('id, slug').single();
    if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Slug is taken.' });
        return res.status(400).json({ error: error.message });
    }
    return res.status(201).json({ id: data.id, slug: data.slug });
  }

  if (req.method === 'GET') {
    // --- THIS IS THE CORRECTED GET HANDLER ---
    const supabaseAdmin = createAdminClient(); // Use the Admin Client
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Use the Admin Client to bypass RLS, then filter securely with .eq()
    const { data, error } = await supabaseAdmin
      .from('links')
      .select('id, slug, title, destination, brand_color, logo_url, created_at')
      .eq('user_id', user.id) // This is our security filter
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data ?? []);
  }

  res.setHeader('Allow', 'POST, GET');
  return res.status(405).end('Method Not Allowed');
}