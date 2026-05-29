import { verifyPassword, createSession, getSessionCookieHeader, verifySession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();
  if (!verifyPassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const token = createSession();
  const response = NextResponse.json({ ok: true });
  response.headers.set('Set-Cookie', getSessionCookieHeader(token));
  return response;
}

export async function DELETE(request) {
  const response = NextResponse.json({ ok: true });
  response.headers.set('Set-Cookie', getSessionCookieHeader(null, true));
  return response;
}
