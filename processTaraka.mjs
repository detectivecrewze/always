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
  const kvId = 'auto-08cm8x6';
  const orderId = 'ORD-MRVWPAXF';
  const customerName = 'Taraka';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Happy", "Twenty", "Fourth", "Birthday", "Ziiziieee", "Sayangku", "Terima", "Kasih", "Udah", "Selalu", "Jadi", "Pelengkap", "Hidupku", "Ya", "❤️"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Ziiziieee Sayangku",
    sender: "Taraka",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: About You - The 1975",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 24th Birthday,",
    heroLine2: "Ziiziieee Sayangku ❤️",
    heroSubtitle: "Merayakan hari lahirmu, sosok yang datang melengkapi hidupku dan menjadikannya jauh lebih indah.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "making the world a better place since",
    timeStartDate: "2002-07-23",

    introPreTitle: "a letter from the heart",
    introHeadline1: "Untuk",
    introHeadline2: "Ziiziieee",
    introHeadline3: "Tersayang",
    introText: [
      "Makasih udah hadir disaat dulu aku enggak percaya akan ada yang melengkapi hidupku lebih baik lagi dari sebelumnya.",
      "Kata-kata sederhana seperti “tolong, maaf, terimakasih” yang selalu kamu ucapkan, bener-bener menggambarkan betapa indahnya hatimu dari dalam.",
      "Terimakasih sudah selalu mendukung dan menemani aku sejauh ini, and I hope you will stay with me even further.",
      "Selamat bertambah usia sayangku. Semoga dengan bertambahnya usiamu ini, semakin bertambah juga hal-hal baik yang sudah kamu punya.",
      "Dan pastinya, semoga rasa sayang kamu ke aku juga semakin bertambah seiring berjalannya waktu."
    ],
    introSignOff: "With love, Taraka",

    reasonsTitle1: "6 Hal Tentang",
    reasonsTitle2: "Kita",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ memori indah ✨",
    reasons: [
      {
        icon: "✨",
        title: "Waktu Pertama Hadir",
        desc: "Momen saat kamu datang dan ngebuktiin kalau masih ada seseorang yang bisa ngelengkapi hidupku."
      },
      {
        icon: "💬",
        title: "The Simple Words",
        desc: "Hal-hal kecil kayak kamu bilang tolong, maaf, dan makasih yang selalu ngingetin aku betapa cantiknya hatimu."
      },
      {
        icon: "🤍",
        title: "Your Endless Support",
        desc: "Makasih ya udah nemenin dan terus jadi support system aku sampai sejauh ini."
      },
      {
        icon: "🚀",
        title: "Our Next Chapter",
        desc: "Aku nggak sabar ngelewatin lebih banyak momen dan melangkah jauh lebih panjang lagi sama kamu."
      },
      {
        icon: "🌟",
        title: "The Good Things",
        desc: "Harapanku biar semua hal baik yang ada di diri kamu sekarang, bisa terus bertambah setiap harinya."
      },
      {
        icon: "🥰",
        title: "Growing Love",
        desc: "Semoga rasa sayang di antara kita juga terus membesar seiring bertambahnya usia kamu."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "I love you always, Ziiziieee ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Sekali lagi selamat ulang tahun, Ziiziieee sayangku. Terima kasih udah jadi pelengkap hidupku yang paling sempurna. Semoga hari ini dan seterusnya, kamu selalu dikelilingi kebahagiaan. You truly mean the world to me. ❤️",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Ziiziieee Sayangku",
    customerName: customerName,
    theme: "blush-pink",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
