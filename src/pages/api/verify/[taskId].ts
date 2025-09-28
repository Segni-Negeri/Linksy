import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../lib/supabaseAdmin';
import { validateCompletion } from '../../../lib/validators';
import { rateLimit, getClientIP } from '../../../lib/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { taskId } = req.query;
  
  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

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
      
      const { visit_id, method = 'redirect_check', status = 'pending', meta = {} } = req.body || {};
      const validation = validateCompletion({ visit_id, status });
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
      }

      const supabaseAdmin = createAdminClient();

      const { data, error } = await supabaseAdmin
        .from('completions')
        .insert({
          visit_id,
          task_id: taskId,
          method,
          status,
          meta
        })
        .select('id, status')
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ id: data.id, status: data.status });
    } catch (e: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
