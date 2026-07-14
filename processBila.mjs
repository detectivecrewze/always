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

const CLOUDFLARE_API_TOKEN = env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
const KV_NAMESPACE_ID = env.KV_NAMESPACE_ID;

if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !KV_NAMESPACE_ID) {
  console.error("Missing Cloudflare credentials in .env.local");
  process.exit(1);
}

const KV_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values`;

async function cfGet(key) {
  try {
    const res = await fetch(`${KV_API_URL}/${key}`, {
      headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to GET ${key}: ${res.statusText}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error(`Error reading ${key}:`, err);
    return null;
  }
}

async function cfPut(key, value) {
  try {
    const res = await fetch(`${KV_API_URL}/${key}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value)
    });
    if (!res.ok) {
      throw new Error(`Failed to PUT ${key}: ${res.statusText}`);
    }
    console.log(`✅ Successfully saved ${key}`);
  } catch (err) {
    console.error(`Error writing ${key}:`, err);
  }
}

async function main() {
  const orderId = "ORD-MRHCJM90";
  const slug = "auto-mar4pe2";
  
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "Aku",
    "Sayang",
    "Banget",
    "Sama",
    "Kamu",
    "Lebih",
    "Dari",
    "Yang",
    "Bisa",
    "Aku",
    "Ungkapkan",
    "Dengan",
    "Kata",
    "Kata"
  ];

  const photos = [];
  for (let i = 0; i < 14; i++) {
    photos.push({
      url: orderPhotos[i] || '', 
      caption: words[i] || ''
    });
  }

  const giftData = {
    slug: slug,
    theme: "midnight-blue",
    
    music: {
      file: "FILL_MANUALLY: team choose", 
      title: "Special Song",
      artist: "Chosen by Team"
    },

    heroPreTitle: "A SPECIAL GIFT",
    heroLine1: "To My Precious,",
    heroLine2: "Hubbi 🤍",
    heroSubtitle: "Sebuah perayaan kecil untuk hadirmu yang begitu bermakna, karena kamu pantas dirayakan.",

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "My Hubbi 🤍",
    gateSubtitle: "untuk merayakan hari spesialmu",
    recipient: "My Hubbi 🤍",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu yang telah membawamu sejauh ini menjadi pria hebat.",
    // Dikoreksi dari 2026-07-13 menjadi 2005-07-13 karena ini ulang tahun ke-21
    timeStartDate: "2005-07-13",

    introIcons: ["🤍", "✨", "🌙"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "Birthday,",
    introHeadline3: "Sayanggg",
    introText: [
      "Happy birthday, Sayanggg 🤍",
      "Terima kasih sudah menjadi alasan aku tersenyum setiap hari dan selalu membuat aku merasa punya seseorang yang bisa aku pulang, meski sampai sekarang kita masih dipisahkan oleh jarak, kamu selalu berhasil membuat aku merasa dicintai setiap harinya, aku bersyukur banget dipertemukan sama kamu.",
      "Terima kasih karena sudah hadir di hidup aku dan selalu menjadi seseorang yang bisa bikin aku merasa tenang dan bahagia. Terima kasih karena selalu sabar menghadapi sifat aku, selalu mendengarkan cerita-cerita aku, dan nggak pernah berhenti berusaha untuk hubungan ini.",
      "Semoga di umur yang baru ini Allah selalu menjaga setiap langkahmu, melancarkan semua urusanmu, memberikan kesehatan, kebahagiaan, mengabulkan semua impianmu dan mengabulkan setiap doa yang kamu panjatkan.",
      "Semoga suatu saat nanti kita bisa merayakan ulang tahun ini bersama, tanpa lagi terhalang oleh jarak. Terima kasih sudah bertahan dan tetap memilih aku sampai hari ini. Aku sayang banget sama kamu lebih dari yang bisa aku ungkapkan dengan kata-kata 🤍",
      "Barakallahu fii umrik, Hubbi♥︎ Uhibbuka fillah. 🤍"
    ],
    introSignOff: "With all my love,\nBilaaa",

    reasonsTitle1: "The Best",
    reasonsTitle2: "Things",
    reasons: [
      {
        title: "Alasan Tersenyum",
        desc: "Terima kasih sudah menjadi alasan aku tersenyum setiap hari dan buat aku merasa punya tempat pulang."
      },
      {
        title: "Selalu Dicintai",
        desc: "Meski kita dipisahkan jarak, kamu selalu berhasil membuat aku merasa dicintai setiap harinya."
      },
      {
        title: "Tenang & Bahagia",
        desc: "Terima kasih karena sudah hadir di hidup aku dan bikin aku merasa tenang dan bahagia."
      },
      {
        title: "Kesabaranmu",
        desc: "Terima kasih karena selalu sabar menghadapi sifat aku, dan mendengarkan cerita-ceritaku."
      },
      {
        title: "Tak Pernah Lelah",
        desc: "Bersyukur banget kamu nggak pernah berhenti berusaha untuk mempertahankan hubungan ini."
      },
      {
        title: "Memilih Aku",
        desc: "Terima kasih sudah bertahan dan tetap memilih aku. Aku sayang banget sama kamu 🤍"
      }
    ],

    galleryTitle1: "Our",
    galleryTitle2: "Memories",
    photos: photos,

    closingPreTitle: "ON YOUR SPECIAL DAY",
    closingTitle1: "Happy 21st",
    closingTitle2: "Birthday",
    closingParagraph: "Semoga Allah selalu menjagamu dan mengabulkan setiap doa yang kamu panjatkan. Happy Birthday, Sayanggg 🤍",
    sender: "Bilaaa",
    celebrateBtnText: "celebrate ✨",
    closingLine: "Selalu di sini untukmu.",
    
    secretPhoto: secretPhoto,
    secretCaption: "Barakallahu fii umrik, Hubbi ♥︎"
  };

  const draftMetadata = {
    slug: slug,
    theme: "midnight-blue",
    recipient: "My Hubbi 🤍",
    sender: "Bilaaa",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await cfPut(`gift:${slug}`, giftData);
  await cfPut(`draft:${slug}`, draftMetadata);
  
  if (order) {
    order.status = 'done';
    order.updatedAt = new Date().toISOString();
    await cfPut(`order:${orderId}`, order);
    console.log(`✅ Marked order ${orderId} as done`);
  }
}

main().catch(console.error);
