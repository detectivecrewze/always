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
  const orderId = "ORD-MRH6V04N";
  const slug = "auto-vjwddp7";
  
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "Makasih",
    "Banyak",
    "Udah",
    "Sabar",
    "Sama",
    "Aku",
    "Dan",
    "Buat",
    "Aku",
    "Selalu",
    "Bahagia",
    "Sama",
    "Kamu",
    "Sayang"
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
    heroLine2: "Sayangku",
    heroSubtitle: "Sebuah perayaan kecil untuk hadirmu yang begitu bermakna, karena kamu pantas dirayakan.",

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Sayangku",
    gateSubtitle: "untuk merayakan hari spesialmu",
    recipient: "Sayangku",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu yang telah membawamu sejauh ini.",
    // Dikoreksi dari 2026-10-10 menjadi 2007-10-10 (Ulang tahun ke-19)
    timeStartDate: "2007-10-10",

    introIcons: ["🤍", "✨", "🌙"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "Birthday,",
    introHeadline3: "Sayangku",
    introText: [
      "Makasih banyak ya udah sabar sama aku dan buat aku bahagia sama kamu.",
      "Ada kamu rasanya hari-hari ku kek berwarna, selalu buat aku ketawa setiap sama kamu.",
      "And maaf ya selalu keras kepala sama kamu.",
      "Tambah usia tambah sukses ya sayang."
    ],
    introSignOff: "With all my love,\nKadir",

    reasonsTitle1: "The Best",
    reasonsTitle2: "Things",
    reasons: [
      {
        title: "My Happiness",
        desc: "Makasih banyak ya udah sabar sama aku dan selalu buat aku bahagia."
      },
      {
        title: "Colorful Days",
        desc: "Ada kamu rasanya hari-hariku jadi lebih berwarna dari sebelumnya."
      },
      {
        title: "Your Smile",
        desc: "Kamu selalu berhasil buat aku tertawa bahagia di setiap momen kita bersama."
      },
      {
        title: "My Apology",
        desc: "Maaf ya kalau aku masih sering keras kepala sama kamu, I'm trying to be better."
      },
      {
        title: "Growing Together",
        desc: "Semoga di usiamu yang baru ini, setiap langkahmu selalu dipenuhi dengan keberkahan."
      },
      {
        title: "More Success",
        desc: "Tambah usia, tambah sukses ya sayang. I will always be here to support you."
      }
    ],

    galleryTitle1: "Our",
    galleryTitle2: "Memories",
    photos: photos,

    closingPreTitle: "ON YOUR SPECIAL DAY",
    closingTitle1: "Happy 19th",
    closingTitle2: "Birthday",
    closingParagraph: "Semoga Allah selalu menjagamu dan mengabulkan setiap impianmu. Happy Birthday, Sayangku 🤍",
    sender: "Kadir",
    celebrateBtnText: "celebrate ✨",
    closingLine: "Selalu di sini untukmu.",
    
    secretPhoto: secretPhoto,
    secretCaption: "Tambah Usia Tambah Sukses, Sayang 🤍"
  };

  const draftMetadata = {
    slug: slug,
    theme: "midnight-blue",
    recipient: "Sayangku",
    sender: "Kadir",
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
