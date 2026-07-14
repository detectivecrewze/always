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
  const orderId = 'ORD-MRGEPYY1';
  const slug = 'auto-940201';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "Thank", "You", "For", "Every", "Memory", "We", "Made",
    "Even", "Though", "It", "Was", "Just", "A", "While"
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
    theme: "midnight-blue",
    musicUrl: "https://www.youtube.com/watch?v=y_foL31LnYo", // menari nari - raim laode

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Ezarrr",
    gateSubtitle: "Dari seseorang yang pernah ada",
    gateButtonText: "Buka Pesan",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Ezarrr",
    heroSubtitle: "Sedikit hadiah untuk merayakan momen ini, sebagai penanda bahwa kamu selalu pantas dirayakan.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu yang membawamu tumbuh, beserta cerita yang pernah bersinggungan denganku.",
    timeStartDate: "2011-07-31",

    introIcons: ["✨", "🤍", "🥀"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "15th Birthday",
    introText: [
      "Halooo Ezarrr! Happy birthday yaa, wish you all the best and semoga bahagia selalu.",
      "Thank you for being a part of my life. Walaupun waktu kita bareng ngga terlalu lama, tapi momen itu berharga banget buat aku.",
      "Jujur, aku nggak nyangka kamu secepat itu nemuin penggantiku pas kita cuma nggak chatan sehari. Mungkin emang bukan aku orang yang kamu cari.",
      "Tapi gapapa, empat tahun kita saling nyari kabar bakal jadi cerita manis. Be happy and see you next time yaa!"
    ],
    introSignOff: "With a bittersweet smile,\nAttuu",

    reasonsTitle1: "A Few Things",
    reasonsTitle2: "I Want To Say",
    reasons: [
      { title: "Our Time Together", desc: "Terima kasih udah nemenin aku. Sekecil apapun waktunya, it truly means a lot to me." },
      { title: "The Surprise", desc: "Sempat bingung dan kaget kamu secepat itu nemu yang baru, padahal kita baru sehari nggak ngobrol." },
      { title: "4 Years of Us", desc: "Empat tahun kebelakang kita selalu saling nyari kabar, sebuah kebiasaan yang susah buat dilupain gitu aja." },
      { title: "Different Paths", desc: "Mungkin pada akhirnya, the one you truly want is not me, dan aku harus ikhlas ngelepasnya." },
      { title: "Don't Forget Me", desc: "Satu pesanku: tolong jangan pernah lupain aku ya. Aku nggak akan lupain kamu." },
      { title: "In Another Life", desc: "Kalau ada kehidupan kedua nanti, awas aja kalo kamu nggak milih aku lagi!" }
    ],

    galleryTitle1: "Memories We",
    galleryTitle2: "Left Behind",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "our unsent goodbyes 🤍",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Ezarrr",
    closingParagraph: "Selamat ulang tahun yang ke-15. Walau sekarang jalannya udah beda, aku harap kamu selalu nemuin kebahagiaan kamu di sana. Babaiii Ezarrr...",
    celebrateBtnText: "goodbye ✨",
    sender: "Attuu",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-15)",
    recipientName: "ezarrr",
    specialDate: "2011-07-31",
    relationship: "Lainnya",
    theme: "midnight-blue",
    metaphor: "Keepsakes (Kenangan)",
    musicOption: "Request: menari nari - raim laode",
    writingTone: "Santai, Puitis, Indoglish",
    message: "halooo ezarrr, makasi yaa udaa nemenin akuu meski waktu kita ga lama tapii...",
    deadline: "Senin, 20 Juli 2026 pukul 20.34",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for attuu to ezarrr`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
