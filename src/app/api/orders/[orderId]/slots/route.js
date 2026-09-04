import { NextResponse } from 'next/server';
import { addSlotToOrder, resetSlotToken, findOrder } from '@/lib/circleSlots';

// POST /api/orders/[orderId]/slots — Coordinator slot management
export async function POST(request, { params: paramsPromise }) {
  try {
    const { orderId } = await paramsPromise;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await findOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (!order.isCircle) {
      return NextResponse.json({ error: 'Bukan pesanan Circle' }, { status: 400 });
    }

    const body = await request.json();
    const action = body?.action;

    if (action === 'add') {
      try {
        const result = await addSlotToOrder(order.orderId);
        return NextResponse.json({ success: true, slot: result.newSlot, slots: result.order.slots });
      } catch (err) {
        return NextResponse.json({ error: err.message || 'Gagal menambah slot' }, { status: 400 });
      }
    }

    if (action === 'reset') {
      const slotId = body?.slotId;
      if (!slotId) {
        return NextResponse.json({ error: 'slotId is required for reset action' }, { status: 400 });
      }

      try {
        const result = await resetSlotToken(order.orderId, slotId);
        return NextResponse.json({ success: true, slot: result.slot, slots: result.order.slots });
      } catch (err) {
        return NextResponse.json({ error: err.message || 'Gagal mereset token slot' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action. Supported: add, reset' }, { status: 400 });
  } catch (err) {
    console.error('Error managing order slots:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
