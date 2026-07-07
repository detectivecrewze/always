import { NextResponse } from 'next/server';
import { getDraft, putDraft, putGift } from '@/lib/kv';
import { generateGiftData } from '@/../lib/giftGenerator.mjs';

/**
 * POST /api/generate-gift
 *
 * Body (JSON):
 * {
 *   "slug": string,
 *   "orderId"?: string,
 *   "from": string,
 *   to: string,
 *   moment: "birthday" | "anniversary",
 *   nthYear?: number,
 *   theme?: string,
 *   metaphor?: string,
 *   tone?: string[],
 *   musicTitle?: string,
 *   musicArtist?: string,
 *   message?: string,
 *   photoCount?: number,
 *   preservePhotos?: boolean   // if true, keep existing uploaded photo URLs
 * }
 *
 * Response:
 * { ok: true, slug, previewUrl, editUrl }
 */
export async function POST(request) {
  try {
    const order = await request.json();

    if (!order.slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    // Optionally preserve existing uploaded photos
    let draftPhotos = [];
    if (order.preservePhotos !== false) {
      const existing = await getDraft(order.slug);
      draftPhotos = existing?.photos || [];
    }

    let orderPhotos = [];
    if (order.orderId) {
      const { getOrder } = await import('@/lib/kv');
      const orderData = await getOrder(order.orderId);
      orderPhotos = orderData?.photos || [];
    }

    // Generate all KV data from order
    const data = generateGiftData(order);

    // Merge existing photo URLs so we don't overwrite already-uploaded media
    if (orderPhotos.length > 0 || draftPhotos.length > 0) {
      data.photos = data.photos.map((p, i) => {
        let existingUrl = '';
        if (orderPhotos[i]) {
          existingUrl = typeof orderPhotos[i] === 'string' ? orderPhotos[i] : orderPhotos[i]?.url;
        } else if (draftPhotos[i]) {
          existingUrl = typeof draftPhotos[i] === 'string' ? draftPhotos[i] : draftPhotos[i]?.url;
        }
        return { ...p, url: existingUrl || p.url };
      });
    }

    // Save to KV
    await putDraft(order.slug, data);
    await putGift(order.slug, data);

    return NextResponse.json({
      ok: true,
      slug: order.slug,
      previewUrl: `/${order.slug}`,
      editUrl: `/studio/${order.slug}/edit`,
    });
  } catch (err) {
    console.error('[generate-gift] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
