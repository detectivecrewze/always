import { NextResponse } from 'next/server';
import { saveWish, getWishesBySlug, deleteWish } from '@/lib/wishes';
import { validateSlotToken, claimSlotToken } from '@/lib/circleSlots';
import { getGiftBySlug } from '@/lib/getData';

// POST /api/circle-wishes/[slug]
export async function POST(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Kado tidak ditemukan' }, { status: 404 });
    }

    const gift = await getGiftBySlug(slug);
    if (!gift) {
      return NextResponse.json({ error: 'Kado tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const token = (body.token || '').trim();
    const name = (body.name || '').trim();
    const message = (body.message || '').trim();
    const photoUrl = (body.photoUrl || body.mediaUrl || '').trim();
    const mediaUrl = (body.mediaUrl || body.photoUrl || '').trim();
    const mediaType =
      body.mediaType ||
      (mediaUrl ? (/\.(mp4|webm|mov)(\?.*)?$/i.test(mediaUrl) ? 'video' : 'photo') : null);
    const createdAt = body.createdAt || new Date().toISOString();

    if (!token) {
      return NextResponse.json({ error: 'Token undangan wajib disertakan' }, { status: 403 });
    }

    // Validate slot token security
    const validation = await validateSlotToken(slug, token);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message || 'Token undangan tidak valid atau sudah digunakan' }, { status: 403 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Nama pengirim wajib diisi' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Pesan ucapan wajib diisi' }, { status: 400 });
    }
    if (name.length > 80) {
      return NextResponse.json({ error: 'Nama maksimal 80 karakter' }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: 'Pesan maksimal 1000 karakter' }, { status: 400 });
    }

    const wish = await saveWish(slug, {
      name,
      message,
      photoUrl,
      mediaUrl,
      mediaType,
      createdAt,
    });

    // Atomically claim the slot token
    try {
      await claimSlotToken(slug, token, name, wish.id);
    } catch (claimErr) {
      console.error('Error claiming slot token:', claimErr);
    }

    return NextResponse.json({ success: true, wish }, { status: 201 });
  } catch (error) {
    console.error('Error submitting circle wish:', error);
    return NextResponse.json({ error: 'Gagal mengirim ucapan' }, { status: 500 });
  }
}

// GET /api/circle-wishes/[slug]
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Kado tidak ditemukan' }, { status: 404 });
    }

    const gift = await getGiftBySlug(slug);
    if (!gift) {
      return NextResponse.json({ error: 'Kado tidak ditemukan' }, { status: 404 });
    }

    // If query contains token, validate that specific slot token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (token) {
      const validation = await validateSlotToken(slug, token);
      return NextResponse.json(validation);
    }

    const wishes = await getWishesBySlug(slug);
    return NextResponse.json({ success: true, wishes });
  } catch (error) {
    console.error('Error retrieving circle wishes:', error);
    return NextResponse.json({ error: 'Gagal mengambil daftar ucapan' }, { status: 500 });
  }
}

// DELETE /api/circle-wishes/[slug]?wishId=...
export async function DELETE(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Kado tidak ditemukan' }, { status: 404 });
    }

    const gift = await getGiftBySlug(slug);
    if (!gift) {
      return NextResponse.json({ error: 'Kado tidak ditemukan' }, { status: 404 });
    }

    const wishId = request.nextUrl ? request.nextUrl.searchParams.get('wishId') : new URL(request.url).searchParams.get('wishId');

    if (!wishId || !/^[a-zA-Z0-9_-]+$/.test(wishId)) {
      return NextResponse.json({ error: 'ID ucapan tidak valid' }, { status: 400 });
    }

    await deleteWish(slug, wishId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wish:', error);
    return NextResponse.json({ error: 'Gagal menghapus ucapan' }, { status: 500 });
  }
}

// PUT /api/circle-wishes/[slug] — Update an existing wish (edit name/message)
export async function PUT(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Kado tidak ditemukan' }, { status: 404 });
    }

    const gift = await getGiftBySlug(slug);
    if (!gift) {
      return NextResponse.json({ error: 'Kado tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const wishId = (body.id || '').trim();
    if (!wishId) {
      return NextResponse.json({ error: 'ID ucapan wajib disertakan' }, { status: 400 });
    }

    const name = (body.name || '').trim();
    const message = (body.message || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Nama pengirim wajib diisi' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Pesan ucapan wajib diisi' }, { status: 400 });
    }

    const photoUrl = (body.photoUrl || body.mediaUrl || '').trim();
    const mediaUrl = (body.mediaUrl || body.photoUrl || '').trim();
    const mediaType =
      body.mediaType ||
      (mediaUrl ? (/\.(mp4|webm|mov)(\?.*)?$/i.test(mediaUrl) ? 'video' : 'photo') : null);

    const updatedWish = await saveWish(slug, {
      id: wishId,
      name,
      message,
      photoUrl,
      mediaUrl,
      mediaType,
      createdAt: body.createdAt || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, wish: updatedWish });
  } catch (error) {
    console.error('Error updating wish:', error);
    return NextResponse.json({ error: 'Gagal memperbarui ucapan' }, { status: 500 });
  }
}

