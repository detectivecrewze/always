import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { isKVConfigured, getOrder, putOrder, deleteOrder } from '@/lib/kv';
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

// PUT /api/orders/:orderId — update order status
export async function PUT(request, { params: paramsPromise }) {
  if (!await verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const params = await paramsPromise;
  const { orderId } = params;
  const data = await request.json();

  if (isKVConfigured()) {
    const existing = await getOrder(orderId);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await putOrder(orderId, { ...existing, ...data });
  } else {
    const orders = readLocalOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx < 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    orders[idx] = { ...orders[idx], ...data };
    writeLocalOrders(orders);
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/orders/:orderId — delete order
export async function DELETE(request, { params: paramsPromise }) {
  if (!await verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const params = await paramsPromise;
  const { orderId } = params;

  if (isKVConfigured()) {
    await deleteOrder(orderId);
  } else {
    const orders = readLocalOrders();
    writeLocalOrders(orders.filter(o => o.orderId !== orderId));
  }

  return NextResponse.json({ ok: true });
}
