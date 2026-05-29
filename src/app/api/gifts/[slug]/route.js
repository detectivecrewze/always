import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { isKVConfigured, getGift, putGift, deleteGift } from '@/lib/kv';
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

// GET /api/gifts/[slug]
export async function GET(request, { params }) {
  if (!await verifySession(request)) return unauthorized();
  const { slug } = await params;

  if (isKVConfigured()) {
    const gift = await getGift(slug);
    if (!gift) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(gift);
  }

  const gifts = readLocalGifts();
  const gift = gifts.find((g) => g.slug === slug);
  if (!gift) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(gift);
}

// PUT /api/gifts/[slug]
export async function PUT(request, { params }) {
  if (!await verifySession(request)) return unauthorized();
  const { slug } = await params;
  const data = await request.json();

  if (isKVConfigured()) {
    await putGift(slug, { ...data, slug });
  } else {
    const gifts = readLocalGifts();
    const idx = gifts.findIndex((g) => g.slug === slug);
    if (idx >= 0) {
      gifts[idx] = { ...data, slug };
    } else {
      gifts.push({ ...data, slug });
    }
    writeLocalGifts(gifts);
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/gifts/[slug]
export async function DELETE(request, { params }) {
  if (!await verifySession(request)) return unauthorized();
  const { slug } = await params;

  if (isKVConfigured()) {
    await deleteGift(slug);
  } else {
    const gifts = readLocalGifts();
    writeLocalGifts(gifts.filter((g) => g.slug !== slug));
  }

  return NextResponse.json({ ok: true });
}
