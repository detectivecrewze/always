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
  const orderId = 'ORD-MRGATUS6';
  const slug = 'auto-3010210201';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "You", "Are", "My", "Favorite", "Place", "To", "Go",
    "When", "My", "Mind", "Searches", "For", "Peace"
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
    theme: "ocean-breeze",
    musicUrl: "https://www.youtube.com/watch?v=ucRVDoFkcxc", // Nothing - Bruno Major (Team chosen)

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Aky",
    gateSubtitle: "Dari yang sangat menyayangimu",
    gateButtonText: "Buka Pesan",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Aky",
    heroSubtitle: "Sedikit hadiah untuk merayakan momen indah ini, karena kamu pantas untuk dirayakan hari ini dan setiap harinya.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu telah membawamu sejauh ini, mengukir kisah indah di setiap langkahmu.",
    timeStartDate: "2008-07-21",

    introIcons: ["✨", "🤍", "🌊"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "18th Birthday",
    introText: [
      "Terima kasih karena selalu sabar menghadapi Keyca. Terima kasih karena selalu mengusahakan segala kemauan Keyca, sekecil apapun itu, hanya untuk melihatku bahagia.",
      "Ketulusan sayangmu dan kehadiranmu yang selalu bareng sama Key di setiap saat, adalah anugerah terindah yang pernah kumiliki.",
      "Semoga di usiamu yang bertambah ini, kamu selalu dikelilingi kebahagiaan dan segala impianmu terwujud. Key akan selalu ada bersamamu."
    ],
    introSignOff: "Penuh cinta,\nKeyca",

    reasonsTitle1: "The Reason",
    reasonsTitle2: "I Love You",
    reasons: [
      { title: "Your Infinite Patience", desc: "Terima kasih sudah selalu sabar dan memberikan ruang yang nyaman untuk Keyca." },
      { title: "Your Endless Effort", desc: "Kamu selalu berusaha mewujudkan apapun kemauan Keyca, membuatku merasa begitu spesial." },
      { title: "Your Sincere Love", desc: "Cinta dan sayangmu selalu bisa kurasakan di setiap hal kecil yang kamu lakukan." },
      { title: "Your Constant Presence", desc: "Terima kasih karena selalu ada, selalu meluangkan waktu bareng sama Keyca di setiap keadaan." },
      { title: "Your Kindness", desc: "Kebaikan hatimu adalah salah satu alasan kenapa Keyca jatuh cinta." },
      { title: "You Are You", desc: "Keyca menyayangimu karena kamu adalah dirimu sendiri, hari ini, esok, dan selamanya." }
    ],

    galleryTitle1: "Beautiful Moments",
    galleryTitle2: "We've Shared",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "a special memory just for you 🤍",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Aky",
    closingParagraph: "Selamat ulang tahun yang ke-18! Aku mungkin jarang merangkai kata, tapi ketahuilah bahwa kamu sangat berarti buatku. Apapun yang terjadi, aku bakal selalu ada buat kamu.",
    celebrateBtnText: "selamat ulang tahun ✨",
    sender: "Keyca",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-18)",
    recipientName: "aky",
    specialDate: "2008-07-21",
    relationship: "Pasangan",
    theme: "ocean-breeze",
    metaphor: "Flowers (Bunga)",
    musicOption: "Let Team Decide (Random)",
    writingTone: "Puitis, Title Full English",
    message: "makasi ya uda selalu sabar sama key, selalu ngeusahain kemauan key, selalu sayang sama key, selalu bareng sama key",
    deadline: "Rabu, 15 Juli 2026 pukul 16.30",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for keyca to aky`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
