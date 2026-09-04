import { NextResponse } from 'next/server';
import { isKVConfigured, getOrder, putOrder } from '@/lib/kv';
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

export async function POST(request, { params: paramsPromise }) {
  try {
    const { orderId } = await paramsPromise;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    let order = null;
    let foundInKV = false;

    if (isKVConfigured()) {
      try {
        order = await getOrder(orderId);
        if (order) {
          foundInKV = true;
        }
      } catch (err) {
        console.error('Error fetching order from KV:', err);
      }
    }

    let localOrders = [];
    let localIdx = -1;
    if (!order) {
      localOrders = readLocalOrders();
      localIdx = localOrders.findIndex((o) => o.orderId === orderId);
      if (localIdx >= 0) {
        order = localOrders[localIdx];
      }
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'done') {
      return NextResponse.json({ error: 'Order is already marked as done' }, { status: 400 });
    }

    order.status = 'ready_to_craft';
    order.readyAt = new Date().toISOString();

    if (foundInKV) {
      await putOrder(orderId, order);
    } else {
      if (localOrders.length === 0) {
        localOrders = readLocalOrders();
      }
      const idx = localOrders.findIndex((o) => o.orderId === orderId);
      if (idx >= 0) {
        localOrders[idx] = order;
      } else {
        localOrders.push(order);
      }
      writeLocalOrders(localOrders);

      // If KV is configured but order was local, also sync to KV
      if (isKVConfigured()) {
        try {
          await putOrder(orderId, order);
        } catch (err) {
          console.error('Error syncing order to KV:', err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: 'ready_to_craft',
      readyAt: order.readyAt,
    });
  } catch (err) {
    console.error('Error in POST /api/orders/[orderId]/ready:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
