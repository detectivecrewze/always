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
  const orderId = 'ORD-MRKOQL0G';
  const kvId = 'auto-dr69plv';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "20th", "Birthday", "Sinboo", "I", "Love", "You", "Always", 
    "And", "Forever", "My", "Beautiful", "Girl", "🤍", "✨"
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
    recipient: 'Sinta Ulima Shada',
    nickname: 'Sinboo',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 20th birthday',
    heroLine1: 'To My Beautiful,',
    heroLine2: 'Sinboo',
    heroSubtitle: '20 beautiful years of your journey. Welcome to the new chapter of your life, my love.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2006-07-16', // Corrected from 2026 to 2006 for 20th birthday
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "Selamat Ulang Tahun, Sayang! 🤍",
      "Ciee... akhirnya umur 20, masuk kepala 2 juga. Selamat datang di babak baru!",
      "Semoga di usia yang sekarang, kamu makin bahagia, makin dewasa, makin kuat, dan semua impian cita-cita yang kamu perjuangkan bisa segera terwujud.",
      "Terima kasih yaa sayangku sudah hadir dan menjadi bagian dari hidupku.",
      "Bersamamu, banyak hal sederhana yang sebelumnya biasa aja sekarang terasa jauh lebih berarti.",
      "Jangan lupa bersyukur terus yaaa sayangku, semoga apa yang kamu perjuangkan sekarang tidak akan pernah sia-sia.",
      "Kamu sudah hebat banget bisa sampai di titik ini, dan aku yakin masih banyak hal baik yang sedang menunggumu di depan sana.",
      "Semoga senyummu selalu punya alasan untuk tetap ada, dan semoga aku masih bisa terus menjadi salah satu alasan itu.",
      "Selamat bertambah usia, cintaku. Semoga tahun ini dipenuhi cerita yang lebih indah, langkah yang lebih ringan, dan kebahagiaan yang tidak ada habisnya.",
      "Happy Birthday! I love you, always. 🤍"
    ],
    introSignOff: 'With all my love, Sinuboo',
    reasonSectionTitle: 'Things I Appreciate About You',
    reasons: [
      {
        title: 'Kehadiranmu',
        desc: 'Terima kasih yaa sayangku sudah hadir dan menjadi bagian paling berharga di hidupku.'
      },
      {
        title: 'Kamu Hebat',
        desc: 'Bangga banget sama kamu, kamu udah hebat bisa bertahan dan berjuang sampai di titik ini.'
      },
      {
        title: 'Bahagiaku Sederhana',
        desc: 'Bersamamu, banyak hal-hal kecil dan sederhana terasa jauh lebih bermakna.'
      },
      {
        title: 'Senyum Indahmu',
        desc: 'Semoga senyum manismu selalu punya alasan untuk tetap ada setiap harinya.'
      },
      {
        title: 'Perjuanganmu',
        desc: 'Aku yakin semua hal yang sedang kamu usahakan sekarang nggak akan pernah sia-sia.'
      },
      {
        title: 'Doa Untukmu',
        desc: 'Semoga kebahagiaan yang nggak ada habisnya selalu nemenin setiap langkah kamu.'
      }
    ],
    photos,
    closingLine: 'I will always be one of the reasons you smile.',
    sender: 'Sinuboo',
    secretPhoto,
    secretCaption: 'Happy Birthday, my love! 🤍',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga tahun ini dipenuhi cerita indah dan langkah yang lebih ringan buat kamu. I love you, always! ✨',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Sinta Ulima Shada',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Sinta Ulima Shada (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Let Team Decide'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
