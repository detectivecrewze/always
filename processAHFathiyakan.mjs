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
  const orderId = 'ORD-MRG1LKOM';
  const slug = 'auto-291010122';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "Di", "Tiap", "Langkah", "Semoga", "Selalu", "Ada", "Cahaya",
    "Yang", "Menuntun", "Hati", "Menuju", "Tenang", "Dan", "Bahagia"
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
    musicUrl: "https://www.youtube.com/watch?v=lB8ASupNtlw", // Everything u are - Hindia

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Dwita",
    gateSubtitle: "Dari yang selalu mendoakanmu",
    gateButtonText: "Buka Surat Ini",

    heroPreTitle: "UNTUK SEBUAH JIWA YANG TABAH",
    heroLine1: "Teruntuk",
    heroLine2: "Dwita",
    heroSubtitle: "Sebuah tulisan kecil untuk merayakan hadirmu di dunia ini, diiringi doa agar senantiasa dihampiri oleh segala hal baik dan bahagia.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu telah membawamu sejauh ini, melewati segala musim dan cerita.",
    timeStartDate: "2005-07-18",

    introIcons: ["✨", "🤍", "🌸"],
    introPreTitle: "SEBUAH PESAN UNTUKMU",
    introHeadline1: "Selamat",
    introHeadline2: "Bertambah Usia",
    introText: [
      "Di depan sana, kamu tidak akan pernah tahu seperti apa. Semoga kamu selalu diberi ruang ikhlas agar hal baik selalu menghampiri dirimu.",
      "Mungkin hidup terlalu banyak memberimu luka yang selalu mampu kamu hadapi.",
      "Semoga tahun-tahun selanjutnya luka itu luruh satu persatu diganti kebahagiaan berlipat untukmu."
    ],
    introSignOff: "Peluk hangat dari jauh,\nAH. Fathi",

    reasonsTitle1: "The Reason",
    reasonsTitle2: "I Love You",
    reasons: [
      { title: "Ketabahanmu", desc: "Aku selalu mengagumi caramu menghadapi segala luka dengan senyuman dan ketegaran." },
      { title: "Kebaikan Hatimu", desc: "Kamu adalah rumah bagi segala hal baik yang pantas kamu dapatkan di dunia ini." },
      { title: "Keikhlasanmu", desc: "Belajar merelakan dari sosokmu adalah pelajaran paling berharga untuk hidupku." },
      { title: "Setiap Tawamu", desc: "Tawamu adalah pengingat bahwa setelah badai pasti ada pelangi yang indah." },
      { title: "Cahayamu", desc: "Kamu selalu bisa menjadi penerang bahkan ketika dunia sedang terasa gelap gulita." },
      { title: "Segalanya Tentangmu", desc: "Aku selalu berdoa agar kebahagiaan berlipat ganda selalu menyertaimu di setiap langkah." }
    ],

    galleryTitle1: "Jejak Kenangan",
    galleryTitle2: "Yang Tersimpan",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "semoga bahagia selalu menjadi milikmu 🤍",

    closingPreTitle: "DOA DI PENGHUJUNG HARI",
    closingTitle1: "Selamat",
    closingTitle2: "Berbahagia",
    closingParagraph: "Teruslah melangkah, sekecil apapun itu. Ingatlah bahwa kamu lebih kuat dari apapun yang pernah berusaha menjatuhkanmu. Selamat merayakan hari kelahiran.",
    celebrateBtnText: "selamat ulang tahun ✨",
    sender: "AH.FATHIYAKAN",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah",
    recipientName: "babyy sayang (dwita)",
    specialDate: "2005-07-18",
    relationship: "Pasangan",
    theme: "blush-pink",
    metaphor: "Flowers (Bunga)",
    musicOption: "Playlist: Everything u are - Hindia",
    writingTone: "Puitis",
    message: "didepan sana kamu tidak akan pernah tahu seperti apa semoga kamu selalu diberi ruang ikhlas agar hal baik selalu menghampiri dirimu \nmungkin hidup terlalu banyak memberimu luka yang selalu mampu kamu hadapi semoga tahun tahun selanjutnya luka itu luruh persatu diganti kebahagiaan berlipat untukmu\n_ah.fathi",
    deadline: "Kamis, 16 Juli 2026 pukul 18.00",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for AH.FATHIYAKAN to babyy sayang (dwita)`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty (no secret photo uploaded)'}`);
}
run();
