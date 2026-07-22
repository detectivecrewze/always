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
  const kvId = 'auto-psjq93c';
  const orderId = 'ORD-MRVKI2AI';
  const customerName = "Wahid amin ma'ruf";

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 9 words
  const words = ["Happy", "Eighteenth", "Birthday", "To", "My", "Amazing", "Best", "Friend", "Anastasiia"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Anastasiia",
    sender: "Wahid",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: I Thought I Saw Your Face Today - She & Him",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 18th Birthday,",
    heroLine2: "Anastasiia ✨",
    heroSubtitle: "Celebrating the day my amazing best friend was born. You deserve all the happiness in the world.",
    
    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "making the world a better place since",
    // Corrected the birth year from 2026 to 2008 based on the 18th birthday
    timeStartDate: "2008-07-21",

    introPreTitle: "a little message",
    introHeadline1: "To",
    introHeadline2: "My",
    introHeadline3: "Best Friend",
    introText: [
      "Hi Anastasiia, I know this is a bit late, but happy 18th birthday!",
      "I can't believe we've known each other for a year already; it literally feels like we just met yesterday.",
      "I hope you grow into a strong woman and become everything you've dreamed of.",
      "I also hope you can keep pursuing the goals you've been fighting for all this time.",
      "Wish you all the best! You're an amazing friend and I'm so glad we met."
    ],
    introSignOff: "Cheers, Wahid",

    reasonsTitle1: "6 Things I Admire",
    reasonsTitle2: "About You",
    reasonsHintTap: "tap to read more",
    reasonsHintAll: "✨ why you are amazing ✨",
    reasons: [
      {
        icon: "💪",
        title: "Your Strength",
        desc: "I admire how you are growing into such a strong and independent woman every single day."
      },
      {
        icon: "🎯",
        title: "Your Ambition",
        desc: "The way you keep pursuing your goals and fighting for what you believe in is truly inspiring."
      },
      {
        icon: "🤝",
        title: "Your Friendship",
        desc: "Even though we've only known each other for a year, you've become such a great friend to me."
      },
      {
        icon: "🌟",
        title: "Your Dedication",
        desc: "The effort you put into everything you've dreamed of shows how amazing you really are."
      },
      {
        icon: "✨",
        title: "Your Vibe",
        desc: "It feels like we just met yesterday, but hanging out with you is always a fun and comfortable time."
      },
      {
        icon: "🚀",
        title: "Your Future",
        desc: "I have no doubt that you will become everything you've dreamed of and achieve great things."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view closer",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Wish you all the best! ✨",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Anastasiia 🤍",
    closingParagraph: "Once again, happy 18th birthday! I hope this new chapter of your life brings you so much joy, success, and everything you've ever wished for. Keep fighting for your dreams, and remember that I'll always be here cheering you on as a friend. Let's make more great memories together!",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Anastasiia",
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
