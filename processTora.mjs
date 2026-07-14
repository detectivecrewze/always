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
  const orderId = 'ORD-MRGI1G1R';
  const slug = 'auto-301021012';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "You", "Are", "The", "Reason", "For", "My", "Happiness",
    "And", "The", "Light", "Of", "My", "Entire", "Life"
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
    musicUrl: "https://www.youtube.com/watch?v=GhQxrCrVSyw", // Until I Found You - Stephen Sanchez

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Cumy",
    gateSubtitle: "From the one who truly loves you",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Beautiful Cumy",
    heroSubtitle: "A little something to celebrate this beautiful milestone, because you deserve to be celebrated today and every single day.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Every year of your life has shaped the incredible person you are today.",
    timeStartDate: "2004-07-30",

    introIcons: ["✨", "🤍", "🌸"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "22nd Birthday",
    introText: [
      "Happy 22nd birthday to my beautiful Cumy. Today is officially my favorite day of the year.",
      "Because today, the world welcomed the presence of someone like you, someone who would eventually change my life forever.",
      "You are now the reason for my happiness, the brightest light in my darkest days, and the very best part of my life.",
      "I hope this new age brings you endless joy, peace, and everything your beautiful heart desires. I love you."
    ],
    introSignOff: "With all my heart,\nTora Fernanda",

    reasonsTitle1: "The Reasons",
    reasonsTitle2: "I Adore You",
    reasons: [
      { title: "My Favorite Day", desc: "Today is my favorite day, because it's the day the universe decided to bring you into this world." },
      { title: "My True Happiness", desc: "You have become the center of my joy and the very reason for my absolute happiness." },
      { title: "Your Presence", desc: "Your presence alone is enough to light up my darkest days and bring peace to my mind." },
      { title: "A Beautiful Soul", desc: "You possess a beautiful soul that makes me fall in love with you more and more each passing day." },
      { title: "My Everything", desc: "You are my world, my love, my best friend, and everything I could ever ask for." },
      { title: "A Promise", desc: "I promise to always be the one who stands by your side, celebrating you today and every single day." }
    ],

    galleryTitle1: "Beautiful Moments",
    galleryTitle2: "We've Shared",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "a special memory just for you 🤍",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy Birthday",
    closingTitle2: "My Love",
    closingParagraph: "Happy 22nd birthday! I might not say it often, but you mean the world to me. No matter what happens, I'll always have your back.",
    celebrateBtnText: "celebrate ✨",
    sender: "Tora Fernanda",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-22)",
    recipientName: "Reva Almazumy (Cumy🦑)",
    specialDate: "2004-07-30",
    relationship: "Pasangan",
    theme: "blush-pink",
    metaphor: "Flowers (Bunga)",
    musicOption: "Let Team Decide (Random)",
    writingTone: "Puitis, Full English",
    message: "Today is my favorite day, because today the world welcomes the presence of someone like you who is now the reason for my happiness.",
    deadline: "Selasa, 28 Juli 2026 pukul 00.00",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Tora Fernanda`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
