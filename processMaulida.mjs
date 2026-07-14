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

const orderId = 'ORD-MRHQNGCK';
const kvId = 'auto-uuikfm5';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery words: 14 words forming a sentence (matching the 14 photos)
  const words = ["Selamat", "Ulang", "Tahun", "Buat", "Kamu", "Yang", "Paling", "Aku", "Sayang", "Dan", "Cinta", "Di", "Dunia", "Ini"];
  
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
    recipient: "Uchin",
    theme: "vintage-burgundy",
    music: {
      file: "FILL_MANUALLY: team choose",
      title: "Pilihan Tim",
      artist: "Loves Edition"
    },
    
    gateSubtitle: "hadiah spesial buat kamu",
    gateTitle: "Buat Uchin Nyebelin",
    
    heroPreTitle: "selamat ulang tahun",
    heroLine1: "Buat Kesayanganku",
    heroLine2: "Uchin",
    heroSubtitle: "28 tahun perjalanan hidupmu yang luar biasa.",
    
    timeEnabled: true,
    timeTitle: "Perjalanan Hidupmu",
    timeSubtitle: "bersinar sejak",
    timeStartDate: "1998-07-20", // Corrected from 2026-07-20 for 28th birthday
    
    introIcons: ["🎂", "✨", "🤍"],
    introPreTitle: "catatan kecil",
    introHeadline1: "Selamat",
    introHeadline2: "Ulang Tahun",
    introHeadline3: "Ke-28",
    introText: [
      "Selamat ulang tahun yang ke-28, Uchin sayangku! 🎉",
      "Makasih ya udah selalu sayang sama aku, makasih udah jadiin aku satu-satunya di hati kamu. ☺️💕",
      "Makasih banget udah selalu sabar ngadepin sifat egois aku, ngadepin seorang Maulida Hasanah.",
      "Aku bersyukur banget kamu lahir di dunia ini dan mau sayang sama aku.",
      "Makasih kamu udah jadi ucin-nya Maulida yang paling nyebelin tapi paling aku sayang! 🥹",
      "Semoga episode cinta kita ini nggak akan pernah ada habisnya ya. 😃🤍"
    ],
    introSignOff: "Dengan penuh cinta,\nMaulida Gemoy Hasanah",
    
    reasonsTitle1: "Kenapa Aku",
    reasonsTitle2: "Sayang Kamu",
    reasons: [
      {
        title: "Selalu Sayang Aku",
        desc: "Makasih ya sayang udah selalu nunjukin rasa sayang kamu ke aku setiap hari."
      },
      {
        title: "Satu-satunya",
        desc: "Makasih banget udah bikin aku ngerasa jadi satu-satunya di hati kamu."
      },
      {
        title: "Paling Sabar",
        desc: "Makasih udah mau sabar banget ngadepin segala keegoisan seorang Maulida."
      },
      {
        title: "Hadir Di Duniaku",
        desc: "Aku bersyukur banget kamu lahir di dunia ini dan jadi bagian dari hidupku."
      },
      {
        title: "Ucinnya Maulida",
        desc: "Makasih udah jadi ucin yang selalu ada buat maulida, walaupun kadang nyebelin!"
      },
      {
        title: "Cinta Tak Terbatas",
        desc: "Semoga episode cerita cinta kita ini beneran nggak akan pernah ada habisnya ya sayang."
      }
    ],
    
    photos: photos,
    galleryTitle1: "Momen",
    galleryTitle2: "Terindah",
    
    closingPreTitle: "selalu & selamanya",
    closingTitle1: "Selamat Ulang Tahun",
    closingTitle2: "Sayangku",
    closingParagraph: "Selamat ulang tahun yang ke-28 ya sayang. Semoga semua cita-citamu kecapai dan kita bisa ngerayain ulang tahun kamu bareng-bareng terus. Aku sayang banget sama kamu!",
    closingLine: "kesayanganmu,",
    sender: "Maulida",
    celebrateBtnText: "rayain yuk ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "selamat ulang tahun ke-28! 🥂",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "maulida gemoy hasanah😍",
    recipientName: "uchin nyebelin alfian🤍💕",
    deadline: "2026-07-16T18:56",
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
