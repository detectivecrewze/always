import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { isKVConfigured, putOrder, listOrders, getOrder } from '@/lib/kv';
import fs from 'fs';
import path from 'path';

function readLocalOrders() {
  const filePath = path.join(process.cwd(), 'data', 'orders.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeLocalOrders(orders) {
  const filePath = path.join(process.cwd(), 'data', 'orders.json');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
}

// POST /api/orders — public, no auth needed
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.sender || !data.recipient || !data.slug) {
      return NextResponse.json({ error: 'sender, recipient, and slug are required' }, { status: 400 });
    }

    // VALIDATION: Only allow placing an order for a slug that exists
    const { getGiftBySlug } = await import('@/lib/getData');
    const giftExists = await getGiftBySlug(data.slug);
    if (!giftExists) {
      return NextResponse.json({ error: 'Cannot place order for unregistered slug' }, { status: 403 });
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order = {
      ...data,
      orderId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (isKVConfigured()) {
      await putOrder(orderId, order);
    } else {
      const orders = readLocalOrders();
      orders.push(order);
      writeLocalOrders(orders);
    }

    return NextResponse.json({ ok: true, orderId });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// GET /api/orders — protected, for studio dashboard
export async function GET(request) {
  if (!await verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isKVConfigured()) {
    const ids = await listOrders();
    const orders = await Promise.all(ids.map(async (id) => {
      const o = await getOrder(id);
      return o || null;
    }));
    return NextResponse.json(orders.filter(Boolean));
  }

  const orders = readLocalOrders();
  return NextResponse.json(orders);
}
