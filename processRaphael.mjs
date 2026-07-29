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

async function main() {
  const kvId = 'auto-rkqgzz3';
  const orderId = 'ORD-MS43J1SH';
  const customerName = 'RAPHAEL';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "Happy", "Girlfriend", "Day", "To", "My",
    "Prettiest", "Girl", "Thank", "You", "For",
    "Being", "Mine", "Always", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "ADEL",
    sender: "RAPHAEL",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: team choose",
    gateSubtitle: "Something Special For u",

    pinEnabled: true,
    pinCode: "300526",
    pinHint: "Tanggal Jadian kita",

    heroPreTitle: "happy girlfriend day",
    heroLine1: "To My Prettiest Girl,",
    heroLine2: "ADEL Cantik 💕",
    heroSubtitle: "Miles apart, but you will always have the biggest place in my heart.",

    timeEnabled: true,
    timeTitle: "Happy Girlfriend Day",
    timeSubtitle: "holding you close in my heart across the distance since",
    timeStartDate: "2026-08-01",

    introPreTitle: "surat dari hati",
    introHeadline1: "Untuk",
    introHeadline2: "ADEL Cantik",
    introHeadline3: "Sayangku",
    introText: [
      "Happy Girlfriend Day yaa, ADEL cantikkuuu 🤍✨ Makasihhh yaa selamaa ini sudahh mauu sabarrr banget sama akuu dan selalu nerimaa semuanya dengan tulus.",
      "Walaupun sekarang kita harus LDR lagii dan terpisah jarak, tapi kamu harus tahu kalau akuu tetapp sayanggg banget sama kamu. Jarak gak akan pernah mengubah perasaan aku ke kamu. 🌌💖",
      "Semangatt jugaa yaa nantii buat kuliahhnyaa! Apapun proses yang bakal kamu lewati, I will always support u and be right here for you. ✨",
      "Tetap jaga kesehatan, jaga senyum manis kamu, dan ingat kalau ada aku yang selalu merindukanmu di sini. Happy Girlfriend Day, my prettiest girl! I love you so much! ❤️✨"
    ],
    introSignOff: "Always yours, RAPHAEL",

    reasonsTitle1: "6 Alasan Kenapa",
    reasonsTitle2: "Aku Sayang Banget Sama ADEL",
    reasonsHintTap: "ketuk untuk membaca",
    reasonsHintAll: "✨ ungkapan tulus untuk cewek paling cantik ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Kesabaran Luar Biasa",
        desc: "Makasih udah selalu sabar menghadapi aku dan menerima segalanya dengan tulus."
      },
      {
        icon: "🌌",
        title: "Cinta Melampaui Jarak",
        desc: "Walau kita LDR lagi, rasa sayang aku ke kamu gak akan pernah berkurang."
      },
      {
        icon: "🎓",
        title: "Dukungan Penuh Kuliah",
        desc: "Aku bakal selalu dukung dan ada buat kamu di setiap langkah perkuliahan nanti."
      },
      {
        icon: "😊",
        title: "Senyum Paling Cantik",
        desc: "Senyuman kamu selalu sukses bikin hariku jadi lebih hangat dan bahagia."
      },
      {
        icon: "✨",
        title: "Sosok Yang Selalu Ada",
        desc: "Terima kasih udah jadi tempat pulang paling nyaman untuk semua ceritaku."
      },
      {
        icon: "👑",
        title: "Cewek Paling Spesial",
        desc: "Kamu akan selalu jadi cewek cantik nomor satu yang paling berharga di hatiku."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Memories",
    galleryHint: "tap to view photos",
    photos: photos,

    secretPhoto: secretPhoto || '',
    secretTitle: secretPhoto ? "One Special Moment..." : '',
    secretCaption: secretPhoto ? "Happy Girlfriend Day, ADEL cantikku! Always love u ❤️" : '',

    closingPreTitle: "always & forever",
    closingTitle1: "Happy Girlfriend Day,",
    closingTitle2: "ADEL Cantik 🌹",
    closingParagraph: "Happy Girlfriend Day once again, ADEL cantikku. Thank you for being the most wonderful part of my life. Semangat kuliahnya yaa, I will always support u. I love you so much! ❤️✨",
    celebrateBtnText: "miss you ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "ADEL",
    customerName: customerName,
    theme: "vintage-burgundy",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);

  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
