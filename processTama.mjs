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
  const kvId = 'gift-1784897632694';
  const orderId = 'ORD-MRZ0S47A';
  const customerName = 'Tama';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const words = [
    "Happy", "20th", "Birthday", "Latifa", "Sayang",
    "Terima", "Kasih", "Sudah", "Selalu", "Jadi",
    "Pacar", "Paling", "Oke", "Ya", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Latifa Arianti (Tipa)",
    sender: "Tama",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: About You - The 1975",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my prettiest girl",
    heroLine1: "Happy 20th Birthday,",
    heroLine2: "My Cute Tipa 🌸✨",
    heroSubtitle: "Entering your 20s is a huge milestone, and I'm so happy I get to witness you becoming this amazing person.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing light, joy, and warmth into the world since",
    timeStartDate: "2006-07-26",

    introPreTitle: "a letter for my cute tipa",
    introHeadline1: "To My",
    introHeadline2: "Lovely Girl",
    introHeadline3: "Latifa Arianti",
    introText: [
      "To my lovely girl, Latifa Arianti (my cute tipa)... Happy 20th Birthday, Sayang! 🌸✨",
      "Entering your 20s is a huge milestone, and I'm so happy I get to witness you growing up and becoming this amazing person. Setiap hari bareng kamu tuh selalu bikin aku mikir, 'How did I get so lucky to have her?'",
      "My sweetheart, elu tuh punya kebaikan hati yang luar biasa. The way u love, the way u smile, and just ur presence alone is enough to brighten up my worst days.",
      "Makaciww yaa udah selalu sabar, selalu ngertiin, dan selalu jadi pacar paling oke buat eug❤️. U truly mean the world to me.",
      "Di umur 20 tahun ini, I pray that this new chapter brings u endless joy, peace of mind, and endless opportunities.",
      "Jangan pernah ragu sama kemampuan diri kamu sendiri yaa, because u're way stronger and smarter than u think. Dan inget, kalau elu ngerasa capek atau butuh tempat berpulang, u always have me✨.",
      "Happy 20th birthday, my tipa (eakkk)! Semoga umur baru ini makin mendewasakan, makin bikin kamu bahagia, dan semoga kita bisa terus ngerayain ulang tahun kamu bareng-bareng di tahun-tahun berikutnya.",
      "I love u more than words can say. 🤍🥂✨"
    ],
    introSignOff: "With all my love, Tama",

    reasonsTitle1: "6 Precious",
    reasonsTitle2: "Moments of Us",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ memories that mean the world ✨",
    reasons: [
      {
        icon: "🌸",
        title: "Entering Your 20s",
        desc: "Aku happy banget bisa saksiin kamu tumbuh jadi sosok yang makin luar biasa di umur 20 ini."
      },
      {
        icon: "🍀",
        title: "So Lucky To Have You",
        desc: "Setiap hari bareng kamu selalu bikin aku bersyukur banget bisa miliki cewek seindah kamu."
      },
      {
        icon: "☀️",
        title: "Brightening My Days",
        desc: "Kebaikan hatimu, senyumanmu, dan kehadiranmu selalu sukses ngilangin hariku yang berat."
      },
      {
        icon: "❤️",
        title: "Best Girlfriend Ever",
        desc: "Makaciww yaa udah selalu sabar, selalu ngertiin, dan jadi pacar paling oke buat eug."
      },
      {
        icon: "💪",
        title: "Stronger Than You Think",
        desc: "Jangan pernah ragu sama diri sendiri yaa, kamu jauh lebih hebat dari yang kamu bayangkan."
      },
      {
        icon: "🥂",
        title: "Celebrating Forever",
        desc: "Semoga kita bisa terus ngerayain setiap ulang tahun kamu bareng-bareng seterusnya."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to enlarge",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 20th Birthday, my cute tipa! I love u 🤍🥂✨",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 20th",
    closingTitle2: "Birthday 🎂✨",
    closingParagraph: "Happy 20th Birthday once again, my cute tipa Latifa! Terima kasih sudah menjadi pacar paling oke dan selalu mewarnai hariku. May all your dreams come true, and I love u more than words can say! 🤍🥂✨",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Latifa Arianti (Tipa)",
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
