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
  const orderId = 'ORD-MRK3B16V';
  const kvId = 'auto-rw9i5sp';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = [
    "Happy", "24th", "Birthday", "Ayang", "Thank", "You", "For", 
    "Always", "Being", "There", "For", "Me", "And", "Loving", "Me",
    "I", "Love", "You", "So", "Much", "More", "Than", "Words", "Can", "Say"
  ];
  const words = baseWords.slice(0, orderPhotos.length);
  while (words.length < orderPhotos.length) {
    words.push("❤️");
  }

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    id: kvId,
    recipient: 'Via Audri Vitrah',
    nickname: 'Ayang',
    theme: 'blush-pink',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 24th birthday',
    heroLine1: 'To My Precious,',
    heroLine2: 'Ayang',
    heroSubtitle: '24 beautiful years of you. Bersama ayang, kami belajar bahwa dicintai dengan tulus adalah perasaan paling indah di dunia.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2002-07-15',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Ayang,',
    introText: [
      "Selamat ulang tahun yang ke-24 ya, ayang. 🎂✨",
      "Maaf ya ayang, kali ini kami cuman bisa ngucapin lewat hadiah kecil ini.",
      "Asal ayang tahu, kami nemuin ide ini gara-gara fyp TikTok pas ayang mau ultah.",
      "Mungkin ini cara semesta buat bantu kami ngasih sesuatu yang spesial buat ayang.",
      "Makasih ya ayang, karena ayang sudah sama kami terus.",
      "Makasih juga udah mau jalan-jalan sama kami terus.",
      "Kadang kami tahu ayang balek kerja capek banget...",
      "...tapi ayang masih aja sempet masakin ntuk kami.",
      "Ketulusan ayang bener-bener berarti banget buat kami.",
      "Love uu ayangg. ❤️"
    ],
    introSignOff: 'Love always, Wahyu',
    reasonSectionTitle: 'Our Precious Moments',
    reasons: [
      {
        title: 'Masakan Ayang',
        desc: 'Rasa capek ayang abis balek kerja seakan ilang pas ayang dengan tulus masih sempet masakin ntuk kami.'
      },
      {
        title: 'Jalan-Jalan Kita',
        desc: 'Tiap kali kita jalan-jalan bareng adalah memori indah yang pengen kami ulang terus sama ayang.'
      },
      {
        title: 'Kesabaran Ayang',
        desc: 'Makasih ya ayang udah selalu sama kami terus di setiap waktu tanpa pernah ngeluh.'
      },
      {
        title: 'Senyum Lelah Ayang',
        desc: 'Walaupun ayang lagi capek balek kerja, senyum ayang tetep jadi hal yang paling bikin kami tenang.'
      },
      {
        title: 'Ketulusan Ayang',
        desc: 'Cara ayang sayang sama kami bikin kami sadar betapa beruntungnya kami punya ayang.'
      },
      {
        title: 'Kehadiran Ayang',
        desc: 'Semua momen sederhana ini jadi luar biasa dan berarti banget karena ada ayang sama kami.'
      }
    ],
    photos,
    closingLine: 'You deserve the world, ayang.',
    sender: 'Wahyu Agus Setiawan',
    secretPhoto,
    secretCaption: 'Love uu ayangg. ❤️',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga di umur ayang yang baru ini, ayang selalu dikasih kesehatan dan rezeki yang berlimpah. Kami bakal selalu ada buat ayang. ❤️',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: Shape of my heart'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Via Audri Vitrah',
    theme: 'blush-pink',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Via (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "Shape of my heart" in Studio Editor!`);
}

main().catch(console.error);
