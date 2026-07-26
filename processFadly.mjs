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
  const kvId = 'gift-1782411431396';
  const orderId = 'ORD-MS0M98QA';
  const customerName = 'Fadly';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Donna Zulfa Shabrina",
    sender: "Fadly",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: team choose",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my prettiest girl",
    heroLine1: "Happy Birthday,",
    heroLine2: "Donna Zulfa 🤍✨",
    heroSubtitle: "Celebrating your special day, the most precious person who makes every single moment brighter.",
    
    timeEnabled: false,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing light, warmth, and joy into the world since",
    timeStartDate: "2002-07-26",

    introPreTitle: "a letter from the bottom of my heart",
    introHeadline1: "For",
    introHeadline2: "My Dearest",
    introHeadline3: "Donna",
    introText: [
      "Happy Birthday to my dearest love! 🤍✨",
      "I hope today brings you endless happiness, laughter, and pure joy.",
      "May you always stay healthy, and may the universe make every single step of your journey smooth and filled with ease.",
      "May happiness always surround you wherever you go, shining on everything you do.",
      "I want you to know how deeply you are loved and how truly special you are to me.",
      "Not just today, but every single day, for as long as I exist, you will always be loved with all my heart. 🤍🎂✨"
    ],
    introSignOff: "With all my love & gratitude, Fadly",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "You Are So Loved",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ reasons you mean everything ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Your Sweet Heart",
        desc: "Thank you for bringing so much warmth, kindness, and sweetness into my life."
      },
      {
        icon: "✨",
        title: "You Brighten My Days",
        desc: "Just having you around makes every ordinary day feel extraordinary and special."
      },
      {
        icon: "🌸",
        title: "Forever Grateful",
        desc: "I am endlessly thankful to have such a wonderful person by my side every single day."
      },
      {
        icon: "🕊️",
        title: "Endless Wishes",
        desc: "I pray that the universe always guides your steps and fills your life with joy."
      },
      {
        icon: "👑",
        title: "Truly Special",
        desc: "You are unique, irreplaceable, and precious beyond what words can ever say."
      },
      {
        icon: "💍",
        title: "Loved Forever",
        desc: "For as long as I exist, you will always be loved with all my heart and soul."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to enlarge",
    photos: [],

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy Birthday, Donna sayang! For as long as I exist, you will always be loved 🤍✨",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Birthday 🎂✨",
    closingParagraph: "Happy Birthday once again, my dearest Donna. May your day be as beautiful and wonderful as you are. Remember that you are deeply cherished today, tomorrow, and forever. I love you so much! 🤍✨",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Donna Zulfa Shabrina",
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
