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
  const kvId = 'auto-zweh7qg';
  const orderId = 'ORD-MS51BSNL';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (9) - Full Indonesia
  const words = [
    "Untuk",
    "My",
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
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: team choose",
    recipient: "Stefan",
    sender: "Itania",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (DILARANG ADA EMOJI SAMA SEKALI)
    heroPreTitle: "untuk princess tersayang",
    heroLine1: "Untuk Sayangku,",
    heroLine2: "Stefan",
    heroSubtitle: "Terima kasih sudah mau bertahan, bersabar, dan menjadi rumah kedua tempatku pulang.",
    
    // Time Section (LDR / Girlfriend Day)
    timeEnabled: true,
    timeTitle: "Perjalanan Kita",
    timeSubtitle: "saling bertahan dan menyayangi sejak",
    timeStartDate: "2026-08-01",
    
    // Intro Section (Full Indonesia, Bucin/Romantis)
    introPreTitle: "pesan kecil dari hati",
    introHeadline1: "Untuk",
    introHeadline2: "Princessku,",
    introHeadline3: "Stefan",
    introText: [
      "Untuk my princess tersayang... 🩷🩷💐💐 Aku cuma mau bilang sama pacar aku yang tercantik, makasih yaa udah mau bertahan sama aku sampai sekarang.",
      "Makasih juga udah sabar banget ngadepin sikap aku. Kadang aku egois, kadang emosi, kadang bad mood nggak jelas sama kamu... Tapi kamu tetep sabar dan tetep ada di samping aku.",
      "Makasih yaa udah mau jalanin hubungan ini sejauh ini. Meskipun hubungan kita kadang ada berteman, kadang juga putus nyambung, tapi aku bersyukur banget untuk semuanya sayang. Aku merasa sangat beruntung bisa bertemu dan memiliki kamu.",
      "Aku cuma mau bilang, aku sayang banget-banget sama kamu. Makasih yaa udah mau jadi rumah kedua buat aku. Love you my princess tersayang, aku sayang kamu selamanya! 💖✨"
    ],
    introSignOff: "Sayang kamu selamanya, Itania",
    
    // Gallery (Full Indonesia)
    galleryTitle1: "Kenangan",
    galleryTitle2: "Terindah Kita",
    photos: photos,
    
    // Reasons (Full Indonesia, Moments theme)
    reasonsTitle1: "6 Momen Kenapa",
    reasonsTitle2: "Aku Bersyukur Punya Kamu",
    reasons: [
      {
        icon: "🥺",
        title: "Kesabaranmu",
        desc: "Makasih udah selalu sabar ngadepin sifat aku yang kadang egois dan bad mood."
      },
      {
        icon: "💖",
        title: "Tetap Bertahan",
        desc: "Makasih udah mau bertahan dan jalanin hubungan ini sejauh ini bareng aku."
      },
      {
        icon: "🤝",
        title: "Melalui Pasang Surut",
        desc: "Meski pernah putus nyambung, aku bersyukur kita selalu bisa kembali bersama."
      },
      {
        icon: "🏡",
        title: "Rumah Keduanya",
        desc: "Terima kasih udah mau jadi tempat nyaman dan rumah kedua buat aku pulang."
      },
      {
        icon: "🍀",
        title: "Sangat Beruntung",
        desc: "Aku ngerasa jadi orang paling beruntung di dunia karena bisa ketemu kamu."
      },
      {
        icon: "🤍",
        title: "Cinta Selamanya",
        desc: "Nggak ada alasan lain selain karena aku beneran sayang banget sama kamu selamanya."
      }
    ],
    
    // Closing
    secretPhoto: order.secretPhoto || "",
    secretCaption: "Love you my princess tersayang 🤍",
    closingPreTitle: "selamanya bersama",
    closingTitle1: "Sayang Kamu",
    closingTitle2: "Selamanya ✨",
    closingParagraph: "Terima kasih untuk semua kenangan dan kesempatan yang udah kamu kasih. Mari terus melangkah bareng-bareng dan saling jaga ya sayang!",
    celebrateBtnText: "sayang kamu ✨",
    
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
