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
  const orderId = 'ORD-MRGCCUX1';
  // Fallback slug since user didn't specify one
  const slug = 'gift-1783613669187';

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
    theme: "blush-pink",
    musicUrl: "https://www.youtube.com/watch?v=78wrful9cVU", // DROP DEAD OLIVIA

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "My Sweet Love",
    gateSubtitle: "From the one who deeply loves you",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Sweetest",
    heroSubtitle: "A little something to celebrate this beautiful milestone, because you deserve to be celebrated today and every single day.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Every year of your life has shaped the incredible person you are today.",
    timeStartDate: "2006-07-11",

    introIcons: ["✨", "🤍", "🌸"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "20th Birthday",
    introText: [
      "Happy birthday, my sweet and beautiful love. As you step into this new age, I hope you continue to blossom into an even more amazing person.",
      "I wish you a long, healthy life, and may you only grow more adorable and beautiful with each passing day.",
      "Thank you from the bottom of my heart for always being so incredibly patient with me, and for staying by my side through it all.",
      "I love you more than words can say. I pray that our love continues to grow, holding our hands together until the day we say 'I do'."
    ],
    introSignOff: "With all my love,\nAqsha",

    reasonsTitle1: "The Reasons",
    reasonsTitle2: "I Adore You",
    reasons: [
      { title: "Your Infinite Patience", desc: "Thank you for always being so incredibly patient with me through it all." },
      { title: "Your Beautiful Heart", desc: "I hope in this new chapter, you continue to blossom into an even more amazing person." },
      { title: "Your Sweetness", desc: "You somehow manage to grow more adorable, beautiful, and sweet with each passing day." },
      { title: "Your Loyalty", desc: "Thank you for staying by my side and holding my hand when I needed it the most." },
      { title: "Our Future Together", desc: "I pray that our love continues to grow until the day we finally say 'I do'." },
      { title: "My Greatest Blessing", desc: "I love you more than words can say, and I am so grateful to call you mine." }
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
    closingParagraph: "Happy 20th birthday! I might not say it often, but you mean the world to me. No matter what happens, I'll always have your back.",
    celebrateBtnText: "celebrate ✨",
    sender: "Aqsha",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-20)",
    recipientName: "My Pacar🤍🩷",
    specialDate: "2006-07-11",
    relationship: "Pasangan",
    theme: "blush-pink",
    metaphor: "Flowers (Bunga)",
    musicOption: "Request: DROP DEAD OLIVIA",
    writingTone: "Puitis, Full English",
    message: "Selamat ulang tahun ya sayangkuu cintaku manisku...",
    deadline: "Sabtu, 11 Juli 2026 pukul 22.00",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Aqsha to My Pacar`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
