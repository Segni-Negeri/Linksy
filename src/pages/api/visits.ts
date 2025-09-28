import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../lib/supabaseAdmin';
import { validateVisit } from '../../lib/validators';
import { rateLimit, getClientIP } from '../../lib/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
      
      const { link_id } = req.body || {};
      const validation = validateVisit({ link_id });
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
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
