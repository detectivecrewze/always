import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { isKVConfigured, getGift, putGift } from '@/lib/kv';
import fs from 'fs';
import path from 'path';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function readLocalGifts() {
  const filePath = path.join(process.cwd(), 'data', 'gifts.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeLocalGifts(gifts) {
  const filePath = path.join(process.cwd(), 'data', 'gifts.json');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(gifts, null, 2));
}

// PATCH /api/gifts/[slug]/payment
// Body: { paymentStatus: 'paid' | 'partial' }
// Lightweight endpoint — only touches paymentStatus, leaves rest of gift data unchanged
export async function PATCH(request, { params }) {
  if (!await verifySession(request)) return unauthorized();

  const { slug } = await params;
  const { paymentStatus } = await request.json();

  if (!['paid', 'partial'].includes(paymentStatus)) {
    return NextResponse.json({ error: 'Invalid paymentStatus. Must be "paid" or "partial".' }, { status: 400 });
  }

  if (isKVConfigured()) {
    const gift = await getGift(slug);
    if (!gift) return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    await putGift(slug, { ...gift, paymentStatus });
  } else {
    const gifts = readLocalGifts();
    const idx = gifts.findIndex((g) => g.slug === slug);
    if (idx < 0) return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    gifts[idx] = { ...gifts[idx], paymentStatus };
    writeLocalGifts(gifts);
  }

  return NextResponse.json({ ok: true, slug, paymentStatus });
}
