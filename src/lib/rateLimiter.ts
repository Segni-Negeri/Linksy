// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 20,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  // Clean up expired entries
  for (const [k, v] of requests.entries()) {
    if (now > v.resetTime) {
      requests.delete(k);
    }
  }
  
  const current = requests.get(key);
  
  if (!current || now > current.resetTime) {
    // First request or window expired
    requests.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  
  if (current.count >= limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  // Increment counter
  current.count++;
  requests.set(key, current);
  
  return { 
    allowed: true, 
    remaining: limit - current.count, 
    resetTime: current.resetTime 
  };
}

export function getClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}
