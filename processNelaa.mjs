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
  const orderId = 'ORD-MRGCL42O';
  const slug = 'auto-291020120';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "Terima", "Kasih", "Sudah", "Menjadi", "Bagian", "Termanis", "Dalam",
    "Kisah", "Perjalanan", "Hidupku", "Selama", "Ini", "Sayang", "Kuuu"
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
    musicUrl: "https://www.youtube.com/watch?v=tGv7CUutzqU", // About You - The 1975

    gatePreTitle: "HADIAH SPESIAL UNTUK",
    gateTitle: "Rifaii",
    gateSubtitle: "Dari yang paling menyayangimu",
    gateButtonText: "Buka Pesan",

    heroPreTitle: "DARI LUBUK HATIKU",
    heroLine1: "Teruntuk",
    heroLine2: "Rifaii",
    heroSubtitle: "Sedikit hadiah untuk merayakan momen indah ini, karena kamu pantas untuk dirayakan hari ini dan setiap harinya.",

    timeEnabled: true,
    timeTitle: "Perjalananmu",
    timeSubtitle: "Waktu telah membawamu sejauh ini, mengukir kisah yang luar biasa.",
    timeStartDate: "2005-07-15",

    introIcons: ["✨", "🤍", "🌊"],
    introPreTitle: "SEBUAH PESAN UNTUKMU",
    introHeadline1: "Selamat",
    introHeadline2: "Ulang Tahun",
    introText: [
      "Selamat ulang tahun ya sayangku! Terimakasih udah ada di kehidupan aku selama ini.",
      "Jujur, aku gabisa nebak ending kita berdua bakal gimana nanti, tapi satu hal yang pasti, semoga kita selalu berakhir happy yaa.",
      "Aku bangga banget sama kamu karena udah berhasil bertahan sejauh ini, ngelewatin semuanya.",
      "Yuk, kita terus jalanin semuanya bareng-bareng buat ke tujuan yang sama. I love you sayangg!"
    ],
    introSignOff: "Penuh cinta,\nNelaa cantikk nan lucuh",

    reasonsTitle1: "Alasan Kenapa",
    reasonsTitle2: "Aku Sayang Kamu",
    reasons: [
      { title: "Kehadiranmu", desc: "Terimakasih ya sayang karena udah hadir dan ngasih warna baru di kehidupan aku." },
      { title: "Kebanggaan", desc: "Aku selalu bangga sama kamu karena kamu hebat udah bisa bertahan sejauh ini." },
      { title: "Tujuan Sama", desc: "Rasanya tenang banget karena kita punya tujuan yang sama dan bisa berjuang bareng." },
      { title: "Harapan Bahagia", desc: "Walau gak ada yang tahu endingnya gimana, aku selalu berdoa kita berakhir bahagia." },
      { title: "Perjalanan Kita", desc: "Jalanin hari-hari bareng kamu bikin semuanya terasa lebih seru dan bermakna." },
      { title: "Sayang Banget", desc: "Sederhana aja, aku sayang banget sama kamu dan mau terus ngelewatin waktu sama kamu." }
    ],

    galleryTitle1: "Jejak Kenangan",
    galleryTitle2: "Yang Tersimpan",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "kenangan manis ini spesial buat kamu 🤍",

    closingPreTitle: "SATU HAL LAGI",
    closingTitle1: "Selamat",
    closingTitle2: "Ulang Tahun",
    closingParagraph: "Selamat ulang tahun yang ke-21! Aku mungkin jarang bilang ini, tapi kamu beneran berarti banget buatku. Apapun yang terjadi, aku bakal selalu ada buat kamu.",
    celebrateBtnText: "rayakan ✨",
    sender: "Nelaa cantikk nan lucuh",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-21)",
    recipientName: "rifaii sayangggkuu",
    specialDate: "2005-07-15",
    relationship: "Pasangan",
    theme: "ocean-breeze",
    metaphor: "Flowers (Bunga)",
    musicOption: "Playlist: About You - The 1975",
    writingTone: "Santai",
    message: "Terimakasih ya sayangg karna ada di kehidupan akuu, aku gabisa nebak ending kita gimana tapi semoga happy yaa, aku bangga sama kamu karna uda bertahan sejauh ini, kita jalanin bareng bareng yaa buat ke tujuan yang sama, lovee u sayangg",
    deadline: "Minggu, 12 Juli 2026 pukul 12.00",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Nelaa to Rifaii (Full Indo)`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
