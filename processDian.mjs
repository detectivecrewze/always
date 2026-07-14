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

const orderId = 'ORD-MRHZ6H4M';
const kvId = 'gift-1783842481219';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery words: 12 words to match 12 photos
  const words = ["Selamat", "Ulang", "Tahun", "Yang", "Ke-23", "Sayangku", "Semoga", "Kamu", "Selalu", "Bahagia", "Sama", "Aku"];
  
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
    recipient: "Sukma",
    theme: "blush-pink",
    music: {
      file: "FILL_MANUALLY: Sampai Jadi Debu - Banda Neira",
      title: "Sampai Jadi Debu",
      artist: "Banda Neira"
    },
    
    gateSubtitle: "sebuah kenangan manis untukmu",
    gateTitle: "Untuk Sukma",
    
    heroPreTitle: "happy birthday",
    heroLine1: "Untuk Kesayanganku",
    heroLine2: "Sukma",
    heroSubtitle: "23 tahun perjalananmu yang indah.",
    
    timeEnabled: true,
    timeTitle: "Perjalanan Hidupmu",
    timeSubtitle: "bersinar sejak",
    timeStartDate: "2003-07-22",
    
    introIcons: ["🎂", "✨", "🤍"],
    introPreTitle: "sebuah catatan kecil",
    introHeadline1: "Happy",
    introHeadline2: "23rd",
    introHeadline3: "Birthday",
    introText: [
      "Happy birthday sayang! 🎉",
      "Semoga tahun ini menjadi lembaran yang jauh lebih baik dari tahun-tahun sebelumnya.",
      "Semoga kamu selalu dikasih panjang umur, sehat terus, dan dilancarkan semua rezekinya.",
      "Aku selalu berdoa supaya kamu dimudahkan dalam segala urusan dan selalu dikelilingi oleh orang-orang baik.",
      "I loved you then, I love you now, and I will always love you.",
      "Selamat ulang tahun yang ke-23, Sukma! 💐"
    ],
    introSignOff: "With love,\nDian",
    
    reasonsTitle1: "Kenangan",
    reasonsTitle2: "Terindah",
    reasons: [
      {
        title: "Kenangan Manis",
        desc: "Setiap detik yang kita lewatin bareng itu selalu jadi kenangan manis buat aku."
      },
      {
        title: "Senyum Manismu",
        desc: "Senyum kamu selalu bisa bikin hari-hariku yang berat jadi terasa lebih ringan."
      },
      {
        title: "Doa Terbaik",
        desc: "Semoga kamu panjang umur, sehat selalu, dan semua urusanmu dipermudah."
      },
      {
        title: "Orang Baik",
        desc: "Kamu pantas untuk selalu dikelilingi sama orang-orang baik yang tulus sayang sama kamu."
      },
      {
        title: "Rezeki Lancar",
        desc: "Semoga pintu rezeki selalu terbuka lebar buat kamu, supaya semua impianmu tercapai."
      },
      {
        title: "I Loved You",
        desc: "Rasa sayangku ke kamu nggak akan pernah pudar, it will always stay the same."
      }
    ],
    
    photos: photos,
    galleryTitle1: "Potret",
    galleryTitle2: "Kenangan",
    
    closingPreTitle: "selalu & selamanya",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Sayangku",
    closingParagraph: "Selamat ulang tahun yang ke-23 ya sayang. Semoga semua doa-doa baik yang aku panjatkan untukmu bisa segera terwujud. Let's make more beautiful memories together!",
    closingLine: "kesayanganmu,",
    sender: "Dian",
    celebrateBtnText: "rayakan ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "selamat ulang tahun ke-23! 🥂",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "dian",
    recipientName: "sukma",
    deadline: "2026-07-22T00:00",
    theme: "blush-pink",
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
