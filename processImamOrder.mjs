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

const slug = 'auto-djnftw2';
const orderId = 'ORD-MS7HM4ZC';

const giftData = {
  slug,
  orderId,
  recipient: "Nauraisa camilia caerinlee🙆🏻🫶🤍",
  sender: "Imam Khusairi",
  theme: "ocean-breeze",

  // PIN Gate Protection
  pinEnabled: true,
  pinCode: "4626",
  pinHint: "05-02-26",

  // Envelope Gate Screen
  gateSubtitle: "Something Special For u",

  // Hero Section (Clean, NO emojis in Hero strings)
  heroPreTitle: "happy girlfriend day",
  heroLine1: "Happy Girlfriend Day,",
  heroLine2: "Nauraisa",
  heroSubtitle: "Thank you for being my constant happiness and the best part of my days.",

  // Time Section
  timeEnabled: true,
  timeTitle: "Happy Girlfriend Day 💖",
  timeSubtitle: "Celebrating every moment spent with you",
  timeStartDate: "2026-08-01",

  // Intro Letter Section
  introIcons: true,
  introPreTitle: "a little note from me",
  introHeadline1: "To My",
  introHeadline2: "Precious",
  introHeadline3: "Sayang",
  introText: [
    "Sayangggg, semangattt yaaa jalaninnn hariiii-hariii kamuuu. Akuuu selaluuuu supportttt kamuuu di setiap langkah kamuuu. 🫶",
    "Semogaaaa apaaa yanggg kamuuu mauuu tercapaiii yaaa sayanggg. Akuuu selaluuuu doainnn yang terbaikkk buattt kamuuu. ✨",
    "Makasihhhh banyaaa-banyaaaa udaaaa sabarrrr dengannn sifattt akuuu, meskipunnn akuuu kadangg ngeselinnn bangettt. 🥺🤍",
    "Sayangggg kamuuuu banyaaaa-banyaaaaa, I love you to the moon and back sayanggg! 💖"
  ],
  introSignOff: "– Always yours, Imam 🤍",

  // Music Choice
  musicUrl: "FILL_MANUALLY: team choose",
  music: {
    title: "FILL_MANUALLY: team choose",
    artist: "Let Team Decide",
    file: "",
    cover: ""
  },

  // Reasons Section (6 Cards for Gratitude & Bucin/ABG tone)
  reasonsTitle1: "6 Things I'm",
  reasonsTitle2: "Grateful For You",
  reasons: [
    {
      icon: "🥹",
      title: "Your Patience",
      desc: "Makasih udah selalu sabar banget ngadepin sifat aku yang kadang ngeselin ini."
    },
    {
      icon: "✨",
      title: "Your Support",
      desc: "Aku bersyukur kamu selalu ada buat support dan kasih semangat setiap hari."
    },
    {
      icon: "🌸",
      title: "Your Warmth",
      desc: "Kehadiran kamu selalu bikin hari-hari aku terasa jauh lebih tenang dan bahagia."
    },
    {
      icon: "🤍",
      title: "Your Smile",
      desc: "Senyum manis kamu selalu berhasil bikin mood aku balik ceria lagi."
    },
    {
      icon: "🫶",
      title: "Your Kindness",
      desc: "Cara kamu merawat dan menyayangi aku dengan tulus itu berarti banget."
    },
    {
      icon: "💖",
      title: "Your Love",
      desc: "Makasih udah milih untuk jalanin hari-hari bareng aku dan mencintai aku."
    }
  ],

  // Gallery Section (3 photos -> exactly 3 words caption)
  galleryTitle1: "Our Sweetest",
  galleryTitle2: "Captured Moments",
  photos: [
    {
      url: "https://always.for-you-always.my.id/orders/auto-djnftw2/1785414128613-IMG_3447.jpeg",
      caption: "You"
    },
    {
      url: "https://always.for-you-always.my.id/orders/auto-djnftw2/1785414128669-e6594947-7d97-43dc-9168-6236b4300f34.jpeg",
      caption: "Are"
    },
    {
      url: "https://always.for-you-always.my.id/orders/auto-djnftw2/1785414129424-IMG_2635.jpeg",
      caption: "Loved 🤍"
    }
  ],

  // Closing Section
  closingPreTitle: "forever & always",
  closingTitle1: "Happy Girlfriend Day",
  closingTitle2: "My Prettiest Girl 💖",
  closingParagraph: "Makasih yaa sayang udah hadir dan mewarnai hari-hari aku dengan indah. Semoga kita bisa terus jalan bareng, saling support, dan bahagia terus sama-sama.",
  celebrateBtnText: "always yours ✨",

  // Secret Photo
  secretPhoto: "https://always.for-you-always.my.id/orders/auto-djnftw2/1785414335813-IMG_3493.jpeg",
  secretCaption: "our special memory 🤍",

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
