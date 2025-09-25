import { NextApiRequest } from 'next';
import { createAdminClient } from './supabaseAdmin';

export interface User {
  id: string;
  email?: string;
}

export async function getUserFromReq(req: NextApiRequest): Promise<User | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = createAdminClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}
