import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Guard protected routes (dashboards)
  if (pathname.startsWith('/patient') || pathname.startsWith('/doctor')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Enforce middleware only on dashboards
export const config = {
  matcher: ['/patient/:path*', '/doctor/:path*'],
};
