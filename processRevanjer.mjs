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
  const kvId = 'auto-dcynpdj';
  const orderId = 'ORD-MRUL51CS';
  const customerName = 'revanjer😎';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Happy", "Sweet", "Seventeen", "Sayangku", "I", "Love", "You", "Baby", "I", "Love", "You", "Always", "Selamanya", "🤍", "🫶🏼"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Almira cantik 🫶🏼",
    sender: "Revanjer 😎",
    theme: "velvet-purple",
    musicUrl: "FILL_MANUALLY: Kasih Putih - Glenn Fredly",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy Sweet Seventeen,",
    heroLine2: "My Beautiful Girl ❤️",
    heroSubtitle: "Celebrating the day you were born and all the joy you've brought into my life.",
    
    timeEnabled: true,
    timeTitle: "A Beautiful Life",
    timeSubtitle: "making the world a better place since",
    timeStartDate: "2009-07-22",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To",
    introHeadline2: "My",
    introHeadline3: "Everything",
    introText: [
      "Happy sweet seventeen for my beautiful girl ❤️🫶🏼🥳",
      "Semoga di umur kamu yang baru ini, may you always live a long and healthy life.",
      "Aku juga selalu doain supaya kamu bisa keep developing to be better every single day ❤️",
      "I just want to pray for the best for you. Makasih ya sayangkuuu udah hadir di hidup aku dan bikin semuanya jadi lebih berwarna.",
      "Thank you for coming into my life. I love you baby, I love you always 💞🫂🫶🏼"
    ],
    introSignOff: "With all my love, Revanjer 😎",

    reasonsTitle1: "6 Unforgettable",
    reasonsTitle2: "Moments",
    reasonsHintTap: "tap to read more",
    reasonsHintAll: "✨ moments with you ✨",
    reasons: [
      {
        icon: "✨",
        title: "The First Time",
        desc: "Waktu pertama kali kenal dan aku ngerasa beruntung banget kamu bisa masuk ke hidupku."
      },
      {
        icon: "🌱",
        title: "Growing Together",
        desc: "Melihat kamu yang keep developing to be better setiap harinya tuh bikin aku bangga banget."
      },
      {
        icon: "🥰",
        title: "Everyday Joy",
        desc: "Setiap momen kecil sama kamu yang selalu sukses bikin hari-hariku jauh lebih bahagia."
      },
      {
        icon: "🙏",
        title: "Praying for You",
        desc: "Momen pas aku always pray for the best for you, karena kamu pantes dapet yang terbaik."
      },
      {
        icon: "🤍",
        title: "Your Presence",
        desc: "Kehadiran kamu yang selalu ngingetin aku betapa bersyukurnya aku punya kamu."
      },
      {
        icon: "🫂",
        title: "Loving You Always",
        desc: "Sadar kalau rasa sayangku ke kamu bakal terus ada, I love you always baby."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view closer",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "I love you always 💞🫂🫶🏼",

    closingPreTitle: "always & forever",
    closingTitle1: "I Love You",
    closingTitle2: "So Much 🤍",
    closingParagraph: "Semoga umur 17 tahun ini ngasih kamu kebahagiaan yang berlimpah ya sayang. I wish you nothing but the best today and always. Nikmatin hari spesialmu ini ya, baby!",
    celebrateBtnText: "cuddle time ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Almira cantik 🫶🏼",
    customerName: customerName,
    theme: "velvet-purple",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
