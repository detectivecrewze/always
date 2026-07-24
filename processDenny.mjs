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
  const kvId = 'auto-6uzq4gd';
  const orderId = 'ORD-MRTBUJE5';
  const customerName = 'Denny';

  console.log(`Fetching order & gift data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const existingGift = await cfGet(`gift:${kvId}`);
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : (existingGift?.secretPhoto || '');

  const words = [
    "Happy", "Twentieth", "Birthday", "Trisna", "My",
    "Dearest", "Love", "Thank", "You", "For",
    "Brightening", "My", "World", "Always", "❤️"
  ];

  let photos = (existingGift && existingGift.photos && existingGift.photos.length > 0) ? existingGift.photos : [];
  if (photos.length > 0) {
    for (let i = 0; i < photos.length; i++) {
      photos[i].caption = words[i] || '';
    }
  }

  const giftData = {
    recipient: "Trisna Cantik",
    sender: "Denny",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: heaven - bryan adams",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "a double celebration of love",
    heroLine1: "Happy 20th Birthday,",
    heroLine2: "& Happy Anniversary ❤️",
    heroSubtitle: "Wishing you the happiest birthday and celebrating the gift of your love that brightens my darkest days.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing sunshine and warmth into the world since",
    timeStartDate: "2006-07-28",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Trisna",
    introHeadline3: "With All My Heart",
    introText: [
      "Happy Birthday, My Love. ❤️",
      "Wishing you the happiest birthday, and happy anniversary as well. 🫶🏻",
      "Thank you so much for being the sunshine that brightens my darkest days.",
      "Thank you for loving me and making me feel so deeply loved every single day.",
      "Thank you for always being there for me through every moment.",
      "I am so incredibly lucky to have someone as wonderful as you in my life. ❤️"
    ],
    introSignOff: "With all my love, Denny",

    reasonsTitle1: "6 Beautiful",
    reasonsTitle2: "Qualities of You",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ why you mean everything to me ✨",
    reasons: [
      {
        icon: "☀️",
        title: "My Bright Sunshine",
        desc: "Thank you for always brightening even my darkest days with your warm smile."
      },
      {
        icon: "🤍",
        title: "Unconditional Love",
        desc: "The way you love me makes me feel so cherished, safe, and truly complete."
      },
      {
        icon: "🛡️",
        title: "Always There For Me",
        desc: "Your unwavering support and presence mean more to me than words can ever say."
      },
      {
        icon: "✨",
        title: "A Pure Heart",
        desc: "Your kindness, warmth, and gentle spirit inspire me to be better every day."
      },
      {
        icon: "🍀",
        title: "My Greatest Blessing",
        desc: "I am so incredibly lucky to have found someone as special as you in this life."
      },
      {
        icon: "🥰",
        title: "Forever Beside You",
        desc: "Looking forward to celebrating every birthday and anniversary by your side."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to enlarge",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 20th Birthday & Anniversary, Trisna my love! ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 20th Birthday",
    closingTitle2: "& Happy Anniversary 🎂❤️",
    closingParagraph: "Happy 20th Birthday and Happy Anniversary once again, Trisna my love. Thank you for being the sunshine of my life and making every day so full of joy. I love you more than words can ever express! ❤️",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Trisna Cantik",
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
