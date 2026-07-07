/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           LOVES EDITION — Universal Gift Apply CLI          ║
 * ║  Usage: node applyOrder.mjs <order.json>                    ║
 * ║  Or:    node applyOrder.mjs --inline '{"slug":"...","..."}'  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Order JSON shape:
 * {
 *   "slug":        "auto-8592910",
 *   "orderId":     "ORD-MRAOOPNE",      // Optional: to pull existing uploaded photos
 *   "from":        "Nabil",
 *   "to":          "Lidyaa",
 *   "moment":      "birthday",          // "birthday" | "anniversary"
 *   "nthYear":     22,                  // age (birthday) or years (anniversary)
 *   "theme":       "blush-pink",
 *   "metaphor":    "flowers",           // "flowers" | "keepsakes" | "stars" | "ocean" | "seasons"
 *   "tone":        ["puitis","indoglish"],
 *   "musicTitle":  "Bergema sampai selamanya",
 *   "musicArtist": "Nadhif Basalamah",
 *   "message":     "...customer message...",
 *   "photoCount":  7
 * }
 */

import fs from 'fs';
import path from 'path';
import { generateGiftDataAi } from './lib/aiGenerator.mjs';
import { generateGiftData } from './lib/giftGenerator.mjs'; // fallback

// ─── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envStr.split('\n')) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
}

const accountId = env.CLOUDFLARE_ACCOUNT_ID;
const namespaceId = env.KV_NAMESPACE_ID;
const token = env.CLOUDFLARE_API_TOKEN;
process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
process.env.CLOUDFLARE_ACCOUNT_ID = accountId;
process.env.KV_NAMESPACE_ID = namespaceId;
process.env.CLOUDFLARE_API_TOKEN = token;

// ─── KV helpers ───────────────────────────────────────────────────────────────
async function cfGet(key) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function cfSet(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`KV PUT failed [${res.status}]: ${errText}`);
  }
  return true;
}

// ─── Parse order input ────────────────────────────────────────────────────────
function parseOrderInput() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('❌ Usage: node applyOrder.mjs <order.json>');
    console.error('         node applyOrder.mjs --inline \'{"slug":"..."}\'');
    process.exit(1);
  }

  if (args[0] === '--inline') {
    return JSON.parse(args[1]);
  }

  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const order = parseOrderInput();

  if (!order.slug) {
    console.error('❌ Order must have a "slug" field');
    process.exit(1);
  }

  // If there's an existing draft, merge existing photo URLs (preserve uploads)
  console.log(`\n📋 Processing order for: ${order.slug}`);
  console.log(`   From: ${order.from} → To: ${order.to}`);
  console.log(`   Moment: ${order.moment}${order.nthYear ? ` (${order.nthYear}${order.moment === 'anniversary' ? ' years' : 'th birthday'})` : ''}`);
  console.log(`   Theme: ${order.theme} | Metaphor: ${order.metaphor}`);

  const existingDraft = await cfGet(`draft:${order.slug}`);
  const draftPhotos = existingDraft?.photos || [];
  
  let orderPhotos = [];
  if (order.orderId) {
    const orderData = await cfGet(`order:${order.orderId}`);
    if (orderData && orderData.photos) {
      orderPhotos = orderData.photos;
    }
  }

  // Generate data (AI first, fallback to static if no GEMINI_API_KEY)
  let data;
  if (env.GEMINI_API_KEY) {
    console.log('\n🤖 Generating content with Gemini AI...');
    try {
      data = await generateGiftDataAi(order);
      console.log('   ✅ AI content generated successfully!');
    } catch (aiErr) {
      console.warn(`   ⚠️  AI failed (${aiErr.message}), falling back to static templates...`);
      data = generateGiftData(order);
    }
  } else {
    console.log('\n📝 GEMINI_API_KEY not set, using static templates...');
    data = generateGiftData(order);
  }

  // Preserve any existing photo URLs (order photos take priority, then draft photos)
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
    console.log(`   📸 Preserved photo URL(s) from previous uploads`);
  }

  // Push to KV
  console.log('\n🚀 Pushing to Cloudflare KV...');
  await cfSet(`draft:${order.slug}`, data);
  await cfSet(`gift:${order.slug}`, data);

  console.log(`\n✅ Done! Gift "${order.slug}" is live.`);
  console.log(`   🔗 Preview: https://loves-edition.vercel.app/${order.slug}`);
  console.log(`   📝 Edit: https://loves-edition.vercel.app/studio/${order.slug}/edit\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
