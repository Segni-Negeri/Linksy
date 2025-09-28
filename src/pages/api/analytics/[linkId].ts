import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromReq } from '../../../lib/auth'; 
import { createAdminClient } from '../../../lib/supabaseAdmin';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { linkId } = req.query;
  
  if (!linkId || typeof linkId !== 'string') {
    return res.status(400).json({ error: 'Invalid link ID' });
  }

  if (req.method === 'GET') {
    try {
      const user = await getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      // Check cache first
      const cacheKey = `analytics_${linkId}_${user.id}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.status(200).json({
          ...cached.data,
          cached: true,
          cacheTimestamp: cached.timestamp
        });
      }

      const supabaseAdmin = createAdminClient();

      const { data: link, error: linkError } = await supabaseAdmin
        .from('links')
        .select('id, user_id')
        .eq('id', linkId)
        .eq('user_id', user.id)
        .single();

      if (linkError || !link) {
        return res.status(404).json({ error: 'Link not found' });
      }

      const { count: totalVisits, error: visitsError } = await supabaseAdmin
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('link_id', linkId);

      if (visitsError) throw new Error('Failed to fetch visits');

      // --- THIS IS THE CORRECTED QUERY FOR COMPLETIONS ---
      const { count: totalCompletions, error: completionsError } = await supabaseAdmin
        .from('completions')
        .select('id, visits!inner(link_id)', { count: 'exact', head: true })
        .eq('visits.link_id', linkId)
        .eq('status', 'success');

      if (completionsError) throw new Error('Failed to fetch completions');
      
      // The rest of your code for fetching recent visits and calculating data is good.
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentVisits, error: recentVisitsError } = await supabaseAdmin
        .from('visits')
        .select('created_at')
        .eq('link_id', linkId)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentVisitsError) throw new Error('Failed to fetch recent visits');

      const conversionRate = totalVisits && totalVisits > 0 ? ((totalCompletions || 0) / totalVisits) * 100 : 0;

      const visitsByDate: { [key: string]: number } = {};
      recentVisits?.forEach(visit => {
        const date = new Date(visit.created_at).toISOString().split('T')[0];
        visitsByDate[date] = (visitsByDate[date] || 0) + 1;
      });

      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        chartData.push({ date: dateStr, visits: visitsByDate[dateStr] || 0 });
      }

      const result = {
        linkId,
        totalVisits: totalVisits || 0,
        totalCompletions: totalCompletions || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        chartData
      };

      // Cache the result
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return res.status(200).json({
        ...result,
        cached: false,
        cacheTimestamp: Date.now()
      });

    } catch (e: any) {
      console.error("Analytics API Error:", e); // This makes the error loud!
      return res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).end('Method Not Allowed');
}