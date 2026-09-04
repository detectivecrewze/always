import { NextResponse } from 'next/server';
import { findOrder, saveOrder } from '@/lib/circleSlots';

export async function POST(request, { params: paramsPromise }) {
  try {
    const { orderId } = await paramsPromise;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await findOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'done') {
      return NextResponse.json({ error: 'Order is already marked as done' }, { status: 400 });
    }

    order.status = 'ready_to_craft';
    order.readyAt = new Date().toISOString();

    await saveOrder(order);

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
