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
  const kvId = 'auto-prrsnle';
  const orderId = 'ORD-MS5J6VAG';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (12) - Full Indonesia
  const words = [
    "Selamat",
    "Hari",
    "Pacar",
    "Nasional",
    "Untuk",
    "Princess",
    "Tersayang",
    "Yang",
    "Paling",
    "Aku",
    "Cintai",
    "🤍"
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
    musicUrl: "FILL_MANUALLY: About You - The 1975",
    recipient: "Aca",
    sender: "William Felim",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (DILARANG ADA EMOJI SAMA SEKALI)
    heroPreTitle: "selamat hari pacar nasional",
    heroLine1: "Untuk Princessku,",
    heroLine2: "Aca",
    heroSubtitle: "Terima kasih sudah selalu sabar mendampingi dan membuat hariku terasa begitu bermakna.",
    
    // Time Section (Girlfriend Day)
    timeEnabled: true,
    timeTitle: "Happy Girlfriend's Day",
    timeSubtitle: "mensyukuri setiap detik bersamamu sejak",
    timeStartDate: "2026-08-01",
    
    // Intro Section (Full Indonesia, Santai & Romantis)
    introPreTitle: "pesan kecil dari hati",
    introHeadline1: "Untuk",
    introHeadline2: "Cantikku,",
    introHeadline3: "Aca",
    introText: [
      "Happy Girlfriend Day, cantikku. 🤍 Hari ini aku cuma mau nyampein beberapa hal kecil yang bener-bener dari hati buat kamu.",
      "Makasih yaa udah mau temenin aku sampai sekarang. Makasih juga udah selalu sabar ngadepin kelakuanku yang mungkin kadang aneh dan nggak jelas ini...",
      "Semoga ke depannya kita bisa tetap saling jaga, makin kuat dalam ngelewatin apa pun, dan semoga cerita indah kita ini nggak cuma sampai hari ini aja, tapi terus berlanjut selamanya.",
      "Terima kasih sudah jadi bagian yang begitu berharga dan bikin duniaku terasa jauh lebih hangat. Love you, always. 🫶"
    ],
    introSignOff: "Penuh kasih, William Felim",
    
    // Gallery (Full Indonesia)
    galleryTitle1: "Kenangan",
    galleryTitle2: "Terindah Kita",
    photos: photos,
    
    // Reasons (Full Indonesia, Qualities theme)
    reasonsTitle1: "6 Hal Yang",
    reasonsTitle2: "Bikin Aku Makin Sayang Sama Kamu",
    reasons: [
      {
        icon: "🥺",
        title: "Kesabaranmu",
        desc: "Makasih udah selalu sabar ngadepin kelakuanku yang kadang aneh ini."
      },
      {
        icon: "🫂",
        title: "Selalu Mendampingi",
        desc: "Terima kasih udah mau nemenin dan ada buat aku sampai sekarang."
      },
      {
        icon: "🌟",
        title: "Senyuman Manismu",
        desc: "Senyum cantikmu selalu sukses bikin hariku terasa jauh lebih tenang."
      },
      {
        icon: "🤍",
        title: "Ketulusan Hati",
        desc: "Ketulusan kamu mencintaiku bikin aku merasa jadi cowok paling beruntung."
      },
      {
        icon: "🤝",
        title: "Saling Memahami",
        desc: "Caramu mengerti dan menerima aku apa adanya sangat berarti buat aku."
      },
      {
        icon: "✨",
        title: "Kehadiranmu",
        desc: "Hadirnya kamu di hidupku adalah alasan kenapa banyak hariku terasa hangat."
      }
    ],
    
    // Closing
    secretPhoto: order.secretPhoto || "",
    secretCaption: "Love you always, Aca 🤍",
    closingPreTitle: "selamanya bersama",
    closingTitle1: "Happy Girlfriend's",
    closingTitle2: "Day, Sayang ✨",
    closingParagraph: "Terima kasih untuk semua tawa dan kenangan manis yang udah kita buat. Semoga cerita kita terus tumbuh dan bertahan selamanya.",
    celebrateBtnText: "sayang kamu ✨",
    
    // PIN Protection (Mapping dari order)
    pinEnabled: order.pinEnabled || (order.pinCode ? true : false),
    pinCode: order.pinCode || "",
    pinHint: order.pinHint || ""
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
