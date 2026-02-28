interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60000;
const MAX_REQUESTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(identifier: string): { allowed: boolean; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, resetTime: now + WINDOW_MS };
  }
  
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, resetTime: entry.resetTime };
  }
  
  entry.count++;
  return { allowed: true, resetTime: entry.resetTime };
}

export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, CLEANUP_INTERVAL);