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
  const orderId = 'ORD-MRG5H56N';
  const slug = 'auto-39102011';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "Di", "Sini", "Bersamamu", "Adalah", "Tempat", "Terbaik", "Untuk",
    "Menghabiskan", "Segala", "Waktu", "Dalam", "Hidup", "Ini", "Sayang"
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
    musicUrl: "https://www.youtube.com/watch?v=s9NoBV_7yVI", // Bukti - Virgoun

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Sayang",
    gateSubtitle: "Dari seseorang yang sangat mencintaimu",
    gateButtonText: "Buka Pesan",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Sayang",
    heroSubtitle: "Sedikit hadiah untuk merayakan momen indah ini, karena kamu pantas untuk dirayakan hari ini dan setiap harinya.",

    timeEnabled: true,
    timeTitle: "Our Journey",
    timeSubtitle: "Menghitung setiap detik indah yang telah kita lewati bersama.",
    timeStartDate: "2025-07-16", // 1 year ago

    introIcons: ["✨", "🤍", "🌸"],
    introPreTitle: "SEBUAH PESAN UNTUKMU",
    introHeadline1: "Selamat",
    introHeadline2: "Satu Tahun",
    introText: [
      "Sayang, satu tahun bersamamu berlalu begitu cepat, seolah baru kemarin kita memulai kisah ini.",
      "Semuanya terasa begitu singkat, karena di dekatmu, aku selalu menemukan tempat paling nyaman untuk berpulang.",
      "Entah mengapa, bersamamu waktu selalu terasa kurang. Dan rasanya... aku tak ingin kisah indah ini pernah menemui akhirnya."
    ],
    introSignOff: "Penuh rindu dan cinta,\nHafizzah Haura",

    reasonsTitle1: "The Reason",
    reasonsTitle2: "I Love You",
    reasons: [
      { title: "Kenyamanan", desc: "Berada di sisimu membuatku mengerti apa arti rumah yang sesungguhnya." },
      { title: "Waktu Yang Cepat", desc: "Satu tahun terasa bagai satu hari; bukti betapa indahnya menghabiskan waktu bersamamu." },
      { title: "Hadirmu", desc: "Kamu adalah 'bukti' yang paling nyata atas segala doa yang pernah aku panjatkan." },
      { title: "Senyummu", desc: "Melihatmu tersenyum selalu menjadi hal favoritku di penghujung hari." },
      { title: "Segala Tentangmu", desc: "Bahkan pada hal-hal kecil, kamu selalu berhasil membuatku jatuh cinta berkali-kali." },
      { title: "Cerita Kita", desc: "Aku ingin mengukir lebih banyak cerita lagi, esok, nanti, dan selamanya." }
    ],

    galleryTitle1: "Jejak Kenangan",
    galleryTitle2: "Yang Tersimpan",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "sebuah kenangan manis hanya untukmu 🤍",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy",
    closingTitle2: "Anniversary",
    closingParagraph: "Selamat hari jadi yang pertama sayang! Aku mungkin tidak pandai merangkai kata, namun ketahuilah bahwa kamu sangat berarti buatku. Apapun yang terjadi, aku bakal selalu ada buat kamu.",
    celebrateBtnText: "celebrate ✨",
    sender: "Hafizzah Haura",
  };

  const draftData = {
    orderId: orderId,
    moment: "Anniversary (2026-07-16)",
    recipientName: "Sayang",
    specialDate: "2026-07-16",
    relationship: "Pasangan",
    theme: "midnight-blue",
    metaphor: "Seasons (4 Musim)",
    musicOption: "Request: Bukti virgoun",
    writingTone: "Puitis",
    message: "Sama  ayang itu, satu tahun itu rasanya kayak satu hari. Cepet, nyaman, dan gak mau selesai”😂",
    deadline: "Kamis, 16 Juli 2026 pukul 16.13",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Hafizzah haura to Sayang`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
