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
  const orderId = 'ORD-MRIW9SUA';
  const kvId = 'auto-pig0hhd';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = [
    "Happy", "20th", "Birthday", "Justin", "Thank", "You", "For", 
    "Being", "The", "Best", "Support", "System", "In", "My", "Life", 
    "I", "Am", "So", "Lucky", "To", "Have", "A", "Friend", "Like", "You"
  ];
  const words = baseWords.slice(0, orderPhotos.length);
  while (words.length < orderPhotos.length) {
    words.push("✨");
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
    recipient: 'Justin',
    nickname: 'Justin',
    theme: 'blush-pink',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 20th birthday',
    heroLine1: 'To My Dearest Best Friend,',
    heroLine2: 'Justin',
    heroSubtitle: '20 beautiful years of you. Ketemu dan sahabatan sama kamu adalah keberuntungan terbesar dalam hidupku.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2006-07-21',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Justin,',
    introText: [
      "Selamat ulang tahun ya! 🎂✨",
      "Semoga kamu panjang umur, sehat selalu, dan rezekinya makin melimpah.",
      "Makasih banyak ya udah mau nemenin hidupku sampai di titik ini.",
      "Makasih udah sabar banget ngadepin sikap egoisku dan nemenin segala proses yang lagi aku hadapin.",
      "Kamu selalu ada buat dengerin semua keluh kesah yang ada di hidupku.",
      "Aku berharap banget kamu bakal terus ada di sampingku.",
      "Karena jujur aja, bisa ketemu dan sahabatan sama kamu itu salah satu keberuntungan yang nggak bisa aku deskripsiin.",
      "Kamu itu salah satu bentuk kebahagiaan yang selama ini aku impiin.",
      "Aku bersyukur banget bisa ketemu manusia sebaik kamu.",
      "Dan makasih juga ya udah jadi support system terbaik di hidupku. ❤️"
    ],
    introSignOff: 'Love always, Babu hidupmu',
    reasonSectionTitle: 'Things I Admire About You',
    reasons: [
      {
        title: 'Kesabaranmu',
        desc: 'Makasih ya udah sabar banget ngadepin semua sifat egoisku.'
      },
      {
        title: 'Pendengar Terbaik',
        desc: 'Makasih udah selalu mau dengerin semua ceritaku selama ini.'
      },
      {
        title: 'Teman Berproses',
        desc: 'Kehadiranmu bikin semua proses hidupku kerasa jauh lebih ringan.'
      },
      {
        title: 'Manusia Berhati Baik',
        desc: 'Sahabatan sama orang sebaik kamu itu anugerah banget buat aku.'
      },
      {
        title: 'Support System-ku',
        desc: 'Kamu bener-bener support system terbaik yang pernah aku punya.'
      },
      {
        title: 'Keberuntunganku',
        desc: 'Punya sahabat kayak kamu tuh rasanya beruntung banget.'
      }
    ],
    photos,
    closingLine: 'Best friend forever.',
    sender: 'Babu hidupmu',
    secretPhoto,
    secretCaption: 'Makasih udah jadi support system terbaikku. ❤️',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga semua doa terbaik terkabul untukmu. Teruslah menjadi sahabat terbaikku dan tetaplah ada di sampingku. I love you, best friend. ❤️',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: Semua Aku Dirayakan - Nadin Amizah'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Justin',
    theme: 'blush-pink',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Justin (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "Semua Aku Dirayakan - Nadin Amizah" in Studio Editor!`);
}

main().catch(console.error);
