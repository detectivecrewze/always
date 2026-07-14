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
  const orderId = 'ORD-MRKJX7N7';
  const kvId = 'gift-1784025392417';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "25th", "Birthday", "Yucaa", "I", "Am", "So", "Lucky", 
    "To", "Have", "You", "In", "My", "Life", "🩷"
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
    recipient: 'Yucaa',
    nickname: 'Yucaa 🩷',
    theme: 'blush-pink',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 25th birthday',
    heroLine1: 'To My Beautiful,',
    heroLine2: 'Yucaa',
    heroSubtitle: '25 beautiful years of your journey. Thank you for being the most precious part of my life.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2001-07-25', // Corrected year from 2026 to 2001 for 25th birthday
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "HAPPY BIRTHDAY SAYANGKU 🩷 selamat ulang tahun ya cintaaa!",
      "Hari ini hari yang spesial banget, karena hari ini adalah hari lahir orang yang paling berarti di hidupku.",
      "Dari semua hal yang terjadi dalam hidupku, kamu adalah bagian yang paling ingin selalu aku jaga.",
      "Dengan caramu yang sederhana tapi sangat berarti... kamu mungkin tidak selalu sadar, tapi kehadiranmu bikin semuanya terasa lebih ringan.",
      "Aku tidak butuh banyak hal untuk merasa bahagia, karena punya kamu saja, itu sudah lebih dari cukup.",
      "Di hari yang bahagia ini aku cuman mau doain semoga hal-hal baik selalu datang ke hidup kamu sayang.",
      "Semoga sehat selalu, panjang umur, dimudahkan segala urusannya, dan semua impian sayang bisa tercapai satu per satu, Aamiin.",
      "Sekali lagi selamat ulang tahun sayang, terimakasih sudah ada yaa cantikk 🫶"
    ],
    introSignOff: 'With all my love, Randiii',
    reasonSectionTitle: 'My Favorite Things About You',
    reasons: [
      {
        title: 'Kehadiranmu',
        desc: 'Kamu mungkin nggak sadar, tapi kehadiranmu selalu berhasil bikin semuanya terasa lebih ringan.'
      },
      {
        title: 'Bahagiaku Sederhana',
        desc: 'Aku nggak butuh banyak hal buat bahagia, karena punya kamu aja udah lebih dari cukup.'
      },
      {
        title: 'Bagian Terbaik',
        desc: 'Dari semua hal di hidupku, kamu adalah satu-satunya yang paling ingin selalu aku jaga.'
      },
      {
        title: 'Cara Sederhanamu',
        desc: 'Caramu mencintaiku mungkin sederhana, tapi rasanya sangat luar biasa berarti buatku.'
      },
      {
        title: 'Terima Kasih Cantik',
        desc: 'Makasih ya udah lahir dan hadir di dunia ini, makasih udah mau nemenin aku.'
      },
      {
        title: 'Doa Untukmu',
        desc: 'Semoga setiap langkah dan impianmu ke depannya selalu dipermudah sama Tuhan.'
      }
    ],
    photos,
    closingLine: 'Having you is more than enough.',
    sender: 'Randiii',
    secretPhoto,
    secretCaption: 'Terimakasih sudah ada cantik! 🩷',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga hari ini jadi awal dari tahun-tahun menakjubkan di depan sana. Terimakasih sudah ada, cantik. Happy 25th Birthday, Yucaa!',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: A thousand years-Christina perri'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'yucaa',
    theme: 'blush-pink',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Yucaa (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'A thousand years-Christina perri'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
