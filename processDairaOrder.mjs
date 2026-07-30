import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const kvNamespaceId = process.env.KV_NAMESPACE_ID;

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}`;

async function kvGet(key) {
  const res = await fetch(`${BASE_URL}/values/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${apiToken}` }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV GET failed: ${res.status}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function kvPut(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`${BASE_URL}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`KV PUT failed for ${key}: ${res.status} ${errText}`);
  }
  console.log(`Successfully put ${key}`);
}

async function updateIndex(indexKey, slug) {
  const index = (await kvGet(indexKey)) || [];
  if (!Array.isArray(index)) {
    await kvPut(indexKey, [slug]);
  } else if (!index.includes(slug)) {
    await kvPut(indexKey, [...index, slug]);
  }
}

const slug = 'auto-re972tm';
const orderId = 'ORD-MS7PJX7Y';

const giftData = {
  slug,
  orderId,
  recipient: "Rifqi Rafsanjani",
  sender: "Daira Alifia",
  theme: "midnight-blue",

  // PIN Protection Gate
  pinEnabled: true,
  pinCode: "050626",
  pinHint: "",

  // Envelope Gate Screen
  gateSubtitle: "Something Special For u",

  // Hero Section (Clean, NO Emojis in Hero strings)
  heroPreTitle: "happy 24th birthday, mas Qj",
  heroLine1: "Happy Birthday,",
  heroLine2: "Rifqi Rafsanjani",
  heroSubtitle: "24 years of you making the world a brighter and warmer place.",

  // Time Section
  timeEnabled: true,
  timeTitle: "The Story of You",
  timeSubtitle: "Celebrating 24 years of your life and journey",
  timeStartDate: "2002-07-31",

  // Intro Letter Section
  introIcons: true,
  introPreTitle: "a letter from the heart",
  introHeadline1: "To My",
  introHeadline2: "Precious",
  introHeadline3: "Mas Qj",
  introText: [
    "Sayang, terimakasih yaa udah selalu jadi tempat yang nyaman dan super sabar ngadepin aku.",
    "Maaf kalau aku belum bisa jadi versi yang sempurna buat kamu, tapi thank you for accepting me as I am dan mau nemenin aku dengan kondisi aku yang sekarang.",
    "Walaupun kita lagi LDR-an, let's grow together pelan-pelan ya. Thank you for never giving up on us, stay healthy ya sayang!",
    "Happy 24th birthday, Mr. Dewan! I am so lucky to have you, and I can't wait until we're together again. 🤍✨"
  ],
  introSignOff: "– With all my love, Daira 🤍",

  // Music Choice
  musicUrl: "FILL_MANUALLY: team choose",
  music: {
    title: "FILL_MANUALLY: team choose",
    artist: "Let Team Decide",
    file: "",
    cover: ""
  },

  // Reasons Section (6 Cards for Gratitude & Indoglish tone)
  reasonsTitle1: "6 Things I'm",
  reasonsTitle2: "Grateful For You",
  reasons: [
    {
      icon: "🏠",
      title: "Safe Haven",
      desc: "Terimakasih udah selalu jadi tempat paling nyaman untuk aku pulang dan cerita apa aja."
    },
    {
      icon: "🤍",
      title: "Your Patience",
      desc: "Kesabaran Mas Qj ngadepin aku yang kadang ajaib ini bikin aku selalu bersyukur."
    },
    {
      icon: "🌷",
      title: "Pure Acceptance",
      desc: "Thank you for accepting me as I am dan selalu ada mendukung kondisi aku saat ini."
    },
    {
      icon: "🌱",
      title: "Growing Together",
      desc: "Meski kita LDR-an, aku senang banget bisa terus tumbuh dan berjuang pelan-pelan bareng kamu."
    },
    {
      icon: "✨",
      title: "Never Giving Up",
      desc: "Terimakasih karena nggak pernah menyerah untuk hubungan kita dan selalu jaga komitmen ini."
    },
    {
      icon: "💖",
      title: "Endless Love",
      desc: "Cara kamu mencintai dan merawat hubungan ini bikin aku merasa jadi cewek paling beruntung."
    }
  ],

  // Gallery Section (8 photos -> exactly 8 words sentence)
  galleryTitle1: "Fragments of",
  galleryTitle2: "Our Memories",
  photos: [
    {
      url: "https://always.for-you-always.my.id/orders/auto-re972tm/1785426993534-IMG_2820.jpeg",
      caption: "Happy"
    },
    {
      url: "https://always.for-you-always.my.id/orders/auto-re972tm/1785426993872-52ea923f-b3ee-4aec-a23f-d1ab183585d7.jpeg",
      caption: "24th"
    },
    {
      url: "https://always.for-you-always.my.id/orders/auto-re972tm/1785426993277-5d5b5b7a-3514-48c6-be27-81fc9d63ee03.jpeg",
      caption: "Birthday"
    },
    {
      url: "https://always.for-you-always.my.id/orders/auto-re972tm/1785426993447-732e5e5f-229f-4d22-b106-17e967faa0c8.jpeg",
      caption: "To"
    },
    {
      url: "https://always.for-you-always.my.id/orders/auto-re972tm/1785426993607-e159f741-bab0-499a-9f36-27ce2b0b98a6.jpeg",
      caption: "My"
    },
    {
      url: "https://always.for-you-always.my.id/orders/auto-re972tm/1785426993410-f6eb60bc-f807-4a6e-ad7a-855de9eb165d.jpeg",
      caption: "Favorite"
    },
    {
      url: "https://always.for-you-always.my.id/orders/auto-re972tm/1785426993494-4eac663f-6d58-4037-a041-48232d15d171.jpeg",
      caption: "Person"
    },
    {
      url: "https://always.for-you-always.my.id/orders/auto-re972tm/1785426993423-c96d76a5-3a09-43cd-adc9-207c41e89ee5.jpeg",
      caption: "🤍"
    }
  ],

  // Closing Section (Birthday moment -> 🎂 emoji!)
  closingPreTitle: "always & forever",
  closingTitle1: "Happy 24th Birthday",
  closingTitle2: "Mas Qj Sayang 🎂",
  closingParagraph: "Selamat ulang tahun yang ke-24, Mr. Dewan! Tetap sehat ya sayang, dan semoga semua impian kamu di umur baru ini tercapai pelan-pelan. Happy birthday, my favorite human.",
  celebrateBtnText: "make a wish 🎂",

  // Secret Photo
  secretPhoto: "https://always.for-you-always.my.id/orders/auto-re972tm/1785427425865-quality_restoration_20260730230247463.jpeg",
  secretCaption: "you will always be my home 🤍",

  createdAt: new Date().toISOString()
};

async function main() {
  console.log('Processing gift & draft payload for:', slug);
  await kvPut(`gift:${slug}`, giftData);
  await updateIndex('gift:_index', slug);

  await kvPut(`draft:${slug}`, giftData);
  await updateIndex('draft:_index', slug);

  console.log('Successfully saved gift and draft to Cloudflare KV!');
}

main().catch(err => {
  console.error('Failed to process order:', err);
  process.exit(1);
});
