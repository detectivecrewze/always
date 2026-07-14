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
  const orderId = 'ORD-MRJ7SVOH';
  const kvId = 'auto-cquusr5';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = [
    "Happy", "15th", "Birthday", "Sayang", "Thank", "You", "For", 
    "Always", "Being", "So", "Patient", "With", "Me", "I", "Love", 
    "You", "More", "And", "More", "Every", "Single", "Day", "Keep", 
    "Fighting", "For", "Your", "Dreams", "And", "Future"
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
    recipient: 'Nabila Darma Avalita',
    nickname: 'Sayang',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 15th birthday',
    heroLine1: 'To My Special Girl,',
    heroLine2: 'Sayang',
    heroSubtitle: 'Happy 15th birthday! Aku selalu doain yang terbaik buat kamu, I am so proud of you.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2011-07-14',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Sayang,',
    introText: [
      "Selamat ulang tahun ya sayang! 🎂✨",
      "Semoga semua cita-cita yang kamu inginkan bisa cepat terwujud, panjang umur, sehat selalu, dan jadi anak yang berbakti.",
      "Semangat terus ya, jangan pernah menyerah buat ngejar impian-impian yang selama ini sering kamu ceritain ke aku.",
      "Aku akan selalu ada buat dukung dan support kamu. Semoga di umur yang baru ini kamu selalu diberi keberkahan penuh.",
      "Terima kasih ya selama ini udah mau sabar ngadepin aku, udah sayang, percaya, dan selalu ngertiin aku.",
      "Maafin juga ya kalo selama ini aku suka resek ke kamu hehe.",
      "Intinya, semoga di tahun ini kamu bisa jauh lebih baik dari tahun-tahun sebelumnya dan sukses di segala hal.",
      "Pokoknya aku selalu doain yang terbaik buat kamu, I'm so proud of you!",
      "Sekali lagi happy birthday yaa sayang. Semangat terus buat jalanin hari-harinya, I always support u.",
      "Semoga aku juga bisa terus nemenin langkah kamu ke depannya. Love u more! ❤️"
    ],
    introSignOff: 'Love, Fairuz',
    reasonSectionTitle: 'Things I Love About You',
    reasons: [
      {
        title: 'Sabar Banget',
        desc: 'Makasih ya udah sabar banget ngadepin aku yang kadang suka resek ini hehe.'
      },
      {
        title: 'Paling Percaya',
        desc: 'Kamu selalu percaya sama aku, dan itu bikin aku makin sayang sama kamu.'
      },
      {
        title: 'Selalu Ngertiin',
        desc: 'Cuma kamu cewek yang paling ngertiin aku banget di segala kondisi.'
      },
      {
        title: 'Mimpi-Mimpi Kamu',
        desc: 'Dengerin kamu cerita soal impian kamu tuh selalu bikin aku kagum tau.'
      },
      {
        title: 'Bikin Salting',
        desc: 'Cara kamu nyayangin aku kadang suka bikin aku salting sendiri hehe.'
      },
      {
        title: 'Calon Orang Sukses',
        desc: 'Aku yakin banget ke depannya kamu bakal jadi orang sukses, semangat terus ya!'
      }
    ],
    photos,
    closingLine: 'I will always support you.',
    sender: 'Fairuz',
    secretPhoto,
    secretCaption: 'Semoga aku bisa nemenin kamu terus. Love u more! ❤️',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga semua cita-citamu terwujud dan kamu jadi orang yang sukses. I am so proud of you, dan aku akan selalu ada buat support kamu. Semangat terus ya sayang! ❤️',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Nabila Darma Avalita',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Nabila (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "team choose" in Studio Editor!`);
}

main().catch(console.error);
