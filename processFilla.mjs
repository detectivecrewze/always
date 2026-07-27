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
  const kvId = 'gift-1785056829782';
  const orderId = 'ORD-MS1PXX7C';
  const customerName = 'Filla';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = [
      "Happy", "Birthday", "My", "Dearest", "Oscar"
    ];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "Oscar",
    sender: "Filla",
    theme: "ocean-breeze",
    musicUrl: "FILL_MANUALLY: Índigo - Camilo, Evaluna Montaner",
    gateSubtitle: "Something Special For u",

    pinEnabled: true,
    pinCode: "020892",
    pinHint: "Your birthday",

    heroPreTitle: "a special 34th birthday wish",
    heroLine1: "Happy 34th Birthday,",
    heroLine2: "My Dearest Oscar 🖤",
    heroSubtitle: "34 beautiful years of your presence making the world a brighter place.",

    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing light & warmth into the world since",
    timeStartDate: "1992-08-02",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Oscar",
    introHeadline3: "With All My Love",
    introText: [
      "Happy Birthday, Oscar 🖤 Didn't expect you to become this important to me, but somehow you did.",
      "Now you're the one I look for every day, the one I get used to having around, and honestly, I wouldn't want it any other way.",
      "Thanks for staying, for being patient, and for dealing with me even on my worst days. You make things feel easier just by being there. I hope this year brings you everything you've been working for — more happiness, more wins, and less stress. You deserve that.",
      "There's something about you that I can't really explain. It's in the way you talk, the way you act, and the way you stay even when things aren't perfect. I didn't expect you to mean this much to me, but somehow you became someone I think about every day.",
      "You make things feel lighter without even trying, and being around you just feels right. And yeah... just stay, okay? I like having you in my life. 🖤✨"
    ],
    introSignOff: "Always yours, Filla",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "You Mean So Much To Me",
    reasonsHintTap: "tap to reveal",
    reasonsHintAll: "✨ reasons why I'm grateful to have you ✨",
    reasons: [
      {
        icon: "🖤",
        title: "Unconditional Patience",
        desc: "Thank you for always being patient and dealing with me even on my worst days."
      },
      {
        icon: "✨",
        title: "Effortless Comfort",
        desc: "You make everything feel lighter and easier just by being there."
      },
      {
        icon: "🌊",
        title: "Constant Presence",
        desc: "You are the one I look for every day and the one I love having around."
      },
      {
        icon: "🎙️",
        title: "Irreplaceable Vibe",
        desc: "There is something about the way you talk and act that means so much to me."
      },
      {
        icon: "🤝",
        title: "Staying Through Everything",
        desc: "I appreciate how you stay and stand by me even when things are not perfect."
      },
      {
        icon: "🎯",
        title: "Well-Deserved Wins",
        desc: "I hope this year brings you all the happiness, success, and peace you deserve."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Memories",
    galleryHint: "tap to view photos",
    photos: photos,

    secretPhoto: secretPhoto || '',
    secretTitle: secretPhoto ? "One More Thing..." : '',
    secretCaption: secretPhoto ? "Happy 34th Birthday, Oscar! Stay in my life, okay? 🖤" : '',

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 34th",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Happy 34th Birthday once again, Oscar. Thank you for 34 wonderful years of your presence and for being such a meaningful part of my life. Just stay in my life, okay? I love having you around. 💕",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Oscar",
    customerName: customerName,
    theme: "ocean-breeze",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);

  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
