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
  const kvId = 'auto-g28fnsi';
  const orderId = 'ORD-MS1AERKF';
  const customerName = 'Irfan';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = [
      "Happy", "First", "Anniversary", "My", "Dearest",
      "Citra", "Thank", "You", "For", "Everything",
      "My", "Love", "💕"
    ];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "Citra (Dede)",
    sender: "Irfan",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: team choose",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my favorite person & dearest girl",
    heroLine1: "Happy 1st Anniversary,",
    heroLine2: "My Precious Dede 💕",
    heroSubtitle: "Celebrating 365 days of love, laughter, and growing together with you.",
    
    timeEnabled: true,
    timeTitle: "Our Story",
    timeSubtitle: "building beautiful memories & holding hands since",
    timeStartDate: "2025-07-27",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Dede",
    introHeadline3: "With Love",
    introText: [
      "Happy 1st Anniversary, sayang! 🌸 Gak kerasa ya, kita udah jalanin journey ini selama 1 tahun penuh. Thank you so much udah mau tetap bertahan dan berjalan bareng mas sampai sejauh ini.",
      "Bagi mas, Dede itu orang yang paling berharga yang pernah mas temuin dalam hidup ini. Being with you is truly the biggest blessing I could ever ask for.",
      "Terima kasih juga yaa udah selalu sabar menghadapi segala sifat dan kelakuan mas selama ini. Honest, beribu kata pun gak akan pernah cukup untuk menuliskan seberapa besarnya rasa syukur mas punya kamu.",
      "Semoga hubungan kita ini bisa terus bertahan, makin hangat, dan lancar terus jalannya sampai nanti kita melangkah ke jenjang yang lebih serius yaa, sayang... Amiin🥰"
    ],
    introSignOff: "Forever yours, Irfan",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I'm So Grateful For You",
    reasonsHintTap: "tap to reveal",
    reasonsHintAll: "✨ reasons why you mean the world to me ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Pure Patience",
        desc: "Terima kasih udah selalu sabar dan mengerti sifat mas dalam situasi apa pun."
      },
      {
        icon: "💎",
        title: "Precious Being",
        desc: "You are truly the most precious person yang pernah mas temuin di dunia ini."
      },
      {
        icon: "🥺",
        title: "Endless Gratitude",
        desc: "Beribu kata gak akan pernah cukup untuk ungkapin betapa bersyukurnya mas punya kamu."
      },
      {
        icon: "🏠",
        title: "Safe Harbor",
        desc: "Bersamamu mas selalu merasa aman, tenang, dan diterima apa adanya."
      },
      {
        icon: "✨",
        title: "Brightest Smile",
        desc: "Senyum dan keberadaan Dede selalu bisa bikin hari-hari mas terasa jauh lebih indah."
      },
      {
        icon: "💍",
        title: "Future Together",
        desc: "Semoga hubungan kita bisa terus bertumbuh dan bertahan sampai ke jenjang yang lebih serius."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Memories",
    galleryHint: "tap to view photos",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 1st Anniversary, Dede sayang! I love you so much ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 1st",
    closingTitle2: "Anniversary 💕",
    closingParagraph: "Happy 1st Anniversary once again, Dede sayang. Thank you for 365 beautiful days of love and patience. Semoga langkah kita ke depannya makin dipermudah sampai menuju jenjang yang lebih serius yaa. I love you endlessly! 🌸",
    celebrateBtnText: "happy anniversary ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Citra (Dede)",
    customerName: customerName,
    theme: "blush-pink",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
