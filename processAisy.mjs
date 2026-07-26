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
  const kvId = 'gift-1784449469137';
  const orderId = 'ORD-MS1BKH9V';
  const customerName = 'Aisy';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = [
      "Happy", "29th", "Birthday", "My", "Favorite",
      "Person", "🤍"
    ];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "Mas Nori",
    sender: "Aisy",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: Love. - Wave To Earth",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "a special 29th birthday wish",
    heroLine1: "Happy 29th Birthday,",
    heroLine2: "My Favorite Person, Mas Nori 🤍",
    heroSubtitle: "29 years of you making the world a brighter place.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing warmth & light into the world since",
    timeStartDate: "1997-07-29",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Mas Nori",
    introHeadline3: "With Love",
    introText: [
      "Happy 29th Birthday, sayangku, Mas Nori. 🤍🎉",
      "Today is all about you, and I just want to say how grateful I am that God brought you into my life. Dari sekian banyak orang di dunia ini, aku benar-benar bersyukur bisa dipertemukan sama kamu. Meeting you has been one of the greatest blessings in my life.",
      "Aku bangga banget sama semua yang sudah kamu lewati sampai di titik ini. Aku tahu perjalananmu nggak selalu mudah, ada banyak tantangan, capek, dan pengorbanan yang mungkin nggak semua orang tau. But you made it, and I'm soooo proud of the man you've become.",
      "Semoga di usia yang ke-29 ini semua doa, impian, dan usaha kamu satu per satu bisa terwujud yaa sayang. Semoga selalu diberikan kesehatan, kebahagiaan, rezeki yang melimpah, dan dikelilingi orang-orang baik yang tulus menyayangi Mas Nori.",
      "Maaf yaaa, sayang... tahun ini aku masih belum bisa merayakan ulang tahunmu secara langsung tepat di tanggal 29 Juli ini. I wish I could be there to hug you, celebrate with you, and make this day even more special. Tapi karena kita masih LDR, untuk sementara aku cuma bisa menemani dan mengucapkan semuanya lewat layar hp hehehehe. I hope next birthdays won't be celebrated from a distance anymore deeeeh.",
      "Thank you for always being you, sayang. Terima kasih sudah hadir di hidupku, sudah menjadi tempatku pulang meski kita terpisah jarak. I hope you always remember that no matter how far we are, you are deeply loved, appreciated, and prayed for every single day.",
      "Once again, Happy 29th Birthday, Mas Nori. I love you more than words can say. Stay healthy, stay happy, and keep chasing your dreams. I'll always be here, cheering for you and loving you with all my heart. I love you so fucking much, sayang. Happy birthday, my favorite person. 🤍🎂"
    ],
    introSignOff: "With all my heart, Aisy",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I'm So Grateful For You",
    reasonsHintTap: "tap to reveal",
    reasonsHintAll: "✨ reasons why you mean the world to me ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Greatest Blessing",
        desc: "Aku benar-benar bersyukur dipertemukan dengan Mas Nori dari sekian banyak orang di dunia."
      },
      {
        icon: "👑",
        title: "Proud of You",
        desc: "Bangga banget melihat ketangguhan dan pencapaian Mas Nori sampai di titik ini."
      },
      {
        icon: "🏠",
        title: "Place to Call Home",
        desc: "Terima kasih sudah selalu jadi tempatku pulang walau kita harus terpisah jarak."
      },
      {
        icon: "🕊️",
        title: "Deeply Loved",
        desc: "No matter how far we are, Mas Nori akan selalu dicintai dan didoakan setiap hari."
      },
      {
        icon: "🌟",
        title: "Always Cheering",
        desc: "Aku akan selalu di sini untuk mendukung dan menemani setiap langkah impianmu."
      },
      {
        icon: "✨",
        title: "Favorite Person",
        desc: "You are and will always be my favorite person in the whole wide world."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view photos",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 29th Birthday, Mas Nori sayang! I love you so much 🤍",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 29th",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Happy 29th Birthday once again, Mas Nori sayang. Thank you for being the most wonderful partner and my place to call home. May all your dreams come true and may we celebrate your next birthdays side by side without any distance between us. I love you so much! 🤍",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Mas Nori",
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
