import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Abaikan path internal Next.js dan API
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/studio') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Cek apakah ini custom vercel domain (misal: kado-untuk-lisa.vercel.app)
  // dan bukan domain utama Anda.
  // Jika domain Anda loves-edition.vercel.app, ganti bagian ini sesuai domain utama Anda.
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'loves-edition.vercel.app';
  
  if (hostname !== mainDomain && hostname !== 'localhost:3000' && hostname.endsWith('.vercel.app')) {
    // Ambil nama depannya, misal "kado-untuk-lisa"
    const slug = hostname.replace('.vercel.app', '');
    
    // Jika user mengakses halaman depan (/), langsung rewrite (tampilkan) isi slug tersebut!
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/${slug}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
