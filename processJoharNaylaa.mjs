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
  const kvId = 'auto-tpmfpy8';
  const orderId = 'ORD-MS4ME3M7';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (10)
  const words = [
    "Selamat",
    "Hari",
    "Pacar",
    "Nasional",
    "Untuk",
    "Wanita",
    "Paling",
    "Spesial",
    "Di",
    "Hidupku"
  ];

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Teh Hijau - Tulus",
    recipient: "Naylaa",
    sender: "Johar",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (TANPA EMOJI)
    heroPreTitle: "selamat hari pacar nasional",
    heroLine1: "Untuk Sayangku,",
    heroLine2: "Naylaa",
    heroSubtitle: "Terima kasih sudah selalu ada dan menjadi bagian terindah dalam hidupku.",
    
    // Time Section
    timeEnabled: true,
    timeTitle: "Happy Girlfriend's Day",
    timeSubtitle: "mensyukuri hadirmu dalam hari-hariku sejak",
    timeStartDate: "2026-08-01",
    
    // Intro Section
    introPreTitle: "pesan kecil dari hati",
    introHeadline1: "Untuk",
    introHeadline2: "Wanita Spesialku,",
    introHeadline3: "Naylaa",
    introText: [
      "Haii sayangggkuu naylaa, selamat national girlfriends day yaaa.. 🤍",
      "Makasii banyakk yaa karena udah hadir di hidup akuu.. Makasii juga udah bertahan sama semua sifatku, ngadepin moodku, dan tetep ada walaupun kitaa kadang sukaa berantem.",
      "Maafin akuu kalo masih sering bikin kamu kesel, kecewa, atau sedih. Akuu beneran masih terus belajar jadi cowo yang lebih baik buat kamu.",
      "Semoga kitaa bisaa terus samaa samaa, saling ngerti, saling jagaa, dan saling dukung dalam keadaan apa pun. Akuu bersyukur banget bisa punya kamu.",
      "Semoga senyum kamu selalu ada, sehat terus, bahagia terus, dan semoga akuu bisa jadi salah satu alasan kamu buat ngerasa tenang setiap hari.",
      "Sekali lagii, selamat national girlfriends day yaa cintakuu. I love you more than words can explain 🤍"
    ],
    introSignOff: "Penuh kasih, Johar",
    
    // Gallery
    galleryTitle1: "Kenangan",
    galleryTitle2: "Terindah Kita",
    photos: photos,
    
    // Reasons (Full Indonesia)
    reasonsTitle1: "6 Hal Yang",
    reasonsTitle2: "Bikin Aku Makin Sayang Sama Kamu",
    reasons: [
      {
        icon: "🥺",
        title: "Kesabaranmu",
        desc: "Makasih udah selalu sabar ngadepin sifat dan mood aku."
      },
      {
        icon: "🫂",
        title: "Selalu Ada",
        desc: "Terima kasih selalu bertahan mendampingiku dalam situasi apa pun."
      },
      {
        icon: "🌟",
        title: "Senyumanmu",
        desc: "Senyum manis kamu selalu bisa bikin hari-hariku terasa lebih tenang."
      },
      {
        icon: "🤍",
        title: "Ketulusan Hati",
        desc: "Ketulusan kamu mencintaiku bikin aku merasa jadi cowok paling beruntung."
      },
      {
        icon: "🤝",
        title: "Saling Mendukung",
        desc: "Cara kita saling dukung dan mengerti satu sama lain sangat berarti."
      },
      {
        icon: "✨",
        title: "Kehadiranmu",
        desc: "Kehadiranmu di hidupku adalah hadiah terindah yang selalu aku syukuri."
      }
    ],
    
    // Closing
    secretPhoto: order.secretPhoto || "",
    secretCaption: "Terima kasih sudah memilihku setiap hari 🤍",
    closingPreTitle: "selamanya bersama",
    closingTitle1: "Selamat Hari Pacar",
    closingTitle2: "Nasional, Sayang ✨",
    closingParagraph: "Terima kasih sudah menjadi alasan di balik senyumku setiap hari. Mari terus berjalan berdampingan dan membuat lebih banyak kenangan indah bersama.",
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
