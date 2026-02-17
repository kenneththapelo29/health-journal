import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const protectedPaths = ['/api/auth/me'];
  
  if (protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set('x-user-id', payload.userId);
    reqHeaders.set('x-user-email', payload.email);
    
    return NextResponse.next({
      request: { headers: reqHeaders }
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/auth/me'
};