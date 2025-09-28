import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../lib/supabaseAdmin'; // Correct import
import { getUserFromReq } from '../../../lib/auth';         // Correct import
import { validateUpdateLink } from '../../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Get the link ID from the URL

  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Create the Admin Client to act as the "manager"
  const supabaseAdmin = createAdminClient();

  // First, use the manager to securely fetch the link and check if this user owns it
  const { data: link } = await supabaseAdmin.from('links').select('user_id').eq('id', id).single();
  if (!link || link.user_id !== user.id) {
    return res.status(404).json({ error: 'Link not found or you do not have permission.' });
  }

  // If the request is a PATCH, update the link
  if (req.method === 'PATCH') {
    const validation = validateUpdateLink(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    const { title, destination, logoUrl, brandColor } = req.body;
    const { data: updatedLink, error } = await supabaseAdmin
      .from('links')
      .update({ title, destination, logo_url: logoUrl, brand_color: brandColor })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(updatedLink);
  }

  // If the request is a GET, return the link with its tasks
  if (req.method === 'GET') {
    const { data: fullLink, error } = await supabaseAdmin.from('links').select('*, tasks(*)').eq('id', id).single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(fullLink);
  }

  // If the request is a DELETE, soft-delete the link
  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('links')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  return res.status(405).end('Method Not Allowed');
}
