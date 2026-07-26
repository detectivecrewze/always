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
  const kvId = 'gift-1784903544865';
  const orderId = 'ORD-MRZ2BKK3';
  const customerName = 'Your Angel';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const words = [
    "Selamat", "Ulang", "Tahun", "Cilokku", "Sayang",
    "Terima", "Kasih", "Semuanya", "❤️"
  ];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Cilok (Cilokku Sayang)",
    sender: "Your Angel",
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: Baby I'm Yours - Arctic Monkeys",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my favorite person",
    heroLine1: "Happy 22nd Birthday,",
    heroLine2: "Cilokku Sayang ❤️",
    heroSubtitle: "Merayakan 22 tahun perjalanan harimu, sosok paling berharga yang selalu jadi rumah tempatku berpulang.",
    
    timeEnabled: true,
    timeTitle: "Perjalanan Usiamu",
    timeSubtitle: "menyinari dunia dengan senyuman dan kehangatanmu sejak",
    timeStartDate: "2004-07-24",

    introPreTitle: "surat dari relung hati",
    introHeadline1: "Untuk",
    introHeadline2: "Cilokku",
    introHeadline3: "Tersayang",
    introText: [
      "Halo sayangku Cilok... 🤍",
      "Aku cuma mau bilang, terima kasih banyak yaa udah hadir di hidup aku dan bikin hari-hari aku jadi jauh lebih berarti.",
      "Kamu itu rumah tempat aku pulang, alasan di balik senyuman aku, dan seseorang yang paling aku takutkan buat kehilangan.",
      "Apa pun yang terjadi ke depannya, aku pengen kita terus jalan bareng-bareng yaa.",
      "Jangan bosen-bosen sama akuuu, dan jangan pernah capek ketika aku lagi betmuttt yaa!",
      "I love you so much, hari ini, besok, dan selamanya. ❤️"
    ],
    introSignOff: "Dengan seluruh cintaku, Your Angel",

    reasonsTitle1: "6 Alasan Kenapa",
    reasonsTitle2: "Kamu Sangat Berharga",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ ketulusan hatimu ✨",
    reasons: [
      {
        icon: "🏠",
        title: "Rumah Tempat Pulang",
        desc: "Bersamamu selalu terasa begitu aman dan nyaman, tempat terbaikku untuk berpulang."
      },
      {
        icon: "😊",
        title: "Alasan Senyumku",
        desc: "Kehadiranmu selalu punya cara tersendiri untuk mengukir senyum dan bahagiaku."
      },
      {
        icon: "🤍",
        title: "Kehadiran Berharga",
        desc: "Terima kasih sudah hadir di hidupku dan membuat setiap hariku jauh lebih berarti."
      },
      {
        icon: "✨",
        title: "Kesabaranmu",
        desc: "Makasih yaa selalu sabar dan ngertiin aku bahkan di saat aku lagi moody."
      },
      {
        icon: "🤝",
        title: "Melangkah Bersama",
        desc: "Aku cuma ingin kita bisa terus berjalan berdampingan melewati apa pun di depan."
      },
      {
        icon: "♾️",
        title: "Cinta Selamanya",
        desc: "Rasa sayang dan cintaku untukmu akan selalu ada hari ini, besok, dan selamanya."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "sentuh untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Hal Lagi...",
    secretCaption: "Happy 22nd Birthday, Cilokku sayang! I love you so much ❤️",

    closingPreTitle: "selamanya & seterusnya",
    closingTitle1: "Selamat",
    closingTitle2: "Ulang Tahun 🎂❤️",
    closingParagraph: "Sekali lagi, selamat ulang tahun yang ke-22 yaa Cilokku sayang. Terima kasih sudah menjadi rumah dan alasan di balik senyumku. Semoga usiamu yang baru ini selalu dilimpahi kebahagiaan. I love you so much! ❤️",
    celebrateBtnText: "buat harapan ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Cilok (Cilokku Sayang)",
    customerName: customerName,
    theme: "midnight-blue",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
