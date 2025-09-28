import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromReq } from '../../../lib/auth'; 
import { createAdminClient } from '../../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { linkId } = req.query;
  
  if (!linkId || typeof linkId !== 'string') {
    return res.status(400).json({ error: 'Invalid link ID' });
  }

  if (req.method === 'GET') {
    try {
      const user = await getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

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

      return res.status(200).json({
        linkId,
        totalVisits: totalVisits || 0,
        totalCompletions: totalCompletions || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        chartData
      });

    } catch (e: any) {
      console.error("Analytics API Error:", e); // This makes the error loud!
      return res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).end('Method Not Allowed');
}