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

const orderId = 'ORD-MRIPNZ4Y';
const kvId = 'auto-gk4w9q6';

const order = await cfGet(`order:${orderId}`);
const orderPhotos = (order && order.photos) ? order.photos : [];
const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

// 9 foto — buat 9 kata yang membentuk kalimat manis
const words = ["Happy", "19th", "Birthday", "Cintaa", "I", "Love", "You", "So", "Much"];

const photos = [];
for (let i = 0; i < orderPhotos.length; i++) {
  photos.push({
    url: orderPhotos[i] || '',
    caption: words[i] || ''
  });
}

const giftData = {
  recipient: 'Aqila Nadhiratuz Zahra',
  nickname: 'Cinta',
  theme: 'ocean-breeze',
  gateTitle: 'Something Special For u',
  gateSubtitle: 'Something Special For u',
  heroPreTitle: 'happy birthday',
  heroLine1: 'To My Favorite Human,',
  heroLine2: 'Aqila Nadhiratuz Zahra',
  heroSubtitle: '19 beautiful years of you making the world a better place.',
  timeEnabled: true,
  timeTitle: 'Your Journey',
  timeStartDate: '2007-07-28',
  introPreTitle: 'a letter for you',
  introHeadline1: 'Teruntuk',
  introHeadline2: 'Cinta',
  introHeadline3: 'Sayang,',
  introText: [
    "Selamat ulang tahun yang ke-19, ya! Di umur yang baru ini, doa aku buat kamu bener-bener banyak banget.",
    "Semoga kamu selalu dikasih kesehatan yang baik, kebahagiaan yang luas, dan ketenangan hati dalam segala situasi.",
    "Aku tahu perjalanan ke depan pasti punya tantangannya sendiri. Jadi, tetap semangat ya buat ngejar semua impian, cita-cita, dan tujuan hidup yang udah kamu susun.",
    "Jangan pernah ragu sama kemampuan diri kamu sendiri. Kalau nanti ada rasa lelah, itu wajar, tapi jangan pernah menyerah ya.",
    "Aku selalu berdoa semoga segala urusanmu (pendidikan, karier, maupun rencana-rencana masa depanmu) selalu dipermudah, dilancarkan, dan dibukakan jalan terbaiknya.",
    "Semoga kamu selalu dijaga, dilindungi, dan dikelilingi oleh hal-hal serta orang-orang yang baik. Aku bakal selalu ada di sini buat support dan nemenin kamu berjuang."
  ],
  introSignOff: 'Love, Fahrezi',
  reasonSectionTitle: 'The Moments I Treasure With You',
  reasons: [
    {
      title: 'Our First Time Out Together',
      desc: 'Momen itu aku tau ada yang beda dari kamu dan aku ngga mau lepas.'
    },
    {
      title: 'Your Bright Laugh',
      desc: 'Suara tawa kamu genuine banget, setiap dengar hari aku langsung terasa lebih ringan.'
    },
    {
      title: 'Our Deepest Conversations',
      desc: 'Ngga banyak orang yang bisa bikin aku nyaman buat buka diri, kamu salah satunya.'
    },
    {
      title: 'Your Inner Strength',
      desc: 'Melihat kamu bertahan dan terus berjuang bikin aku makin salut sama kamu.'
    },
    {
      title: 'Ordinary Days With You',
      desc: 'Bahkan hal-hal kecil bersamamu adalah momen yang paling aku ingat dan syukuri.'
    },
    {
      title: 'Always Here For You',
      desc: 'Semua momen kita bareng bikin aku makin yakin buat terus ada buat kamu.'
    }
  ],
  photos,
  secretPhoto,
  secretCaption: 'Ini foto spesial dari orang yang paling sayang sama kamu. Happy birthday, Cinta 🤍',
  closingTitle1: 'Happy Birthday,',
  closingTitle2: 'Aqilaa 🌊',
  closingText: 'Semoga tahun ke-19 ini jadi tahun paling penuh warna buat kamu. Aku di sini, selalu — buat nemenin kamu berjuang, tumbuh, dan bahagia. I love you, keep going ya.',
  celebrateBtnText: 'celebrate ✨',
  musicUrl: 'FILL_MANUALLY: Love. - Wave To Earth',
};

const draftData = {
  kvId,
  orderId,
  sender: 'Fahrezi',
  recipient: 'Aqila Nadhiratuz Zahra',
  nickname: 'Cinta',
  moment: 'Ultah (ke-19)',
  theme: 'ocean-breeze',
  relationship: 'Pasangan',
  recipientBirthdate: '2007-07-28',
  tone: ['Indoglish', 'Santai'],
  reasonChoice: 'moments',
  musicChoice: 'playlist',
  music: 'Love. - Wave To Earth',
  message: order?.message || '',
  status: 'generated',
  createdAt: new Date().toISOString(),
};

console.log('Saving gift data...');
await cfSet(`gift:${kvId}`, giftData);
console.log('Saving draft data...');
await cfSet(`draft:${kvId}`, draftData);
console.log(`✅ Done! Gift for Aqila (${kvId}) has been saved.`);
console.log(`🎵 REMINDER: Fill musicUrl manually for "Love. - Wave To Earth" in Studio Editor!`);
