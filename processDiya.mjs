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
  const kvId = 'gift-1784677746312';
  const orderId = 'ORD-MRVCXIQ3';
  const customerName = 'Diya';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 12 words
  const words = ["Selamat", "Ulang", "Tahun", "Aa", "Fauzan", "Sayang", "Ayang", "Sayang", "Banget", "Sama", "Aa", "❤️"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Fauzanku Sayang",
    sender: "Diya",
    theme: "classic-light",
    musicUrl: "FILL_MANUALLY: Semua Aku Dirayakan - Nadin Amizah",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Selamat Ulang Tahun,",
    heroLine2: "Fauzanku Sayang 🥰",
    heroSubtitle: "Merayakan hari kelahiranmu, merayakan setiap langkah kecilmu, dan bersyukur atas kehadiranmu di hidupku.",
    
    timeEnabled: true,
    timeTitle: "Hadirmu di Dunia",
    timeSubtitle: "menjadi berkah terindah sejak",
    timeStartDate: "2004-07-28",

    introPreTitle: "sebuah pesan spesial",
    introHeadline1: "Untuk",
    introHeadline2: "Aa",
    introHeadline3: "Tersayang",
    introText: [
      "“Jangan pernah berhenti menunjukan rasa kasih sayang karena kamu sudah berhasil mendapatkan nya, karena cinta yang bertahan adalah cinta yang tetap dirawat.”",
      "Ini pedoman ayang saat ini a.. selama sama ayang, aa bakal ayang rayakan selalu… momen-momen kecil, pencapaian-pencapaian aa, ayang apresiasi selalu.",
      "Selamat ulang tahun a ya! 🎂🎂 Terima kasih telah lahir di dunia 😇😇 dan terima kasih telah hadir di hidup ayang.",
      "Semoga diperlancar segala urusannya, semoga bahagia dunia akhirat. Aminnn…",
      "Aa berharga banget bagi ayang. 😘😘❤️❤️🤍🤍🫂🫂❤️❤️"
    ],
    introSignOff: "Sayang selalu, Ayang",

    reasonsTitle1: "6 Hal Tentang",
    reasonsTitle2: "Kita",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ memori indah ✨",
    reasons: [
      {
        icon: "🎉",
        title: "Merayakanmu",
        desc: "Selama aa sama ayang, ayang bakal selalu ngerayain semua pencapaian aa, sekecil apapun itu."
      },
      {
        icon: "🌱",
        title: "Pedoman Kita",
        desc: "Merawat cinta yang udah kita dapet, karena cinta yang bertahan adalah cinta yang terus dijaga."
      },
      {
        icon: "📸",
        title: "Momen Kecil",
        desc: "Setiap momen kecil yang kita lewatin bareng selalu jadi hal yang paling ayang syukuri."
      },
      {
        icon: "🥰",
        title: "Hadirmu",
        desc: "Terima kasih udah hadir di hidup ayang dan bikin hari-hari ayang jadi jauh lebih berwarna."
      },
      {
        icon: "🤲",
        title: "Kebahagiaan Aa",
        desc: "Doa ayang selalu nyertain aa, semoga aa selalu dilancarkan urusannya dan bahagia dunia akhirat."
      },
      {
        icon: "💎",
        title: "Berharga",
        desc: "Bagi ayang, aa itu sangat berharga. Ayang sayang banget sama aa."
      }
    ],

    galleryTitle1: "Jejak",
    galleryTitle2: "Kenangan",
    galleryHint: "tap untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Aa berharga banget bagi Ayang 😘❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Birthday Aa 🎂",
    closingParagraph: "Sekali lagi selamat ulang tahun yaa aa sayang. Terimakasih udah jadi sosok yang luar biasa buat ayang. Ayang bakal selalu ada buat ngerayain setiap momen bahagia aa. I love you so much! ❤️",
    celebrateBtnText: "peluk aa ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Fauzanku Sayang",
    customerName: customerName,
    theme: "classic-light",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
