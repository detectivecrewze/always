import { NextResponse } from 'next/server';
import { getWishesBySlug } from '@/lib/wishes';
import { createInitialSlots, saveOrder, findOrder } from '@/lib/circleSlots';

// GET /api/track/[orderId] — Public endpoint for coordinator status tracking
export async function GET(request, { params: paramsPromise }) {
  try {
    const { orderId } = await paramsPromise;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await findOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Auto-generate initial slots if circle order doesn't have them yet
    if (order.isCircle && (!Array.isArray(order.slots) || order.slots.length === 0)) {
      const quota = order.circleQuota || 8;
      order.slots = createInitialSlots(quota);
      order.circleQuota = quota;
      try {
        await saveOrder(order);
      } catch (saveErr) {
        console.error('Failed to auto-save initial slots in track GET:', saveErr);
      }
    }

    let wishes = [];
    if (order.slug) {
      try {
        const fetched = await getWishesBySlug(order.slug);
        if (Array.isArray(fetched)) {
          wishes = fetched;
        }
      } catch (err) {
        console.error(`Error fetching wishes for order slug ${order.slug}:`, err);
        wishes = [];
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        slug: order.slug,
        recipient: order.recipient,
        sender: order.sender,
        isCircle: Boolean(order.isCircle),
        status: order.status || 'pending',
        createdAt: order.createdAt,
        readyAt: order.readyAt || null,
        circleQuota: order.circleQuota || (Array.isArray(order.slots) ? order.slots.length : 8),
        slots: Array.isArray(order.slots) ? order.slots : [],
        wishesCount: wishes.length,
        circleWishes: wishes.map((w) => {
          const resolvedMedia = (w.mediaUrl || w.photoUrl || '').trim();
          const resolvedAudio = (w.audioUrl || (w.mediaType === 'audio' ? w.mediaUrl : '') || '').trim();
          let inferredMediaType = w.mediaType;
          if (!inferredMediaType) {
            if (resolvedAudio || /\.(mp3|m4a|wav|ogg|aac)(\?.*)?$/i.test(resolvedMedia)) {
              inferredMediaType = 'audio';
            } else if (resolvedMedia && /\.(mp4|webm|mov)(\?.*)?$/i.test(resolvedMedia)) {
              inferredMediaType = 'video';
            } else if (resolvedMedia) {
              inferredMediaType = 'photo';
            } else {
              inferredMediaType = null;
            }
          }

          return {
            id: w.id,
            name: w.name,
            message: w.message || '',
            photoUrl: w.photoUrl || (inferredMediaType !== 'audio' ? resolvedMedia : ''),
            mediaUrl: resolvedMedia,
            mediaType: inferredMediaType,
            audioUrl: resolvedAudio || (inferredMediaType === 'audio' ? resolvedMedia : ''),
            audioDuration: w.audioDuration || null,
            createdAt: w.createdAt,
          };
        }),
      },
    });
  } catch (err) {
    console.error('Error in GET /api/track/[orderId]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
