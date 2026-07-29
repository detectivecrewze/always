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
  const kvId = 'gift-1785252882456';
  const orderId = 'ORD-MS4UU4SP';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (2) - Full Indonesia
  const words = [
    "Bahagia",
    "Selalu"
  ];

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: Everything u are - Hindia",
    recipient: "Vina Thirza Aflah",
    sender: "Vina's",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (DILARANG ADA EMOJI SAMA SEKALI)
    heroPreTitle: "selamat ulang tahun ke 20",
    heroLine1: "Untuk Kesayanganku,",
    heroLine2: "Vina Thirza Aflah",
    heroSubtitle: "Selamat bertambah usia untuk sosok yang selalu jadi alasan di balik senyum dan bahagiaku.",
    
    // Time Section (Ultah)
    timeEnabled: true,
    timeTitle: "Cerita Tentang Kamu",
    timeSubtitle: "menghiasi dunia dengan kebaikan dan senyuman sejak",
    timeStartDate: "2006-07-29",
    
    // Intro Section (Full Indonesia, Santai & Bucin)
    introPreTitle: "pesan kecil dari hati",
    introHeadline1: "Untuk",
    introHeadline2: "Kesayanganku,",
    introHeadline3: "Vina",
    introText: [
      "Selamat ulang tahun yang ke-20, sayang! 🎂 Di hari spesial kamu ini, aku cuma mau nyampein beberapa hal dari lubuk hatiku yang paling dalam.",
      "Makasih banyak yaa udah selalu ada bahkan di titik terbawah aku. Makasih udah selalu bikin aku ngerasa senang, tenang, nyaman, dan bahagia setiap kali ada di deket kamu.",
      "Makasih juga karena kamu nggak pernah capek buat selalu support aku, dan selalu percaya sama aku bahkan sebelum aku sendiri mempercayai diriku sepenuhnya. Kamu bener-bener berarti banget buat aku.",
      "Di usiamu yang baru ini, semoga kamu makin cantik, makin imut, dan... jangan tambah tinggi lagi yaa hehe! Wish you all the best in everything you do. Love you so much babe, terima kasih udah jadi bagian paling indah dalam hidup aku! 🤍"
    ],
    introSignOff: "Penuh cinta, Vina's",
    
    // Gallery (Full Indonesia)
    galleryTitle1: "Kenangan",
    galleryTitle2: "Terindah Kita",
    photos: photos,
    
    // Reasons (Full Indonesia, Qualities theme)
    reasonsTitle1: "6 Hal Yang",
    reasonsTitle2: "Bikin Aku Makin Sayang Sama Kamu",
    reasons: [
      {
        icon: "🫂",
        title: "Selalu Ada",
        desc: "Makasih udah selalu nemenin dan ada buat aku bahkan di titik terbawahku."
      },
      {
        icon: "🤍",
        title: "Bikin Tenang",
        desc: "Kehadiran kamu tuh selalu sukses bikin aku ngerasa nyaman dan bahagia."
      },
      {
        icon: "🤝",
        title: "Support System Terbaik",
        desc: "Makasih yaa nggak pernah capek buat selalu dukung dan nyemangatin aku."
      },
      {
        icon: "🌟",
        title: "Kepercayaanmu",
        desc: "Kamu selalu percaya sama aku bahkan sebelum aku mempercayai diriku sendiri."
      },
      {
        icon: "🎀",
        title: "Sosok Yang Imut",
        desc: "Kamu tuh selalu makin cantik dan imut tiap harinya, gemes banget!"
      },
      {
        icon: "✨",
        title: "Kehadiranmu",
        desc: "Aku bersyukur banget punya kamu di hidupku, thank you for being you!"
      }
    ],
    
    // Closing (Momen Ultah -> WAJIB EMOJI 🎂)
    secretPhoto: order.secretPhoto || "",
    secretCaption: "Happy 20th Birthday, my love 🎂",
    closingPreTitle: "selamanya bersama",
    closingTitle1: "Selamat Ulang",
    closingTitle2: "Tahun Ke-20 🎂",
    closingParagraph: "Semoga di usiamu yang ke-20 ini, semua harapan dan doa-doamu dikabulkan. Nikmati hari spesialmu ini ya sayang, I'll always be here for you!",
    celebrateBtnText: "selamat ulang tahun 🎂",
    
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
