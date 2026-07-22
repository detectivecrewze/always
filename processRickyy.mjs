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
  const kvId = 'auto-0fs7mxo';
  const orderId = 'ORD-MRW4TUFA';
  const customerName = 'Rickyy';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 2 words
  const words = ["Happy", "Birthday"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Violaa",
    sender: "Rickyy",
    theme: "velvet-purple",
    musicUrl: "FILL_MANUALLY: Risk it all - Bruno Mars",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 20th Birthday,",
    heroLine2: "Violaa Sayang ❤️",
    heroSubtitle: "Merayakan hari lahirmu, sosok cantik yang selalu mengisi hari-hariku dengan kebahagiaan tak terhingga.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "making the world a better place since",
    timeStartDate: "2006-07-23",

    introPreTitle: "a letter from the heart",
    introHeadline1: "Untuk",
    introHeadline2: "Violaa",
    introHeadline3: "Tersayang",
    introText: [
      "Happy birthday Violaa.. 🤍",
      "Makasih ya sudah menjadi bagian terpenting di hidup aku, selalu mengisi dan membuat hari-hari aku penuh dengan kesenangan serta kebahagiaan yang begitu melimpah.",
      "Senyum indah dan wajah cantik kamu selalu berhasil membawa kebahagiaan, bukan cuma buat aku, tapi juga bagi semua orang di sekitarmu.",
      "Semoga di usiamu yang baru ini, semua impian indah kamu bisa tercapai satu per satu.",
      "You deserve all the happiness in this world, today and always."
    ],
    introSignOff: "With all my love, Rickyy",

    reasonsTitle1: "6 Hal Tentang",
    reasonsTitle2: "Kamu",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ mengapa kamu spesial ✨",
    reasons: [
      {
        icon: "😊",
        title: "Your Beautiful Smile",
        desc: "Senyum kamu itu indah banget, selalu berhasil bikin aku dan orang-orang di sekitarmu ngerasa bahagia."
      },
      {
        icon: "✨",
        title: "The Joy You Bring",
        desc: "Kehadiran kamu selalu ngasih warna baru dan bawa kebahagiaan yang berlimpah di hidupku."
      },
      {
        icon: "🤍",
        title: "Your Kindness",
        desc: "Kebaikan hati kamu yang tulus selalu bikin aku bersyukur karena udah dikasih kesempatan buat kenal kamu."
      },
      {
        icon: "💎",
        title: "The Most Important Part",
        desc: "Makasih ya karena kamu udah jadi bagian yang paling penting dan berharga di hidup aku saat ini."
      },
      {
        icon: "🌸",
        title: "Your Inner Beauty",
        desc: "Nggak cuma wajah kamu yang cantik, tapi hati kamu juga luar biasa indah."
      },
      {
        icon: "🥰",
        title: "Our Happiness",
        desc: "Semoga kita bisa terus berbagi kesenangan dan menciptakan lebih banyak memori bahagia bareng-bareng."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "I love you always, Violaa ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Sekali lagi, selamat ulang tahun Violaa sayang. I hope this new chapter brings you so much joy and endless blessings. Aku akan selalu ada buat dukung semua impian kamu. I love you so much! ❤️",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Violaa",
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
