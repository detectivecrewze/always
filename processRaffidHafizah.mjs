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
  const kvId = 'auto-40iwusr';
  const orderId = 'ORD-MS2ZEGHE';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  console.log('Order found. Photos:', order.photos?.length || 0);
  const orderPhotos = order.photos || [];

  let words = [];
  if (orderPhotos.length > 0) {
      const sentence = "I hope we can always be together forever sayangg 🤍";
      const sentenceWords = sentence.split(" ");
      if (sentenceWords.length === orderPhotos.length) {
          words = sentenceWords;
      } else if (sentenceWords.length > orderPhotos.length) {
          words = sentenceWords.slice(0, orderPhotos.length);
      } else {
          words = [...sentenceWords];
          while (words.length < orderPhotos.length) {
              words.push("✨");
          }
      }
  }

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: team choose", // Playlist: None
    recipient: "Hafizah Jonita",
    sender: "Raffid Fhalosa",
    
    // Gate
    gateSubtitle: "Happy Girlfriend's Day",
    
    // Hero
    heroPreTitle: "happy girlfriend's day",
    heroLine1: "To My Precious,",
    heroLine2: "Hafizah Jonita",
    heroSubtitle: "another beautiful day of loving you, wishing to hold you close forever",
    
    // Time Section
    timeEnabled: true,
    timeTitle: "Happy Girlfriend's Day",
    timeSubtitle: "loving you and holding you close since",
    timeStartDate: "2026-08-01",
    
    // Intro Section
    introPreTitle: "a little message",
    introHeadline1: "Untuk",
    introHeadline2: "Kesayanganku",
    introHeadline3: "Tercinta",
    introText: [
      "Happy Girlfriend's Day, sayangg! Maybe I don't say this enough, tapi aku bersyukur banget ada kamu.",
      "You make my world so much brighter. I just wanted to say, sama sama teruss yaa sayangg.",
      "Let's write many more beautiful chapters together. I love you."
    ],
    introSignOff: "Love, Raffid",
    
    // Gallery
    galleryTitle1: "Our Beautiful",
    galleryTitle2: "Memories",
    photos: photos,
    
    // Reasons
    reasonsTitle1: "6 Things I",
    reasonsTitle2: "Adore About You",
    reasons: [
      {
        icon: "✨",
        title: "Your Smile",
        desc: "Senyummu itu my favorite view, always makes my day better."
      },
      {
        icon: "🦋",
        title: "Your Kindness",
        desc: "Hati kamu yang tulus selalu bikin aku kagum."
      },
      {
        icon: "🤍",
        title: "The Way You Love",
        desc: "Caramu menyayangiku feels like home."
      },
      {
        icon: "🧸",
        title: "Your Patience",
        desc: "Makasih udah selalu sabar sama aku, you're the best."
      },
      {
        icon: "🌟",
        title: "Your Energy",
        desc: "Your vibe is just so precious to me."
      },
      {
        icon: "♾️",
        title: "Everything",
        desc: "Simply because you are you, and I love that."
      }
    ],
    
    // Closing
    secretPhoto: order.secretPhoto || "",
    secretCaption: "I'll always be here for you 🤍",
    closingPreTitle: "always & forever",
    closingTitle1: "You Are Loved",
    closingTitle2: "Beyond Words",
    closingParagraph: "Semoga kita bisa sama-sama terus ya sayang. Thank you for being such an amazing part of my life. I'll always cherish every moment with you.",
    celebrateBtnText: "sayang kamu ✨",
    
    // Meta
    pinEnabled: false,
    pinCode: "",
    pinHint: ""
  };

  console.log('Generated gift data:', JSON.stringify(giftData, null, 2));

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
