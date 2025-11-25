import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Note: Firebase Auth doesn't work in Edge Runtime
  // Authentication should be handled in page components or API routes
  // This middleware is kept for future token-based auth implementation
  
  // For now, we'll let the pages handle authentication
  // You can add cookie/token checking here if needed
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
