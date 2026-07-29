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
  const kvId = 'auto-w6w73wj';
  const orderId = 'ORD-MS5R714Z';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (13) - Full Indonesia
  const words = [
    "Selamat",
    "Ulang",
    "Tahun",
    "Untuk",
    "Laki-Laki",
    "Hebat",
    "Yang",
    "Selalu",
    "Membuatku",
    "Bersyukur",
    "Dan",
    "Bahagia",
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
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: team choose",
    recipient: "A Indra Fiphayana",
    sender: "Syania",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (DILARANG ADA EMOJI SAMA SEKALI)
    heroPreTitle: "barakallah fii umrik",
    heroLine1: "Untuk Kesayanganku,",
    heroLine2: "A Indra Fiphayana",
    heroSubtitle: "Selamat bertambah usia untuk laki-laki hebat yang selalu membuatku bersyukur.",
    
    // Time Section (Ultah ke-34)
    timeEnabled: true,
    timeTitle: "Cerita Tentang Kamu",
    timeSubtitle: "menghiasi dunia dengan kebaikan dan ketulusan sejak",
    timeStartDate: "1992-07-29",
    
    // Intro Section (Full Indonesia, Puitis & Romantis)
    introPreTitle: "pesan kecil dari hati",
    introHeadline1: "Untuk",
    introHeadline2: "Kesayanganku,",
    introHeadline3: "A Indra",
    introText: [
      "Barakallah Fii Umrik A Indra... 🤲💗🌹 Ada banyak hal yang berubah seiring waktu, tetapi ada satu hal yang semoga tidak pernah berubah: semangatmu untuk menjadi pribadi yang lebih baik, dan doaku yang selalu menyertai setiap langkahmu.",
      "Semoga bertambahnya usiamu bukan sekadar angka, tetapi menjadi awal dari semakin luasnya keberkahan, semakin tenangnya hati, dan semakin dekatnya langkah kepada setiap impian yang sedang Aa perjuangkan. Aamiin.",
      "Semoga Allah mengganti setiap lelahmu dengan kebahagiaan, setiap doa dengan jawaban terbaik. Semoga Allah melapangkan setiap langkah Aa, menjaga kesehatanmu, menguatkan hatimu, dan melimpahkan rezeki yang halal dan berkah. Aamiin Ya Rabb.",
      "Jika suatu hari nanti semua doa kita dipertemukan pada waktu terbaik-Nya, semoga Neng masih menjadi alasan senyumanmu di tahun-tahun berikutnya. Selamat bertambah usia, sayang. Tetap menjadi laki-laki yang rendah hati dan penuh tanggung jawab. Neng bangga banget sama Aa.",
      "Neng bersyukur dipertemukan sama Aa, bersyukur karena waktu mempertemukan Neng dengan seseorang yang membuat Neng banyak belajar bahwa ketulusan itu masih ada. Terima kasih sudah bertahan sejauh ini yaa A Indra, terima kasih untuk semua usaha yang Aa kasih ke Neng. Sekali lagi terima kasih banyak karena sudah menjadi pelengkap di hidup Neng.",
      "Semoga usiamu dipenuhi keberkahan, hatimu selalu dijaga dari segala hal yang menyakitkan, dan semoga Allah mempertemukan kita dalam ikatan yang paling indah pada waktu yang paling tepat. Aamiin 🤲💗🌹"
    ],
    introSignOff: "Penuh cinta, Syania",
    
    // Gallery (Full Indonesia)
    galleryTitle1: "Kenangan",
    galleryTitle2: "Terindah Kita",
    photos: photos,
    
    // Reasons (Full Indonesia, Qualities theme)
    reasonsTitle1: "6 Hal Yang",
    reasonsTitle2: "Bikin Aku Bangga Sama Aa",
    reasons: [
      {
        icon: "🤲",
        title: "Ketulusan Hati",
        desc: "Aa membuat Neng percaya bahwa ketulusan dan kebaikan nyata itu masih ada."
      },
      {
        icon: "🛡️",
        title: "Tanggung Jawab",
        desc: "Neng selalu bangga melihat Aa yang rendah hati dan tak pernah menyerah."
      },
      {
        icon: "🏡",
        title: "Pelengkap Hidup",
        desc: "Terima kasih sudah menjadi pelengkap terindah dalam perjalanan hidup Neng."
      },
      {
        icon: "🤍",
        title: "Usaha & Perhatian",
        desc: "Terima kasih untuk semua usaha, kejujuran niat, dan perhatian yang Aa berikan."
      },
      {
        icon: "🌟",
        title: "Semangat Berjuang",
        desc: "Semangat Aa untuk selalu jadi pribadi lebih baik bikin Neng makin kagum."
      },
      {
        icon: "✨",
        title: "Doa Bersama",
        desc: "Semoga Allah senantiasa menjaga dan mempertemukan doa-doa kita di waktu terbaik."
      }
    ],
    
    // Closing (Momen Ultah -> WAJIB EMOJI 🎂)
    secretPhoto: order.secretPhoto || "",
    secretCaption: "Barakallah Fii Umrik A Indra 🎂",
    closingPreTitle: "selamanya bersama",
    closingTitle1: "Barakallah Fii Umrik",
    closingTitle2: "A Indra 🎂",
    closingParagraph: "Semoga di usiamu yang ke-34 ini, semua doa baik dan impianmu dikabulkan oleh Allah. Nikmati hari spesialmu ya Aa, Neng akan selalu ada di samping Aa!",
    celebrateBtnText: "selamat ulang tahun 🎂",
    
    // PIN Protection (Menjaga PIN & Hint jika diisi customer)
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
