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

async function main() {
  const kvId = 'auto-zu3jsrn';
  const orderId = 'ORD-MRX8Q4TU';
  const customerName = 'Iqbal';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = [
      "Happy", "Thirty", "Second", "Birthday", "Pratiwi",
      "My", "Dearest", "Thank", "You", "For",
      "Being", "My", "Light", "Always", "❤️"
    ];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "Pratiwi Widyati",
    sender: "Iqbal",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: team choose",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 32nd Birthday,",
    heroLine2: "Pratiwi My Dearest ❤️",
    heroSubtitle: "Celebrating 32 wonderful years of your cheerful spirit, endless warmth, and loving heart.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing warmth and joy into the world since",
    timeStartDate: "1994-07-24",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Pratiwi",
    introHeadline3: "With Love",
    introText: [
      "Happy 32nd birthday to the most cheerful person filled with positive energy in my life!",
      "Thank you for always bringing warmth, love, and genuine care into every single day.",
      "On your 32nd birthday, I wish you nothing but the absolute best, may happiness follow every step you take, may health and success always be with you, and may every beautiful dream of yours come true one by one.",
      "Thank you so much for being my best support system all this time.",
      "May you always be showered with wonderful things as generous as your kind heart. Enjoy your special day!"
    ],
    introSignOff: "With all my love, Iqbal",

    reasonsTitle1: "6 Beautiful",
    reasonsTitle2: "Qualities of You",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ why you are so special ✨",
    reasons: [
      {
        icon: "☀️",
        title: "Cheerful Energy",
        desc: "Your bright smile and positive energy always light up every room you enter."
      },
      {
        icon: "🔥",
        title: "Endless Warmth",
        desc: "Thank you for surrounding me with genuine care and comforting warmth every day."
      },
      {
        icon: "🛡️",
        title: "Best Support System",
        desc: "You are always there for me as my rock and most trusted companion in everything."
      },
      {
        icon: "🤍",
        title: "Kind Heart",
        desc: "Your pure kindness and generosity to everyone around you is truly inspiring."
      },
      {
        icon: "🌟",
        title: "Inspiring Dreams",
        desc: "Watching you pursue your goals with grace and dedication makes me so proud."
      },
      {
        icon: "🥰",
        title: "Precious Presence",
        desc: "Just having you by my side makes my life feel complete and meaningful."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to enlarge",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 32nd Birthday, Pratiwi! ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 32nd",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Happy 32nd Birthday once again, Pratiwi my dearest. Thank you for being the most wonderful partner and bringing so much light into my world. May this new chapter bring you endless joy, peace, and blessings. I love you! ❤️",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Pratiwi Widyati",
    customerName: customerName,
    theme: "vintage-burgundy",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
