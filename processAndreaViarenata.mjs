import fs from 'fs';
import path from 'path';

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

async function cfGet(key) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

async function cfSet(key, value) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(value)
  });
  return res.json();
}

async function processOrder() {
  const kvId = 'auto-ygdvzg6';
  const orderId = 'ORD-MS4A46DY';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (15) - Bahasa Inggris (Indoglish rule)
  const words = [
    "Distance",
    "Means",
    "So",
    "Little",
    "When",
    "Someone",
    "Means",
    "So",
    "Much",
    "To",
    "My",
    "Heart",
    "Every",
    "Single",
    "Day"
  ];

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "ocean-breeze",
    musicUrl: "FILL_MANUALLY: team choose",
    recipient: "Viarenata Vipassana",
    sender: "Andrea Pirlo",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (DILARANG ADA EMOJI SAMA SEKALI)
    heroPreTitle: "miles of love",
    heroLine1: "To My Precious,",
    heroLine2: "Viarenata Vipassana",
    heroSubtitle: "Miles apart, but you will always have the biggest place in my heart.",
    
    // Time Section (LDR)
    timeEnabled: true,
    timeTitle: "Miles of Love",
    timeSubtitle: "surmounting every distance together since",
    timeStartDate: "2026-01-01",
    
    // Intro Section (English Titles, Indoglish Content)
    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Precious",
    introHeadline3: "Viarenata",
    introText: [
      "Hi Via, aku cuma mau bilang makasih yah udah berikan aku kesempatan untuk bisa jadi bagian dari hidup kamu.",
      "Dan juga makasih beneran karena kamu selalu sabar menghadapi sifatku yang random ini. I know I'm not always easy to deal with, tapi caramu ngadepin aku tuh selalu bikin aku ngerasa bersyukur banget.",
      "Aku seneng banget bisa sama kamu walau sekarang kita harus LDR-an. Distance might separate us, tapi perasaanku ke kamu nggak pernah berubah sama sekali.",
      "Oiya, nanti tolong bilang ke ibu kamu yaa, makasih banyak udah lahirin dan ngerawat anak yang luar biasa cantik dan baik hati kayak kamu. You are truly my favorite miracle. I love you! 🤍"
    ],
    introSignOff: "With all my love, Andrea Pirlo",
    
    // Gallery (English Titles for Indoglish)
    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    photos: photos,
    
    // Reasons (English Titles for Indoglish)
    reasonsTitle1: "6 Things I",
    reasonsTitle2: "Adore About You",
    reasons: [
      {
        icon: "🧸",
        title: "Your Endless Patience",
        desc: "Makasih udah selalu sabar ngadepin sifat aku yang random ini."
      },
      {
        icon: "🤍",
        title: "Giving Me A Chance",
        desc: "Makasih udah mau kasih kesempatan buat aku untuk dampingin kamu."
      },
      {
        icon: "🌟",
        title: "Your Wonderful Heart",
        desc: "Sifat kamu yang baik dan manis selalu bikin duniaku terasa brighter."
      },
      {
        icon: "🤝",
        title: "Making LDR Easy",
        desc: "Walau kita LDR-an, caramu memperlakukanku always makes me feel so loved."
      },
      {
        icon: "👩‍👧",
        title: "Your Amazing Mom",
        desc: "Aku bersyukur banget sama ibumu karena udah lahirin sosok sehebat kamu."
      },
      {
        icon: "✨",
        title: "Simply Being You",
        desc: "Aku seneng banget bisa sama kamu, thank you for being yourself!"
      }
    ],
    
    // Closing (English Titles for Indoglish)
    secretPhoto: order.secretPhoto || "",
    secretCaption: "I'll see you soon, my love 🤍",
    closingPreTitle: "until next time",
    closingTitle1: "See You",
    closingTitle2: "Soon, Sayang ✨",
    closingParagraph: "Semoga jarak ini cepet berlalu yaa sayang. I can't wait to see you again and hold you close. Thank you for everything!",
    celebrateBtnText: "miss you ✨",
    
    // Meta
    pinEnabled: false,
    pinCode: "",
    pinHint: ""
  };

  console.log(`Saving to gift:${kvId}`);
  await cfSet(`gift:${kvId}`, giftData);
  
  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: giftData.recipient,
    theme: giftData.theme,
    createdAt: new Date().toISOString()
  };
  await cfSet(`draft:${kvId}`, draftData);

  console.log('Done processing order!');
}

processOrder().catch(console.error);
