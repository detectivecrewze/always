import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { isKVConfigured, listGifts, getGift, putGift } from '@/lib/kv';
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

// GET /api/gifts — list all gifts
export async function GET(request) {
  if (!await verifySession(request)) return unauthorized();

  if (isKVConfigured()) {
    const slugs = await listGifts();
    const gifts = await Promise.all(slugs.map(async (slug) => {
      const g = await getGift(slug);
      return g ? { slug, recipient: g.recipient, sender: g.sender, createdAt: g.createdAt, theme: g.theme } : null;
    }));
    return NextResponse.json(gifts.filter(Boolean));
  }

  // Local fallback
  const gifts = readLocalGifts();
  return NextResponse.json(gifts.map((g) => ({
    slug: g.slug,
    recipient: g.recipient,
    sender: g.sender,
    createdAt: g.createdAt,
    theme: g.theme,
  })));
}

// POST /api/gifts — create new gift
export async function POST(request) {
  if (!await verifySession(request)) return unauthorized();

  const data = await request.json();
  if (!data.slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

  if (isKVConfigured()) {
    await putGift(data.slug, data);
  } else {
    const gifts = readLocalGifts();
    const existing = gifts.findIndex((g) => g.slug === data.slug);
    if (existing >= 0) {
      gifts[existing] = data;
    } else {
      gifts.push(data);
    }
    writeLocalGifts(gifts);
  }

  return NextResponse.json({ ok: true, slug: data.slug });
}
