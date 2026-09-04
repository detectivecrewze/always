import { NextResponse } from 'next/server';
import {
  addSlotToOrder,
  resetSlotToken,
  deleteWishAndResetSlot,
  deleteUnusedSlot,
  updateSlotNickname,
  findOrder,
} from '@/lib/circleSlots';

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

    if (action === 'delete-wish') {
      const slotId = body?.slotId;
      const wishId = body?.wishId;
      if (!slotId) {
        return NextResponse.json({ error: 'slotId is required for delete-wish action' }, { status: 400 });
      }

      try {
        const result = await deleteWishAndResetSlot(order.orderId, slotId, wishId);
        return NextResponse.json({
          success: true,
          slot: result.slot,
          slots: result.order.slots,
          deletedWishId: result.deletedWishId,
        });
      } catch (err) {
        return NextResponse.json({ error: err.message || 'Gagal menghapus ucapan dan mereset slot' }, { status: 400 });
      }
    }

    if (action === 'delete-slot') {
      const slotId = body?.slotId;
      if (!slotId) {
        return NextResponse.json({ error: 'slotId is required for delete-slot action' }, { status: 400 });
      }

      try {
        const result = await deleteUnusedSlot(order.orderId, slotId);
        return NextResponse.json({
          success: true,
          slots: result.slots,
          circleQuota: result.order.circleQuota,
        });
      } catch (err) {
        return NextResponse.json({ error: err.message || 'Gagal menghapus slot' }, { status: 400 });
      }
    }

    if (action === 'update-nickname') {
      const slotId = body?.slotId;
      const nickname = body?.nickname;
      if (!slotId) {
        return NextResponse.json({ error: 'slotId is required for update-nickname action' }, { status: 400 });
      }

      try {
        const result = await updateSlotNickname(order.orderId, slotId, nickname);
        return NextResponse.json({
          success: true,
          slot: result.slot,
          slots: result.order.slots,
        });
      } catch (err) {
        return NextResponse.json({ error: err.message || 'Gagal memperbarui nama teman' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action. Supported: add, reset, delete-wish, delete-slot, update-nickname' }, { status: 400 });
  } catch (err) {
    console.error('Error managing order slots:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
