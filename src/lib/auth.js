/**
 * Simple session-based auth for Studio.
 * Password is stored in STUDIO_PASSWORD env var.
 * Sessions are stored in memory (reset on redeploy — acceptable for workers).
 */

import { cookies } from 'next/headers';

const COOKIE_NAME = 'studio_session';

function getStaticToken() {
  const pwd = process.env.STUDIO_PASSWORD || '';
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(`studio:${pwd}`).toString('base64');
  }
  return typeof btoa !== 'undefined' ? btoa(`studio:${pwd}`) : 'invalid';
}

export function verifyPassword(password) {
  const expected = process.env.STUDIO_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export function createSession() {
  return getStaticToken();
}

export function verifySessionToken(token) {
  if (!token) return false;
  return token === getStaticToken();
}

export async function verifySession(request) {
  // From request headers (for API routes)
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const token = match ? match[1] : null;
  return verifySessionToken(token);
}

export function getSessionCookieHeader(token, clear = false) {
  if (clear) {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  }
  // 7 days
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}
