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
  return await res.json();
}

async function cfSet(key, value) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(value)
  });
  return res.json();
}

async function processOrder() {
  const kvId = 'auto-zybhhrc';
  const orderId = 'ORD-MS4NNAST';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (15) - Bahasa Inggris (Indoglish rule)
  const words = [
    "Happy",
    "Girlfriend",
    "Day",
    "To",
    "My",
    "Most",
    "Favorite",
    "Person",
    "Who",
    "Brings",
    "Joy",
    "To",
    "My",
    "Life",
    "🤍"
  ];

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: About You - The 1975",
    recipient: "Vivi",
    sender: "Aldrinn",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (DILARANG ADA EMOJI SAMA SEKALI)
    heroPreTitle: "happy girlfriend's day",
    heroLine1: "To My Precious,",
    heroLine2: "Vivi",
    heroSubtitle: "A special day for the prettiest girl who holds the biggest place in my heart.",
    
    // Time Section (Girlfriend Day)
    timeEnabled: true,
    timeTitle: "Happy Girlfriend's Day",
    timeSubtitle: "cherishing every second together since",
    timeStartDate: "2026-08-01",
    
    // Intro Section (English Titles, Indoglish Content)
    introPreTitle: "a little message",
    introHeadline1: "To My",
    introHeadline2: "Favorite",
    introHeadline3: "Vivi",
    introText: [
      "Happy Girlfriend's Day, Vivi! I just wanted to take a moment today to express how truly grateful I am to have you in my life.",
      "Makasih banyak yaa udah selalu ada, udah sabar ngadepin aku, dan selalu punya cara untuk bikin duniaku terasa jauh lebih berwarna. Being with you always feels so effortless and comforting.",
      "Thank you for every smile, laugh, and sweet memory we've shared so far. I really cherish every single second I get to spend with you.",
      "Let's keep creating more beautiful memories together. Happy Girlfriend's Day, my favorite person! I love you so much 🤍"
    ],
    introSignOff: "With all my love, Aldrinn",
    
    // Gallery (English Titles for Indoglish)
    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    photos: photos,
    
    // Reasons (English Titles for Indoglish, Gratitude theme)
    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I'm Grateful For You",
    reasons: [
      {
        icon: "🌟",
        title: "Your Radiant Smile",
        desc: "Senyum kamu selalu bisa bikin my hardest days feel so much better."
      },
      {
        icon: "🧸",
        title: "Your Endless Patience",
        desc: "Makasih udah selalu sabar dan ngertiin aku dalam kondisi apa pun."
      },
      {
        icon: "🤍",
        title: "Your Warm Energy",
        desc: "Kehadiranmu tuh selalu bikin aku ngerasa safe, warm, and comfortable."
      },
      {
        icon: "🤝",
        title: "Always Being There",
        desc: "Thank you for being my constant support and best friend every single day."
      },
      {
        icon: "💬",
        title: "Our Fun Conversations",
        desc: "Setiap ngobrol dan bercanda sama kamu never fails to make my day."
      },
      {
        icon: "✨",
        title: "Simply Being You",
        desc: "Aku bener-bener bersyukur punya kamu, thank you for being yourself!"
      }
    ],
    
    // Closing (English Titles for Indoglish)
    secretPhoto: order.secretPhoto || "",
    secretCaption: "I love you so much, Vivi 🤍",
    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Girlfriend's Day ✨",
    closingParagraph: "Thank you for being the most wonderful part of my days. Cheers to more laughter, sweet memories, and happy moments together!",
    celebrateBtnText: "celebrate ✨",
    
    // Meta
    pinEnabled: false,
    pinCode: "",
    pinHint: ""
  };

  console.log(`Saving to gift:${kvId}`);
  await cfSet(`gift:${kvId}`, giftData);
  
  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: giftData.recipient,
    theme: giftData.theme,
    createdAt: new Date().toISOString()
  };
  await cfSet(`draft:${kvId}`, draftData);

  console.log('Done processing order!');
}

processOrder().catch(console.error);
