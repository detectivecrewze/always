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
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function cfSet(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  return res.ok;
}

async function run() {
  const orderId = 'ORD-MRGAT1GA';
  const slug = 'auto-50102101';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "I", "Am", "Worthy", "I", "Am", "Loved", "I", 
    "Am", "Enough", "And", "I", "Will", "Bloom", "Beautifully"
  ];

  // Fetch actual uploaded photos from the order
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const photos = [];
  for (let i = 0; i < 14; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  // Fetch actual secret photo from the order
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    theme: "blush-pink",
    musicUrl: "https://www.youtube.com/watch?v=sgk7L4I0v_M", // Juliet - Jvke

    gatePreTitle: "A SPECIAL MESSAGE FOR",
    gateTitle: "Myself",
    gateSubtitle: "A reminder to love myself unconditionally",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Beautiful Self",
    heroSubtitle: "Sebuah pesan pengingat betapa berharganya perjalanan ini, karena kamu pantas diapresiasi hari ini dan setiap harinya.",

    timeEnabled: true,
    timeTitle: "My Journey",
    timeSubtitle: "Menghitung setiap jejak langkah dan seberapa jauh aku telah tumbuh.",
    timeStartDate: "2003-07-25",

    introIcons: ["✨", "🤍", "🌸"],
    introPreTitle: "A LETTER TO MYSELF",
    introHeadline1: "Dear",
    introHeadline2: "Beautiful Self",
    introText: [
      "Dear me, mulai hari ini aku janji mau lebih sayang sama kamu. I choose me. Aku janji berhenti ngebandingin kamu sama orang lain.",
      "Aku janji mau dengerin kamu pas capek, mau peluk kamu pas gagal, dan mau bangga sama kamu pas berhasil sekecil apapun.",
      "Thank you for not giving up. Thank you for healing, for learning, for growing in silence. Kamu hebat karena tetap jalan, walaupun kadang jalannya pelan banget.",
      "Self love itu bukan tentang sempurna, tapi tentang bilang: 'Aku terima kamu, dengan semua luka dan prosesnya.' Dan aku milih untuk terus ada buat kamu."
    ],
    introSignOff: "With all my love,\nLisa Putri Aulia",

    reasonsTitle1: "Promises",
    reasonsTitle2: "To Myself",
    reasons: [
      { title: "I Am Worthy", desc: "Tidak peduli apa kata dunia, I am always worthy of love, happiness, and peace." },
      { title: "I Am Resilient", desc: "Terima kasih sudah tidak pernah menyerah, terus berjalan maju meskipun terkadang pelan." },
      { title: "I Am Growing", desc: "Older, wiser, and still learning to bloom. I'm so proud of how far we've come." },
      { title: "I Choose Me", desc: "Mulai hari ini, aku berjanji untuk selalu mengutamakan, merawat, dan menyayangi diriku sendiri." },
      { title: "Unconditional Acceptance", desc: "Aku menerimamu seutuhnya, dengan segala luka, kekurangan, dan seluruh proses penyembuhanmu." },
      { title: "I Am Enough", desc: "Ingatlah selalu: You are worthy, you are loved, and you are enough just the way you are." }
    ],

    galleryTitle1: "Chapters Of",
    galleryTitle2: "My Growth",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "a special memory of my beautiful journey ✨",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy",
    closingTitle2: "Birthday!",
    closingParagraph: "25.07.2003. Hari dimana kamu pertama kali hadir ke dunia. For today, kita rayain diri sendiri dulu ya. Makan kue, ketawa, dan mari terus mekar menjadi versi terbaik dari diri kita.",
    celebrateBtnText: "celebrate ✨",
    sender: "Lisa Putri Aulia",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah",
    recipientName: "this one is for me",
    specialDate: "2003-07-25",
    relationship: "Lainnya",
    theme: "blush-pink",
    metaphor: "Flowers (Bunga)",
    musicOption: "Request: Juliet from jvke",
    writingTone: "Puitis, Santai, Indoglish, Title Full english",
    message: "Dear me, Mulai hari ini aku janji mau lebih sayang sama kamu...",
    deadline: "Minggu, 12 Juli 2026 pukul 09.00",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Lisa Putri Aulia to herself`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
