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
  const kvId = 'auto-fgl37qc';
  const orderId = 'ORD-MS4TI2YS';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (12) - Bahasa Inggris (Indoglish rule)
  const words = [
    "Happy",
    "Girlfriend",
    "Day",
    "To",
    "My",
    "Most",
    "Precious",
    "And",
    "Lovely",
    "Girl",
    "Forever",
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
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Sempurna - Andra & The Backbone",
    recipient: "Lili",
    sender: "Lean",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (DILARANG ADA EMOJI SAMA SEKALI)
    heroPreTitle: "happy girlfriend's day",
    heroLine1: "To My Precious,",
    heroLine2: "Lili",
    heroSubtitle: "A special day for the sweetest person who lightens up my whole world.",
    
    // Time Section (Girlfriend Day)
    timeEnabled: true,
    timeTitle: "Happy Girlfriend's Day",
    timeSubtitle: "grateful for your presence every day since",
    timeStartDate: "2026-08-01",
    
    // Intro Section (English Titles, Indoglish Content)
    introPreTitle: "a little message",
    introHeadline1: "To My",
    introHeadline2: "Precious",
    introHeadline3: "Lili",
    introText: [
      "Makasih yaa, udah hadir di sela-sela kehidupan Lean. Lean bersyukur banget bisa kenal Lili. Lili mungkin nggak sadar, tapi hal-hal kecil yang Lili lakuin tuh sering banget bikin hari Lean jadi jauh lebih baik.",
      "Lean sayang banget sama Lili. Lean sayang sama Lili bukan karena alasan tertentu, tapi karena kamu adalah kamu. Lean selalu ngerasa nyaman banget sama Lili, bisa cerita apa aja, dan ketawa bareng terus WKWK.",
      "Semoga apa pun yang kita jalanin ke depannya, kita sama-sama terus belajar saling ngerti dan saling dukung. Terima kasih udah jadi bagian yang bener-bener berarti di hidup Lean.",
      "Lean harap kita masih punya banyak cerita indah yang bisa kita buat bersama. Sejuta ucapan terima kasih untuk Lili karena udah hadir di hidup Lean, dan seribu maaf dari Lean untuk Lili. Happy Girlfriend's Day yaa, I love you so much 🤍"
    ],
    introSignOff: "With all my love, Lean",
    
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
        title: "Your Little Gestures",
        desc: "Hal-hal kecil yang Lili lakuin sering banget bikin hari Lean jauh lebih baik."
      },
      {
        icon: "🤍",
        title: "Loving You For You",
        desc: "Lean sayang sama Lili bukan karena alasan tertentu, tapi karena kamu adalah kamu."
      },
      {
        icon: "🛋️",
        title: "Feeling So Comfortable",
        desc: "Lean ngerasa nyaman banget sama Lili, bisa cerita apa aja dan ketawa bareng."
      },
      {
        icon: "🤝",
        title: "Growing Together",
        desc: "Lean bersyukur kita bisa terus belajar saling ngerti dan saling dukung."
      },
      {
        icon: "✨",
        title: "Meaningful Presence",
        desc: "Terima kasih udah jadi bagian yang bener-bener paling berarti di hidup Lean."
      },
      {
        icon: "💖",
        title: "Endless Gratitude",
        desc: "Sejuta ucapan terima kasih buat Lili yang udah selalu ada buat Lean."
      }
    ],
    
    // Closing (English Titles for Indoglish)
    secretPhoto: order.secretPhoto || "",
    secretCaption: "I love you so much, Lili 🤍",
    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Girlfriend's Day ✨",
    closingParagraph: "Terima kasih yaa udah hadir dan bikin hidup Lean jadi jauh lebih berwarna. I hope we get to make countless more beautiful memories together!",
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
