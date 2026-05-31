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
  const oldSlug = (await params).slug;
  const data = await request.json();
  const newSlug = data.slug || oldSlug;

  if (isKVConfigured()) {
    if (newSlug !== oldSlug) {
      await deleteGift(oldSlug);
    }
    await putGift(newSlug, { ...data, slug: newSlug });
  } else {
    const gifts = readLocalGifts();
    const idx = gifts.findIndex((g) => g.slug === oldSlug);
    if (idx >= 0) {
      gifts[idx] = { ...data, slug: newSlug };
    } else {
      gifts.push({ ...data, slug: newSlug });
    }
    writeLocalGifts(gifts);
  }

  return NextResponse.json({ ok: true, newSlug });
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
