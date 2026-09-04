import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { isKVConfigured, getOrder, putOrder, listOrders } from './kv.js';

const KV_BASE = () =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.KV_NAMESPACE_ID}`;

const kvHeaders = () => ({
  Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
  'Content-Type': 'application/json',
});

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

/**
 * Generate a cryptographically random, clean 8-char token
 */
export function generateSlotToken() {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Create initial slot array for a Circle order
 */
export function createInitialSlots(count = 8) {
  const safeCount = Math.min(20, Math.max(3, parseInt(count, 10) || 8));
  const slots = [];
  for (let i = 1; i <= safeCount; i++) {
    slots.push({
      id: `slot_${i}`,
      index: i,
      token: generateSlotToken(),
      status: 'pending', // 'pending' | 'used'
      claimedBy: null,
      wishId: null,
      createdAt: new Date().toISOString(),
      usedAt: null,
    });
  }
  return slots;
}

/**
 * Find an order by orderId or by slug (from KV or local filesystem)
 */
export async function findOrder(identifier) {
  if (!identifier) return null;

  // 1. Cloudflare KV
  if (isKVConfigured()) {
    try {
      // Check if identifier is direct orderId
      if (identifier.startsWith('ORD-')) {
        const order = await getOrder(identifier);
        if (order) return order;
      }

      // Check slug index
      const resSlug = await fetch(`${KV_BASE()}/values/${encodeURIComponent(`order_by_slug:${identifier}`)}`, {
        headers: kvHeaders(),
        cache: 'no-store',
      });
      if (resSlug.ok) {
        const orderId = await resSlug.text();
        if (orderId) {
          const o = await getOrder(orderId.trim());
          if (o) return o;
        }
      }

      // Fallback scan KV orders list
      const ids = await listOrders();
      for (const id of ids) {
        const o = await getOrder(id);
        if (o && (o.orderId === identifier || o.slug === identifier)) {
          return o;
        }
      }
    } catch (err) {
      console.error('Error finding order in KV:', err);
    }
  }

  // 2. Local Filesystem Fallback
  const localOrders = readLocalOrders();
  return localOrders.find((o) => o.orderId === identifier || o.slug === identifier) || null;
}

/**
 * Persist an order to KV and local filesystem
 */
export async function saveOrder(order) {
  if (!order || !order.orderId) {
    throw new Error('Order with valid orderId is required');
  }

  // 1. Cloudflare KV
  if (isKVConfigured()) {
    try {
      await putOrder(order.orderId, order);
      if (order.slug) {
        const res = await fetch(`${KV_BASE()}/values/${encodeURIComponent(`order_by_slug:${order.slug}`)}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
          body: order.orderId,
          cache: 'no-store',
        });
        if (!res.ok) {
          console.error('Failed to update order_by_slug in KV:', res.status);
        }
      }
    } catch (err) {
      console.error('Error persisting order to KV:', err);
    }
  }

  // 2. Local filesystem
  try {
    const orders = readLocalOrders();
    const idx = orders.findIndex((o) => o.orderId === order.orderId);
    if (idx >= 0) {
      orders[idx] = order;
    } else {
      orders.push(order);
    }
    writeLocalOrders(orders);
  } catch (err) {
    console.error('Error persisting order to local filesystem:', err);
  }

  return order;
}

/**
 * Validate a slot token for a given slug
 */
export async function validateSlotToken(slug, token) {
  if (!slug || !token) {
    return { valid: false, reason: 'missing_parameters', message: 'Tautan memerlukan link undangan yang valid.' };
  }

  const order = await findOrder(slug);
  if (!order) {
    return { valid: false, reason: 'order_not_found', message: 'Kado tidak ditemukan.' };
  }

  if (!order.isCircle) {
    return { valid: false, reason: 'not_circle_order', message: 'Kado ini bukan varian Circle Edition.' };
  }

  const slots = Array.isArray(order.slots) ? order.slots : [];
  const slot = slots.find((s) => s.token === token);

  if (!slot) {
    return { valid: false, reason: 'invalid_token', message: 'Tautan undangan tidak valid atau sudah kedaluwarsa.' };
  }

  if (slot.status === 'used') {
    return {
      valid: false,
      reason: 'already_used',
      status: 'used',
      claimedBy: slot.claimedBy || 'Teman kamu',
      usedAt: slot.usedAt,
      recipient: order.recipient,
      message: `Tautan ini sudah digunakan oleh ${slot.claimedBy || 'seorang teman'} untuk mengirimkan ucapan.`,
    };
  }

  return {
    valid: true,
    reason: 'valid',
    status: 'pending',
    slotId: slot.id,
    slotIndex: slot.index,
    recipient: order.recipient,
    sender: order.sender,
  };
}

/**
 * Claim a slot token when wish is submitted
 */
export async function claimSlotToken(slug, token, claimedBy, wishId) {
  const order = await findOrder(slug);
  if (!order || !order.isCircle) {
    throw new Error('Circle order not found for slug');
  }

  const slots = Array.isArray(order.slots) ? order.slots : [];
  const slotIndex = slots.findIndex((s) => s.token === token);

  if (slotIndex < 0) {
    throw new Error('Slot token not found');
  }

  if (slots[slotIndex].status === 'used') {
    throw new Error('Slot token has already been claimed');
  }

  slots[slotIndex].status = 'used';
  slots[slotIndex].claimedBy = (claimedBy || '').trim();
  slots[slotIndex].wishId = wishId || null;
  slots[slotIndex].usedAt = new Date().toISOString();

  order.slots = slots;
  await saveOrder(order);

  return slots[slotIndex];
}

/**
 * Add a new slot to an existing order (up to max 20)
 */
export async function addSlotToOrder(orderId) {
  const order = await findOrder(orderId);
  if (!order) {
    throw new Error('Pesanan tidak ditemukan');
  }

  const slots = Array.isArray(order.slots) ? order.slots : [];
  if (slots.length >= 20) {
    throw new Error('Maksimal kuota adalah 20 slot');
  }

  const nextIndex = slots.length + 1;
  const newSlot = {
    id: `slot_${Date.now()}_${nextIndex}`,
    index: nextIndex,
    token: generateSlotToken(),
    status: 'pending',
    claimedBy: null,
    wishId: null,
    createdAt: new Date().toISOString(),
    usedAt: null,
  };

  slots.push(newSlot);
  order.slots = slots;
  order.circleQuota = slots.length;

  await saveOrder(order);
  return { order, newSlot };
}

/**
 * Reset token of an unused slot (e.g. if sent to wrong friend)
 */
export async function resetSlotToken(orderId, slotId) {
  const order = await findOrder(orderId);
  if (!order) {
    throw new Error('Pesanan tidak ditemukan');
  }

  const slots = Array.isArray(order.slots) ? order.slots : [];
  const slot = slots.find((s) => s.id === slotId);

  if (!slot) {
    throw new Error('Slot tidak ditemukan');
  }

  if (slot.status === 'used') {
    throw new Error('Slot yang sudah terisi ucapan tidak dapat di-reset');
  }

  slot.token = generateSlotToken();
  slot.createdAt = new Date().toISOString();

  order.slots = slots;
  await saveOrder(order);

  return { order, slot };
}
