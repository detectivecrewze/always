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
  const orderId = "ORD-MRH5A8YG";
  const slug = "auto-ma5ucxr";
  
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "Happy",
    "19th",
    "Birthday",
    "To",
    "My",
    "One",
    "And",
    "Only",
    "Precious",
    "Amorcito",
    "I",
    "Love",
    "You",
    "Forever"
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
    theme: "vintage-burgundy",
    
    // FILL_MANUALLY as per instructions
    music: {
      file: "FILL_MANUALLY: Risk it all - Bruno Mars", 
      title: "Risk it all",
      artist: "Bruno Mars"
    },

    heroPreTitle: "A SPECIAL GIFT",
    heroLine1: "To My Precious,",
    heroLine2: "Amorcito",
    heroSubtitle: "Sebuah perayaan kecil untuk hadirmu yang begitu bermakna. Karena kamu pantas untuk dirayakan pada hari ini, esok, dan selamanya cintaku.",

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Amorcito",
    gateSubtitle: "untuk merayakan hari spesialmu",
    recipient: "Amorcito",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Tumbuh menjadi versi terbaik dari dirimu",
    timeStartDate: "2007-07-13",

    introIcons: ["🎂", "🤍", "✨"],
    introPreTitle: "TO MY BABE",
    introHeadline1: "Selamat",
    introHeadline2: "Ulang",
    introHeadline3: "Tahun",
    introText: [
      "Happy birthday to u cintakuu! Selamat bertambah usia bb, di umur yang ke 19 inii semoga kamu menjadi seseorang yang selalu ingin tumbuh lebih baik buat diri sendiri dan orang lain yaa babe 🤍",
      "Ternyata ngga kerasa yaa kitaa uda 2 tahunn bersamaa! Dua tahunn kitaa merayakann barengg dann memperbaikii hubungan terus meneruss, and hopefully it will always be like that, it will never leave my life again cintakuu 🤍🤍",
      "My wish for you on your birthday; whatever you ask may you receive, whatever you are looking for may you find it, whatever you want may it be fulfilled on your birthday.",
      "I hope you will walk on this journey knowing that you are mine baby, I hope even if things sometimes don't go your way you won't stop trying, you won't give up on yourself.",
      "And in your last days, I hope you will remind yourself From this word 'you deserve better, you deserve to be loved and celebrated in any way!!'",
      "I really hope and pray for you, may you continue to be given health, abundance, surrounded by good and useful people, my love ✨",
      "Aku akan jadii seseorang yang selaluu bangga sama kamu babe, kalo kamu butuh hal 'apapun' itu jangan lupa hubungi aku okay.. i will always endeavour for that 🌿✨"
    ],
    introSignOff: "With love, Gisel",

    reasonsTitle1: "2 Tahun",
    reasonsTitle2: "Bersama",
    reasons: [
      {
        title: "Dua Tahun Kita",
        desc: "Ngga kerasa kita udah 2 tahun bersama, saling merayakan dan memperbaiki hubungan terus menerus."
      },
      {
        title: "Selalu Bersama",
        desc: "Hopefully it will always be like that, never leave my life again cintakuu 🤍"
      },
      {
        title: "Harapanku Untukmu",
        desc: "Whatever you ask may you receive, and whatever you are looking for may you find it."
      },
      {
        title: "Milikku Seutuhnya",
        desc: "Walk on this journey knowing that you are mine baby. Please don't ever give up on yourself."
      },
      {
        title: "Pantas Dirayakan",
        desc: "You deserve to be loved and celebrated in any way! May you always be surrounded by good people ✨"
      },
      {
        title: "Selalu Bangga",
        desc: "Aku selalu bangga sama kamu. Kalo butuh apapun hubungi aku ya, i will always endeavour for that 🌿"
      }
    ],

    galleryTitle1: "Our",
    galleryTitle2: "Memories",
    photos: photos,

    closingPreTitle: "ON YOUR SPECIAL DAY",
    closingTitle1: "Happy",
    closingTitle2: "19th Birthday",
    closingParagraph: "I hope you remind yourself that you deserve better, you deserve to be loved and celebrated in any way! May you continue to be given health and abundance, my love ✨",
    sender: "Gisel",
    celebrateBtnText: "celebrate ✨",
    closingLine: "Selalu di sini untukmu.",
    
    secretPhoto: secretPhoto,
    secretCaption: "Happy 19th birthday, cintaku 🤍"
  };

  const draftMetadata = {
    slug: slug,
    theme: "vintage-burgundy",
    recipient: "amorcito",
    sender: "Gisel",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await cfPut(`gift:${slug}`, giftData);
  await cfPut(`draft:${slug}`, draftMetadata);
  
  // Ubah status order menjadi done
  if (order) {
    order.status = 'done';
    order.updatedAt = new Date().toISOString();
    await cfPut(`order:${orderId}`, order);
    console.log(`✅ Marked order ${orderId} as done`);
  }
}

main().catch(console.error);
