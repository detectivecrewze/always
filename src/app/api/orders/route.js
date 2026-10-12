import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { isKVConfigured, putOrder, listOrders, getOrder } from '@/lib/kv';
import { getWishesBySlug } from '@/lib/wishes';
import { createInitialSlots, saveOrder } from '@/lib/circleSlots';
import fs from 'fs';
import path from 'path';

function readLocalOrders() {
  const filePath = path.join(process.cwd(), 'data', 'orders.json');
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLocalOrders(orders) {
  const filePath = path.join(process.cwd(), 'data', 'orders.json');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
}

function normalizeHttpUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

// POST /api/orders — public, no auth needed
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.sender || !data.recipient || !data.slug) {
      return NextResponse.json({ error: 'sender, recipient, and slug are required' }, { status: 400 });
    }

    const invitationEnabled = data.invitationEnabled === true;
    if (invitationEnabled) {
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(data.invitationDate || '');
      const validStartTime = /^\d{2}:\d{2}$/.test(data.invitationStartTime || '');
      if (!validDate || !validStartTime || !String(data.invitationVenueName || '').trim()) {
        return NextResponse.json({ error: 'Invitation requires a valid date, start time, and venue name' }, { status: 400 });
      }
    }

    // VALIDATION: Only allow placing an order for a slug that exists
    const { getGiftBySlug } = await import('@/lib/getData');
    const giftExists = await getGiftBySlug(data.slug);
    if (!giftExists) {
      return NextResponse.json({ error: 'Cannot place order for unregistered slug' }, { status: 403 });
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const isCircle = Boolean(data.isCircle);
    const parsedQuota = parseInt(data.circleQuota, 10);
    const circleQuota = isCircle ? Math.min(20, Math.max(1, isNaN(parsedQuota) ? 8 : parsedQuota)) : null;
    const slots = isCircle ? createInitialSlots(circleQuota) : [];

    const order = {
      ...data,
      orderId,
      isCircle,
      invitationEnabled,
      invitationDate: invitationEnabled ? data.invitationDate : '',
      invitationStartTime: invitationEnabled ? data.invitationStartTime : '',
      invitationEndTime: invitationEnabled ? String(data.invitationEndTime || '') : '',
      invitationVenueName: invitationEnabled ? String(data.invitationVenueName || '').trim() : '',
      invitationAddress: invitationEnabled ? String(data.invitationAddress || '').trim() : '',
      invitationMapsUrl: invitationEnabled ? normalizeHttpUrl(data.invitationMapsUrl) : '',
      invitationDressCode: invitationEnabled ? String(data.invitationDressCode || '').trim() : '',
      invitationRundownNotes: invitationEnabled ? String(data.invitationRundownNotes || '').trim() : '',
      ...(isCircle && { circleQuota, slots }),
      status: data.isCircle === true ? 'collecting' : 'pending',
      createdAt: new Date().toISOString(),
    };

    await saveOrder(order);

    return NextResponse.json({ ok: true, success: true, orderId, order });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// GET /api/orders — protected, for studio dashboard
export async function GET(request) {
  if (!await verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let rawOrders = [];
  if (isKVConfigured()) {
    const ids = await listOrders();
    const fetched = await Promise.all(ids.map(async (id) => {
      const o = await getOrder(id);
      return o || null;
    }));
    rawOrders = fetched.filter(Boolean);
  } else {
    rawOrders = readLocalOrders();
  }

  const orders = await Promise.all(rawOrders.map(async (order) => {
    let circleWishesCount = 0;
    if (order.slug) {
      try {
        const wishes = await getWishesBySlug(order.slug);
        circleWishesCount = Array.isArray(wishes) ? wishes.length : 0;
      } catch (err) {
        console.error(`Error fetching wishes count for order slug ${order.slug}:`, err);
        circleWishesCount = 0;
      }
    }
    const slots = Array.isArray(order.slots) ? order.slots : [];
    const totalSlots = order.circleQuota || (slots.length > 0 ? slots.length : circleWishesCount);
    const usedSlots = slots.length > 0 ? slots.filter((s) => s.status === 'used').length : circleWishesCount;

    return {
      ...order,
      circleWishesCount,
      totalSlots,
      usedSlots,
    };
  }));

  return NextResponse.json(orders);
}

