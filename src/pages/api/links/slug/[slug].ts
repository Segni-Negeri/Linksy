import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../../lib/supabaseAdmin';
import { rateLimit, getClientIP } from '../../../../lib/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  if (req.method === 'GET') {
    try {
      // Rate limiting: 20 requests per minute per IP
      const clientIP = getClientIP(req);
      const rateLimitResult = rateLimit(clientIP, 20, 60 * 1000);
      
      if (!rateLimitResult.allowed) {
        res.setHeader('X-RateLimit-Limit', '20');
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString());
        return res.status(429).json({ error: 'Too many requests' });
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', '20');
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString());
      
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
