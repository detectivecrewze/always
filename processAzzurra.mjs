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
  const orderId = 'ORD-MRJZP4DD';
  const kvId = 'auto-mey61yk';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "24th", "Birthday", "Niken", "Thank", "You", "For", "Being", 
    "The", "Joy", "In", "My", "Life", "Bestie", "✨"
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
    recipient: 'Niken Dina Juliani',
    nickname: 'Bestie',
    theme: 'classic-light',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 24th birthday',
    heroLine1: 'To My Dearest,',
    heroLine2: 'Bestie',
    heroSubtitle: '24 beautiful years of your journey. Thank you for being the \'Joy\' to my life.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2002-07-18', // Corrected year from 2000 to 2002 for 24th birthday
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Niken,',
    introText: [
      "NIKEEEENNN! Happy 24th birthday to you!!! 🥳",
      "Semoga panjang umur, bahagia selalu, dikelilingi orang-orang baik, rezekinya lancar terus, dan apa pun yang kamu inginkan semoga bisa terwujud semua.",
      "Niken, makasih banyak ya udah mau stay dan bareng-bareng sama aku sampai 10 tahun ini.",
      "Terima kasih sudah menemani dan menyelamatkan aku di saat aku bener-bener ngerasa sendiri.",
      "You know what? Kehadiran kamu tuh bener-bener kayak karakter 'Joy' di film Inside Out buat aku.",
      "Tiap kali lagi sama kamu, aku bener-bener sebahagia itu... sampai rahangku sakit gara-gara ketawa terus dan sukses bikin aku lupa sama semua masalahku.",
      "I hope this year surprises you with everything you've been praying for.",
      "Keep shining, always. 🤍 Don't forget, you deserve all the beautiful things in life.",
      "I love you always, bestie! 🎂✨"
    ],
    introSignOff: 'With love, Azzurra',
    reasonSectionTitle: 'Things I Love About You',
    reasons: [
      {
        title: 'Like Joy in Inside Out',
        desc: 'Kehadiranmu bener-bener bawa warna kuning yang cerah dan bahagia banget di hidupku.'
      },
      {
        title: 'My Lifesaver',
        desc: 'Makasih ya udah nemenin dan nyelamatin aku di masa-masa paling sendiriku.'
      },
      {
        title: '10 Tahun Bersama',
        desc: 'Nggak kerasa udah satu dekade kita sahabatan, and I wouldn\'t trade it for anything.'
      },
      {
        title: 'Bikin Ketawa',
        desc: 'Cuma kamu yang bisa bikin aku ketawa sampai rahang sakit dan lupa semua masalah.'
      },
      {
        title: 'You Deserve The World',
        desc: 'Kamu pantes dapetin semua hal-hal cantik dan baik yang ada di dunia ini.'
      },
      {
        title: 'Doa Terbaik Buatmu',
        desc: 'Semoga semesta selalu ngasih kejutan indah buat semua doa yang kamu panjatkan.'
      }
    ],
    photos,
    closingLine: 'Keep shining, always.',
    sender: 'Azzurra',
    secretPhoto,
    secretCaption: 'Happy Birthday, Bestie! 🤍',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'I hope this year surprises you with everything you\'ve been praying for. Keep shining, always. Happy Birthday, Niken! 🤍',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: Bundle Of Joy - Michael Giacchino'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Niken Dina Juliani',
    theme: 'classic-light',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Niken Dina Juliani (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Bundle Of Joy - Michael Giacchino'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
