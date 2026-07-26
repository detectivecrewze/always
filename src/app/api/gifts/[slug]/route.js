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

import crypto from 'crypto';

function generateRandomEditKey() {
  return crypto.randomBytes(8).toString('hex'); // 16-character random hex token e.g. "f47a9b2c8e1d3056"
}

// Helper to check authorization
async function checkAuth(request, gift, slug) {
  const isAdmin = await verifySession(request);
  if (isAdmin) return { authorized: true, isAdmin: true };

  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key || !gift || !gift.editKey) return { authorized: false, isAdmin: false };

  if (key === gift.editKey) {
    return { authorized: true, isAdmin: false };
  }

  return { authorized: false, isAdmin: false };
}

// GET /api/gifts/[slug]
export async function GET(request, { params }) {
  const { slug } = await params;

  let gift = null;
  if (isKVConfigured()) {
    gift = await getGift(slug);
  } else {
    const gifts = readLocalGifts();
    gift = gifts.find((g) => g.slug === slug) || null;
  }

  const { authorized, isAdmin } = await checkAuth(request, gift, slug);
  if (!authorized || !gift) {
    if (!gift) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return unauthorized();
  }

  // Auto-generate a secure random editKey if gift doesn't have one yet or if it uses old predictable format
  if (!gift.editKey || gift.editKey.startsWith('edit-')) {
    gift.editKey = generateRandomEditKey();
    if (isKVConfigured()) {
      await putGift(slug, gift);
    }
  }

  return NextResponse.json({
    ...gift,
    _isSelfEdit: !isAdmin
  });
}

// PUT /api/gifts/[slug]
export async function PUT(request, { params }) {
  const oldSlug = (await params).slug;

  let existingGift = null;
  if (isKVConfigured()) {
    existingGift = await getGift(oldSlug);
  } else {
    const gifts = readLocalGifts();
    existingGift = gifts.find((g) => g.slug === oldSlug) || null;
  }

  const { authorized, isAdmin } = await checkAuth(request, existingGift, oldSlug);
  if (!authorized) return unauthorized();

  const data = await request.json();

  // If customer self-edit mode, enforce constraints
  let updatedData = { ...data };
  if (!isAdmin) {
    updatedData.slug = oldSlug; // Cannot rename slug
    if (existingGift && existingGift.editKey) {
      updatedData.editKey = existingGift.editKey;
    }
  }

  // Ensure a secure random editKey is preserved or assigned
  if (!updatedData.editKey || updatedData.editKey.startsWith('edit-')) {
    updatedData.editKey = (existingGift && existingGift.editKey && !existingGift.editKey.startsWith('edit-'))
      ? existingGift.editKey
      : generateRandomEditKey();
  }

  const newSlug = updatedData.slug || oldSlug;

  if (isKVConfigured()) {
    if (newSlug !== oldSlug) {
      await deleteGift(oldSlug);
    }
    await putGift(newSlug, { ...updatedData, slug: newSlug });
  } else {
    const gifts = readLocalGifts();
    const idx = gifts.findIndex((g) => g.slug === oldSlug);
    if (idx >= 0) {
      gifts[idx] = { ...updatedData, slug: newSlug };
    } else {
      gifts.push({ ...updatedData, slug: newSlug });
    }
    writeLocalGifts(gifts);
  }

  return NextResponse.json({ ok: true, newSlug, editKey: updatedData.editKey });
}

// DELETE /api/gifts/[slug]
export async function DELETE(request, { params }) {
  // ONLY Admin session can delete a gift
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
