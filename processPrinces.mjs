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
  const orderId = 'ORD-MRGJ1Z72';
  const slug = 'auto-8391021';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "You", "Are", "My", "Favorite", "Place", "To", "Go",
    "When", "My", "Mind", "Searches", "For", "Peace", "Love"
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
    musicUrl: "https://www.youtube.com/watch?v=lB8ASupNtlw", // Everything u are - Hindia

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Dandy",
    gateSubtitle: "From the one who deeply loves you",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Dandy",
    heroSubtitle: "A little something to celebrate this beautiful milestone, because you deserve to be celebrated today and every single day.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Every year of your life has shaped the incredible person you are today.",
    timeStartDate: "2000-07-15",

    introIcons: ["✨", "🤍", "🌊"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "26th Birthday",
    introText: [
      "Hi my love. Exactly today, on July 15th, is the day you were born and today you are turning 26 years old.",
      "Thank you so much for being born into this world, and thank you for surviving and holding on until this very second. I am always so incredibly proud of you.",
      "Happy birthday my love! I wish you a long life, smooth paths in everything you do, endless blessings from God, and I hope you will always love me.",
      "I love you so much, my love. Forever and always."
    ],
    introSignOff: "With all my love,\nPrinces",

    reasonsTitle1: "The Reasons",
    reasonsTitle2: "I Love You",
    reasons: [
      { title: "Your Existence", desc: "Thank you for being born into this world. Your existence is a true blessing to my life." },
      { title: "Your Strength", desc: "Thank you for holding on until this very second. I am always so incredibly proud of you." },
      { title: "Endless Blessings", desc: "I wish you a long life, filled with endless blessings and smooth paths in everything you do." },
      { title: "Our Bond", desc: "I hope you will always love me as much as I love you, today, tomorrow, and forever." },
      { title: "Your Beautiful Heart", desc: "You have such a beautiful soul that makes me fall in love with you more every single day." },
      { title: "You Are Everything", desc: "I love you so much, my love. You are my everything and my greatest happiness." }
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
    closingParagraph: "Happy 26th birthday! I might not say it often, but you mean the world to me. No matter what happens, I'll always have your back.",
    celebrateBtnText: "celebrate ✨",
    sender: "Princes",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-26)",
    recipientName: "Dandy",
    specialDate: "2000-07-15",
    relationship: "Pasangan",
    theme: "ocean-breeze",
    metaphor: "Flowers (Bunga)",
    musicOption: "Playlist: Everything u are - Hindia",
    writingTone: "Full English",
    message: "Hai sayang tepat hari ini tgl 15 jul 2026 hari lahir kamu dan tepat hari ini usia kamu 26 tahun terimakasi yaa sudah lahir di dunia ini dan terimakasi sudah bertahan sampai detik ini aku selalu bangga smaa kamu . Selamat ulang tahun ya sayaang semoga kamu panjang umur rezeki lancar terus segala urusan kmu selalu di perlancar sama tuhan dan selau sayang smaa aku i love you sayang",
    deadline: "Rabu, 15 Juli 2026 pukul 23.35",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Princes to Dandy (Full English)`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
