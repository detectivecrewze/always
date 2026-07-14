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
  const orderId = 'ORD-MRK8BEZA';
  const kvId = 'gift-1784005360065';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "25th", "Birthday", "Sayang", "I", "Hope", "We", "Will", 
    "Always", "Find", "A", "Way", "Together", "Forever", "✨"
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
    recipient: 'Rizky',
    nickname: 'Sayang',
    theme: 'midnight-rose',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 25th birthday',
    heroLine1: 'To My Dearest,',
    heroLine2: 'Rizky',
    heroSubtitle: '25 years of your beautiful existence. So grateful to be a part of your story.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2001-07-19',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "Selamat ulang tahun ya, sayang. 🎉",
      "Melihat kamu bertambah usia hari ini, I just want you to know betapa bahagianya aku bisa jadi bagian dari cerita hidupmu.",
      "To be honest, kadang aku suka mikir entah sampai kapan cerita kita ini bakal terus berjalan...",
      "I know our path is not always easy. Jarak yang misahin kita, ego yang kadang sama-sama tinggi, dan jalan yang rasanya sulit banget buat dilewatin.",
      "Tapi satu hal yang pasti, I really hope we'll always find a way back to each other.",
      "Di usiamu yang ke-25 ini, aku cuma bisa berdoa semoga keberuntungan dan hal-hal baik selalu menghampiri langkahmu di depan sana.",
      "Whatever happens, please know that I am incredibly grateful to have you right now.",
      "Happy Birthday, Rizky. You deserve the world."
    ],
    introSignOff: 'With love, Icha',
    reasonSectionTitle: 'Our Journey Together',
    reasons: [
      {
        title: 'Cerita Kita',
        desc: 'Aku selalu merasa beruntung bisa punya peran dan ada di dalam cerita hidupmu.'
      },
      {
        title: 'Jarak & Jeda',
        desc: 'Walaupun jarak kadang bikin susah, aku tetep bersyukur kita masih saling menggenggam.'
      },
      {
        title: 'Melewati Ego',
        desc: 'Tiap kali kita bisa nurunin ego buat sama-sama lagi, that\'s when I know we\'re worth it.'
      },
      {
        title: 'Jalan Berliku',
        desc: 'Even when the road gets tough, aku harap kita selalu nemuin jalan buat terus bareng.'
      },
      {
        title: 'Keberuntunganmu',
        desc: 'Doaku selalu sama, semoga keberuntungan nggak pernah berhenti mengelilingimu.'
      },
      {
        title: 'Harapanku',
        desc: 'Entah sampai kapan kita akan berjalan, I just hope we make the best out of every second.'
      }
    ],
    photos,
    closingLine: 'Hoping for the best for us.',
    sender: 'Icha',
    secretPhoto,
    secretCaption: 'Happy Birthday, Rizky! ✨',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga langkahmu ke depan selalu dikelilingi keberuntungan, sayang. Wherever this journey takes us, I am glad I\'m here. Happy Birthday, Rizky!',
    celebrateBtnText: 'stay with me ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Rizky',
    theme: 'midnight-rose',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Rizky (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Let Team Decide'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
