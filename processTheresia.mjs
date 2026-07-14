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
  const orderId = "ORD-MRH9QYSG";
  const slug = "auto-jds7k8o";
  
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "Every",
    "Single",
    "Day",
    "With",
    "You",
    "Is",
    "The",
    "Best",
    "Thing",
    "That",
    "Ever",
    "Happened",
    "To",
    "Me"
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
    
    music: {
      file: "FILL_MANUALLY: I Lay My Love on You - West Life", 
      title: "I Lay My Love on You",
      artist: "West Life"
    },

    heroPreTitle: "A SPECIAL GIFT",
    heroLine1: "To My Favorite,",
    heroLine2: "Marcellino",
    heroSubtitle: "A little celebration for the one who changed everything, completely by accident.",

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Marcellino Sanjaya",
    gateSubtitle: "Untuk merayakan hari bahagiamu",
    recipient: "Marcellino",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu yang telah mengantarkanmu pada usia yang baru.",
    timeStartDate: "2001-07-13",

    introIcons: ["🤍", "🎂", "✨"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "Birthday,",
    introHeadline3: "Sayang",
    introText: [
      "Happy Birthday, my favorite person. 🤍 Happy Birthday, Sayang.",
      "It's funny how life works. We met on HelloTalk completely by accident. We were just two strangers who happened to say 'hi' to each other. Who would have thought that one random conversation would become one of the best things that ever happened to me?",
      "Sekarang kita memang dipisahkan oleh jarak, but somehow you always make me feel close. Mungkin kita belum sering bertemu, hubungan kita juga baru berjalan hampir dua bulan, but every single day with you has shown me that the best things in life are often the ones we never planned.",
      "On your birthday, I pray that God blesses you with good health, endless happiness, peace in your heart, and every dream you're working so hard for. May He guide every step you take and protect you wherever you are.",
      "Thank you for being you. Thank you for choosing us."
    ],
    introSignOff: "Happy Birthday, my love.\nTheresia",

    reasonsTitle1: "The Best",
    reasonsTitle2: "Things",
    reasons: [
      {
        title: "HelloTalk Meeting",
        desc: "We met completely by accident. Just two strangers saying 'hi'."
      },
      {
        title: "Best Accident",
        desc: "One random conversation became the best thing that ever happened to me."
      },
      {
        title: "Close To Me",
        desc: "Kita dipisahkan oleh jarak, but somehow you always make me feel close."
      },
      {
        title: "Beautiful Surprise",
        desc: "Every single day with you has shown me that the best things are often unplanned."
      },
      {
        title: "My Prayers",
        desc: "I pray God blesses you with endless happiness, peace, and every dream you work hard for."
      },
      {
        title: "Choosing Us",
        desc: "Thank you for being exactly who you are, and thank you for choosing us."
      }
    ],

    galleryTitle1: "Our",
    galleryTitle2: "Memories",
    photos: photos,

    closingPreTitle: "ON YOUR SPECIAL DAY",
    closingTitle1: "Happy 25th",
    closingTitle2: "Birthday",
    closingParagraph: "May God guide every step you take and protect you wherever you are. Happy Birthday, my love.",
    sender: "Theresia",
    celebrateBtnText: "celebrate ✨",
    closingLine: "Selalu di sini untukmu.",
    
    secretPhoto: secretPhoto,
    secretCaption: "Happy 25th Birthday, Sayang 🤍"
  };

  const draftMetadata = {
    slug: slug,
    theme: "vintage-burgundy",
    recipient: "Marcellino Sanjaya",
    sender: "Theresia",
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
