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
  const orderId = 'ORD-MRJ8K501';
  const kvId = 'auto-m8myk8c';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = [
    "Happy", "18th", "Birthday", "Bububb", "Thank", "You", "For", 
    "Coloring", "My", "Monochrome", "Life", "I", "Will", "Always", 
    "Be", "Here", "For", "You", "No", "Matter", "What", "Happens", 
    "I", "Love", "You", "So", "Much", "Forever", "And", "Always"
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
    recipient: 'Wulan',
    nickname: 'Bububb',
    theme: 'blush-pink',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 18th birthday',
    heroLine1: 'To My Endless Love,',
    heroLine2: 'Bububb',
    heroSubtitle: '18 beautiful years of you. You are the reason my monochrome life finally found its colors.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2008-07-13',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Sayang,',
    introText: [
      "Happy birthday, Bub! 🎂✨",
      "Makasih yaa udah dateng ke hidup aku yang awalnya monokrom ini jadi lebih berwarna karena kamu.",
      "Karena kamu, aku jadi pribadi yang jauh lebih baik dan akhirnya bisa nentuin plan aku ke depan.",
      "Aku tau aku belum bisa jadi yang terbaik, dan maafin aku kalau selama ini sering nyakitin kamu.",
      "Walaupun hubungan kita kadang kerasa ngga jelas dan kita harus terhalang jarak, please know that you're always on my mind every single second.",
      "Kamu itu acuan terbesar buat masa depan aku.",
      "Kamu pasti di sana juga lagi berjuang buat masa depan kamu kan? Semangat terus yaa buat PKL-nya!",
      "Aku tau itu ngga mudah, but I believe in you. Aku akan selalu ada di sini buat dengerin semua cerita dan keluh kesah kamu.",
      "Mungkin kedengarannya omong kosong setelah semua yang udah kita lalui, tapi aku pengen kamu tau kalau aku bener-bener sayang tulus sama kamu.",
      "Entah apa yang mungkin kamu denger dari orang lain tentang aku, remember that I am always here for you.",
      "Sekali lagi happy birthday, cintaku. Semoga dimudahkan segala urusannya dan kebahagiaan selalu nyertai langkahmu. Happy birthday, my love. ❤️"
    ],
    introSignOff: 'Love always, Endy',
    reasonSectionTitle: 'Why I Am So Grateful For You',
    reasons: [
      {
        title: 'Coloring My Life',
        desc: 'Kehadiran kamu bener-bener bikin hidup aku yang tadinya sepi jadi lebih berwarna.'
      },
      {
        title: 'Making Me Better',
        desc: 'Gara-gara kamu, aku selalu pengen terus berubah jadi cowok yang lebih baik lagi.'
      },
      {
        title: 'My Future Compass',
        desc: 'Berkat kamu, aku jadi tau arah dan punya plan yang jelas buat masa depan.'
      },
      {
        title: 'Staying In My Heart',
        desc: 'Walaupun kita jauhan, jujur aja pikiran aku selalu melayang ke kamu tiap saat.'
      },
      {
        title: 'Your Resilience',
        desc: 'Semangat terus ya buat PKL-nya, aku di sini selalu kagum sama perjuangan kamu.'
      },
      {
        title: 'Your Endless Grace',
        desc: 'Makasih ya udah mau nerima aku apa adanya walau kita sering lewatin masa sulit.'
      }
    ],
    photos,
    closingLine: 'I am always here for you.',
    sender: 'Endy',
    secretPhoto,
    secretCaption: 'Aku selalu sayang sama kamu, Bub. ❤️',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga panjang umur, dimudahkan segala urusannya, dan diberikan kebahagiaan yang melimpah. Aku di sini selalu ada buat kamu, Bub. Semangat terus buat masa depan kamu ya. I love you so much. ❤️',
    celebrateBtnText: 'tetap sayang ✨',
    musicUrl: 'FILL_MANUALLY: Shape of My Heart- back street boys'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Wulan',
    theme: 'blush-pink',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Wulan (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "Shape of My Heart- back street boys" in Studio Editor!`);
}

main().catch(console.error);
