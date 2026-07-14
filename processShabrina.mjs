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
  const orderId = 'ORD-MRKQDCE0';
  const kvId = 'auto-pgs55c2';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "20th", "Birthday", "Sayang", "Thank", "You", "For", "Being", 
    "So", "Patient", "With", "Me", "I", "Love", "You"
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
    recipient: 'Muhammad Nurul Yaqin',
    nickname: 'Sayang',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 20th birthday',
    heroLine1: 'To My Dearest,',
    heroLine2: 'Sayang',
    heroSubtitle: '20 beautiful years of your journey. Thank you for always loving me patiently.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2006-07-15', // Corrected year from 2007 to 2006 for 20th birthday in 2026
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "Hallo ayang, Happy 20th Birthday yaa! 🎉",
      "First of all, makasih banyak yaa udah selalu luar biasa sabar ngadepin sifatku yang sering berubah-ubah.",
      "Makasih juga udah selalu ngertiin ego aku yang kadang susah banget buat disuruh ngalah.",
      "I know aku sering banget bikin kamu sakit hati gara-gara sifatku yang satu ini.",
      "Maafin aku ya sayang, kalau selama ini aku sering bikin kamu pusing dan ngerasa capek.",
      "But please know that I appreciate every little thing you do for me.",
      "Makasih banyak yaa sayangku, udah selalu stay and choosing to love me every single day 🫶🏻"
    ],
    introSignOff: 'With all my love, Shabrina',
    reasonSectionTitle: 'Things I Appreciate',
    reasons: [
      {
        title: 'Kesabaranmu',
        desc: 'Sabar banget ngadepin mood aku yang suka berubah-ubah tiap harinya.'
      },
      {
        title: 'My Safe Place',
        desc: 'Makasih yaa udah selalu berusaha ngertiin ego aku yang kadang susah ngalah.'
      },
      {
        title: 'Tetap Tinggal',
        desc: 'Walaupun aku sering bikin kamu pusing, kamu tetep milih buat stay sama aku.'
      },
      {
        title: 'The Way You Forgive',
        desc: 'Maafin aku yaa kalau sering bikin kamu sakit hati, thank you for always forgiving me.'
      },
      {
        title: 'My Support System',
        desc: 'Kamu selalu jadi orang pertama yang ngertiin semua kurang dan lebihku.'
      },
      {
        title: 'Terima Kasih Sayang',
        desc: 'Bersyukur banget punya cowok sebaik dan sesabar kamu di hidupku.'
      }
    ],
    photos,
    closingLine: 'Thank you for loving me patiently.',
    sender: 'Shabrina',
    secretPhoto,
    secretCaption: 'Happy Birthday sayangku! 🫶🏻',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga di umur yang baru ini kamu semakin bahagia dan sukses terus ya sayang. I promise to be better for us. Happy 20th Birthday! ✨',
    celebrateBtnText: 'love you ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Muhammad Nurul Yaqin',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Muhammad Nurul Yaqin (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Let Team Decide'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
