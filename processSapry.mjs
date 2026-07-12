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
  const orderId = "ORD-MRGXWMIP";
  const slug = "auto-c80dlx0";
  
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "Happy",
    "20th",
    "Birthday",
    "To",
    "The",
    "Most",
    "Beautiful",
    "Girl,",
    "I'm",
    "So",
    "Lucky",
    "To",
    "Have",
    "You"
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
    theme: "blush-pink",
    
    music: {
      file: "FILL_MANUALLY: About You - The 1975", 
      title: "About You",
      artist: "The 1975"
    },

    heroPreTitle: "A SPECIAL GIFT",
    heroLine1: "To My Beautiful,",
    heroLine2: "Yutiza",
    heroSubtitle: "Sebuah perayaan kecil untuk hadirmu yang selalu membuatku merasa beruntung.",

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Yutiza",
    gateSubtitle: "untuk merayakan usiamu yang ke-20",
    recipient: "Yutiza",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu yang telah membawamu sejauh ini menjadi wanita yang luar biasa.",
    timeStartDate: "2006-08-05", // Fixed year: 2026 - 20 = 2006

    introIcons: ["🌸", "✨", "🎂"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "20th",
    introHeadline3: "Birthday",
    introText: [
      "Makasi ya udah mau bertahan sama aku. Perjalanan kita mungkin ngga selalu mudah, tapi kesabaranmu sangat berarti buatku.",
      "Aku cuma mau bilang kalau aku beruntung banget punya kamu. Having you by my side is truly a blessing I will always cherish.",
      "Jangan nakal-nakal ya kalau ngga ada aku. Jaga diri kamu baik-baik di sana, and always remember that my heart is always with you.",
      "Aku tunggu kamu balik ke Samarinda ya sayang. I can't wait to see you again and make more beautiful memories together."
    ],
    introSignOff: "With all my love,\nSapry",

    reasonsTitle1: "The Beautiful",
    reasonsTitle2: "Flowers",
    reasons: [
      {
        title: "Endless Gratitude",
        desc: "Makasih ya udah mau bertahan sama aku, you truly mean everything to me."
      },
      {
        title: "My Greatest Luck",
        desc: "Aku selalu ngerasa beruntung banget bisa punya kamu in my life."
      },
      {
        title: "Distance Between Us",
        desc: "Walau jarak memisahkan kita sementara, my heart always stays with you."
      },
      {
        title: "Be Good My Love",
        desc: "Jangan nakal-nakal ya kalau ngga ada aku, keep being the sweet girl I love."
      },
      {
        title: "Waiting For You",
        desc: "Aku akan selalu setia nungguin kamu balik ke Samarinda ya sayang."
      },
      {
        title: "Forever Yours",
        desc: "No matter how far you are, perasaanku akan selalu menetap untukmu."
      }
    ],

    galleryTitle1: "You Are",
    galleryTitle2: "Beautiful",
    photos: photos,
    
    secretPhoto: secretPhoto,
    secretTitle: "A Little Secret",
    secretCaption: "Terima kasih sudah lahir dan jadi wanita paling berharga buatku. I miss you.",

    closingTitle1: "See You",
    closingTitle2: "Soon",
    closingText: "Enjoy your 20th birthday, Yutiza. May your days be as beautiful as you are. Cepat pulang ke Samarinda ya.",
    celebrateBtnText: "miss you ✨"
  };

  const draft = {
    orderId,
    slug,
    customerName: "Sapry",
    recipientName: "Yutiza",
    createdAt: new Date().toISOString(),
    status: "done",
    isDraft: true
  };

  await cfPut(`gift:${slug}`, giftData);
  await cfPut(`draft:${slug}`, draft);
}

main();
