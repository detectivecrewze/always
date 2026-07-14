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

const orderId = 'ORD-MRI3369K';
const kvId = 'gift-1783876863105';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery words: 15 words to match 15 photos
  const words = ["Happy", "26th", "Birthday", "To", "My", "Favorite", "Person", "In", "The", "World", "I", "Love", "You", "So", "Much"];
  
  const photos = [];
  // Loop based on actual available photos
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Sayangku",
    theme: "vintage-burgundy",
    music: {
      file: "FILL_MANUALLY: Ini Abadi - Perunggu",
      title: "Ini Abadi",
      artist: "Perunggu"
    },
    
    gateSubtitle: "a special gift for you",
    gateTitle: "Untuk Sayangku",
    
    heroPreTitle: "happy birthday",
    heroLine1: "To My Dearest",
    heroLine2: "Sayang",
    heroSubtitle: "26 beautiful years of your journey.",
    
    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "been glowing since",
    timeStartDate: "2000-07-15",
    
    introIcons: ["🎂", "✨", "🤍"],
    introPreTitle: "a little note",
    introHeadline1: "Happy",
    introHeadline2: "26th",
    introHeadline3: "Birthday",
    introText: [
      "Happy birthday sayangku! 🎉",
      "Makasih banget udah hadir di dalam hidupku tepat di saat aku udah males mikirin soal cinta-cintaan.",
      "You came and helped me fight my trust issues di saat aku bener-bener udah capek sama yang namanya hubungan.",
      "Semoga jalan hidup kamu selalu dilancarkan, rezekinya ngalir terus, and I hope all of your wishlists come true.",
      "Beruntung banget rasanya bisa kenal sama kamu, even orang tuamu juga sayang banget sama aku.",
      "Doa terbaik buat kamu selalu sayang. I love you to the moon and back! 🤍"
    ],
    introSignOff: "With love,\nSabila",
    
    reasonsTitle1: "Beautiful",
    reasonsTitle2: "Memories",
    reasons: [
      {
        title: "You Found Me",
        desc: "Makasih udah nemuin aku pas aku lagi capek-capeknya sama cinta. You saved me."
      },
      {
        title: "No More Trust Issues",
        desc: "Sama kamu, pelan-pelan semua trust issue aku hilang. You make me feel so secure."
      },
      {
        title: "The Luckiest",
        desc: "Beruntung banget rasanya bisa kenal kamu and be a part of your wonderful family."
      },
      {
        title: "Your Biggest Fan",
        desc: "Semoga rezekinya lancar terus ya, I'll always be here supporting your dreams."
      },
      {
        title: "My Best Keepsake",
        desc: "Setiap kenangan bareng kamu itu terlalu berharga. You are my favorite plot twist."
      },
      {
        title: "Future Together",
        desc: "Semoga semua doa baik ini terkabul, and we can make more beautiful memories together."
      }
    ],
    
    photos: photos,
    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    
    closingPreTitle: "always & forever",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Sayangku",
    closingParagraph: "Selamat ulang tahun yang ke-26 sayang. Semoga semua doa-doa baikmu terkabul, and I can't wait to see you achieve everything you've ever wanted. I love you so much!",
    closingLine: "your beloved,",
    sender: "Sabila",
    celebrateBtnText: "celebrate ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "cheers to your 26th! 🥂",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "Sabila",
    recipientName: "Sayang",
    deadline: "2026-07-14T01:44",
    theme: "vintage-burgundy",
    moment: "Ultah",
    status: "done",
    createdAt: new Date().toISOString()
  };

  await cfSet(`gift:${kvId}`, giftData);
  console.log(`✅ Successfully saved gift:${kvId}`);

  await cfSet(`draft:${kvId}`, draftData);
  console.log(`✅ Successfully saved draft:${kvId}`);
}

processOrder().catch(console.error);
