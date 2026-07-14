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
  const orderId = 'ORD-MRG1Z7KI';
  const slug = 'auto-90031201';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "You", "Are", "My", "Favorite", "Person", "To", "Share",
    "Every", "Precious", "Moment", "In", "My", "Life", "Love"
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
    musicUrl: "https://www.youtube.com/watch?v=GxldQ9eX2wo", // Until I Found You - Stephen Sanchez

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Latif Love",
    gateSubtitle: "From someone who secretly adores you",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Latif",
    heroSubtitle: "Sedikit hadiah untuk merayakan momen indah ini, karena kamu pantas untuk dirayakan hari ini dan setiap harinya.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Every year of your life has shaped the incredible person you are today.",
    timeStartDate: "2005-07-20",

    introIcons: ["🎉", "✨", "🤍"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "21st Birthday",
    introText: [
      "Hai sayang, selamat ya kamu udah 21 tahun sekarang, which means kamu udah berhasil ngelewatin masa-masa 20 tahun kamu dengan hebat.",
      "Semoga di umur ke 21 ini kamu bisa lebih meng-handle diri kamu sendiri jadi lebih baik lagi.",
      "Maaf ya mungkin kadang kamu ngerasa dicintai sama aku (Tika) agak berbeda. Keliatannya cuek dan nggak bucin...",
      "Tapi aslinya, deep down aku takut banget kehilangan kamu. I miss you so much, lovee!"
    ],
    introSignOff: "With all my love,\nTika",

    reasonsTitle1: "The Reason",
    reasonsTitle2: "I Love You",
    reasons: [
      { title: "Your Strength", desc: "Bangga banget liat kamu bisa ngelewatin semua hal sampai di titik ini." },
      { title: "Your Independence", desc: "Semoga di umur baru ini kamu makin bisa handle diri kamu sendiri dengan baik." },
      { title: "Our Connection", desc: "Walaupun kadang aku keliatan cuek, but my love for you is always real." },
      { title: "The Way You Make Me Feel", desc: "Jujur, aslinya aku takut kehilangan kamu karena kamu seberharga itu buat aku." },
      { title: "Your Patience", desc: "Makasih udah mau sabar ngadepin sifat aku yang kadang nggak terlalu nunjukin perasaan." },
      { title: "You're My Favorite", desc: "I miss you lovee, and I'll always be here cheering for you." }
    ],

    galleryTitle1: "Beautiful Moments",
    galleryTitle2: "We've Shared",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "a special memory just for you 🤍",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Latif",
    closingParagraph: "Selamat ulang tahun yang ke-21! Aku mungkin jarang bilang, tapi kamu sangat berarti buatku. Apapun yang terjadi, aku bakal selalu ada buat kamu.",
    celebrateBtnText: "celebrate ✨",
    sender: "Tika",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-21)",
    recipientName: "Latif love",
    specialDate: "2026-07-20", // Kept original input for consistency in Studio
    relationship: "Pasangan",
    theme: "blush-pink",
    metaphor: "Keepsakes (Kenangan)",
    musicOption: "Let Team Decide (Random)",
    writingTone: "Indoglish, Santai, title full english",
    message: "Hai Selamat ya kmu udh 21 tahun yang artinya kamu udh lewati ke 20 tahun. Semoga di umur ke 21 ini kmu bisa meng-handle kn diri kamu sndiri, maaf ya mungkin kamu merasa kn di cintai ama tika aga berbeda yang kliatan cuek ngga bucin aslinya aku takut kehilangan kamu I miss you lovee",
    deadline: "Rabu, 15 Juli 2026 pukul 14.38",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Tika to Latif love`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty (no secret photo uploaded)'}`);
}
run();
