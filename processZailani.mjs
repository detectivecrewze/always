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
  const kvId = 'auto-v4oobiq';
  const orderId = 'ORD-MS0LIA8Y';
  const customerName = 'Muhamad Zailani Alqodiro';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const words = [
    "Selamat", "Ulang", "Tahun", "Gina", "Sayang",
    "Terima", "Kasih", "Sudah", "Hadir", "Dan",
    "Menjadi", "Rumah", "Untukku", "Yaa", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Gina Khoirunisa (Gina)",
    sender: "Muhamad Zailani Alqodiro",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: Semua Aku Dirayakan - Nadin Amizah",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my prettiest girl",
    heroLine1: "Happy 18th Birthday,",
    heroLine2: "Gina Khoirunisa 🤍✨",
    heroSubtitle: "Merayakan 18 tahun perjalanan usiamu, sosok paling spesial dan rumah terbaik tempatku berpulang.",
    
    timeEnabled: true,
    timeTitle: "Perjalanan Usiamu",
    timeSubtitle: "menyinari dunia dengan senyuman dan kehangatanmu sejak",
    timeStartDate: "2008-07-26",

    introPreTitle: "surat dari relung hati",
    introHeadline1: "Untuk",
    introHeadline2: "Sayangku",
    introHeadline3: "Gina Khoirunisa",
    introText: [
      "Happy birthday my love!! It's your special day, wish you all the best yaa sayang... 🤍✨",
      "Maaf yaa kalau belum bisa memberikan sesuatu hal lain ke kamu, maaf belum bisa jadi yang diinginkan. Tapi aku janji kita bakal berusaha sama-sama untuk menjadi lebih baik dan menggapai apa yang kita impikan bersama. But I tried my best for you.",
      "Selamat bertambah usia yaa Ginaaa! Semoga semakin dewasa, sehat selalu, berbakti kepada orang tua, dan semakin sayang sama keluarga dan aku juga (asiek!).",
      "Dengan bertambahnya usia kamu sekarang, bertambah pula perjalanan masuk ke dunia yang sedikit lebih berat dan berbeda. Selamat yaa, semangat terus, dan harus makin dewasa dalam mengambil setiap keputusan maupun hal yang lainnya.",
      "Dan ingat yaa, jangan pernah berpikir kalau kamu sendirian... Aku gak expect bakal kenal sosok cewek sebaik, secantik, dan seceria kamu.",
      "Makasih yaa udah lahir di dunia, makasih sudah bertahan sama dunia yang kadang jahat ini, dan makasih udah mau jadi rumah tempatku berpulang di sini. I love you! 🤍🎂✨"
    ],
    introSignOff: "Dengan seluruh cintaku, Muhamad Zailani Alqodiro",

    reasonsTitle1: "6 Momen Indah",
    reasonsTitle2: "Bersamamu",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ kenangan berharga kita ✨",
    reasons: [
      {
        icon: "🌸",
        title: "Pertemuan Indah",
        desc: "Aku gak pernah nyangka bakal kenal sosok cewek yang begitu baik, cantik, dan ceria seperti kamu."
      },
      {
        icon: "🏠",
        title: "Rumah Tempat Pulang",
        desc: "Terima kasih banyak yaa sudah mau hadir di hidupku dan menjadi rumah terbaik tempatku berpulang."
      },
      {
        icon: "💪",
        title: "Berjuang Bersama",
        desc: "Terima kasih sudah selalu bertahan. Kita akan terus berusaha bersama menjadi lebih baik lagi."
      },
      {
        icon: "🌱",
        title: "Makin Dewasa",
        desc: "Selamat melangkah ke kedewasaan baru. Semangat terus dan bijaklah dalam setiap keputusanmu."
      },
      {
        icon: "🤍",
        title: "Tidak Pernah Sendiri",
        desc: "Jangan pernah merasa sendirian yaa, karena aku akan selalu ada menemani setiap langkahmu."
      },
      {
        icon: "🎂",
        title: "Hari Spesial Gina",
        desc: "Selamat ulang tahun yang ke-18 sayangku. Semoga bahagia, sehat, dan tercapai semua impianmu."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "sentuh untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Hal Lagi...",
    secretCaption: "Happy 18th Birthday, Gina sayang! Makasih udah mau jadi rumah buat akuuu 🤍✨",

    closingPreTitle: "selamanya & seterusnya",
    closingTitle1: "Selamat",
    closingTitle2: "Ulang Tahun 🎂✨",
    closingParagraph: "Sekali lagi, selamat ulang tahun yang ke-19 yaa Gina sayangku. Terima kasih sudah lahir ke dunia dan menjadi rumah tempatku berpulang. Jangan pernah merasa sendirian, karena aku akan selalu ada di sini untukmu. I love you so much! 🤍✨",
    celebrateBtnText: "buat harapan ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Gina Khoirunisa (Gina)",
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
