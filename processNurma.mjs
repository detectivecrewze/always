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

const orderId = 'ORD-MRHT1T8J';
const kvId = 'auto-iekd1m2';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery words: 11 words to match 11 photos
  const words = ["Selamat", "Ulang", "Tahun", "Ke-14", "Clinton", "Sayang", "Semoga", "Kita", "Bisa", "Bareng", "Terus"];
  
  const photos = [];
  // Loop based on actual available photos
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Clinton",
    theme: "vintage-burgundy",
    music: {
      file: "FILL_MANUALLY: Sailor Song - Gigi Perez",
      title: "Sailor Song",
      artist: "Gigi Perez"
    },
    
    gateSubtitle: "hadiah spesial buat kamu",
    gateTitle: "Untuk Clinton",
    
    heroPreTitle: "happy birthday",
    heroLine1: "Buat Kesayanganku",
    heroLine2: "Clinton",
    heroSubtitle: "14 tahun yang penuh cerita seru.",
    
    timeEnabled: true,
    timeTitle: "Cerita Kamu",
    timeSubtitle: "dimulai sejak",
    timeStartDate: "2012-07-15", // Corrected to 2012 to make it exactly 14 years old in 2026
    
    introIcons: ["🎂", "✨", "🤍"],
    introPreTitle: "catatan kecil dari aku",
    introHeadline1: "Happy",
    introHeadline2: "14th",
    introHeadline3: "Birthday",
    introText: [
      "Happy birthday sayangku! 🎉",
      "Semoga kamu panjang umur, sehat selaluu, dan makin sukses yaaa kedepannya.",
      "Eummm... ini pertama kalinya loh aku bisa nemenin kamu ulang tahunn.",
      "Semoga di tahun-tahun berikutnya akuu masih bisaa terus nemenin kamuuu yaaa.",
      "Akuuu sayangg banget sama kamuu, beneran deh.",
      "I hope you always remember me. 🤍"
    ],
    introSignOff: "Penuh cinta,\nNurma Aulia",
    
    reasonsTitle1: "Kenapa Kamu",
    reasonsTitle2: "Spesial",
    reasons: [
      {
        title: "Paling Sayang",
        desc: "Akuuu sayangg banget sama kamuu, pokoknya kamu yang paling the best deh!"
      },
      {
        title: "Momen Pertama",
        desc: "Seneng banget rasanya ini jadi pertama kalinya aku bisa ngerayain ultah kamu bareng."
      },
      {
        title: "Doa Buat Kamu",
        desc: "Semoga semua yang kamu pengen bisa cepet kecapai yaa, amin!"
      },
      {
        title: "Selalu Nemenin",
        desc: "Aku janji bakal terus nemenin kamu di ulang tahun ulang tahun selanjutnya."
      },
      {
        title: "Bikin Happy",
        desc: "Sama kamu tuh bawaannya selalu happy terus, makasih yaa udah ada buat aku."
      },
      {
        title: "Ingat Aku Terus",
        desc: "I hope you always remember me, jangan pernah lupain aku ya sayang!"
      }
    ],
    
    photos: photos,
    galleryTitle1: "Momen",
    galleryTitle2: "Kita",
    
    closingPreTitle: "selalu & selamanya",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Sayang",
    closingParagraph: "Sekali lagi happy birthday yaa Clinton! Semoga hari ini jadi hari yang paling nyenengin buat kamu. Tetep jadi kamu yang aku kenal yaa, I love youu!",
    closingLine: "dari pacarmu,",
    sender: "Nurma",
    celebrateBtnText: "rayain yuk ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "happy 14th birthday! 🥳",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "nurma aulia",
    recipientName: "clinton",
    deadline: "2026-07-15T23:30",
    theme: "vintage-burgundy",
    moment: "Ultah",
    status: "done",
    createdAt: new Date().toISOString()
  };

  await cfSet(`gift:${kvId}`, giftData);
  console.log(`✅ Successfully saved gift:${kvId}`);

  await cfSet(`draft:${kvId}`, draftData);
  console.log(`✅ Successfully saved draft:${kvId}`);
}

processOrder().catch(console.error);
