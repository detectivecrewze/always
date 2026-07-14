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
  const orderId = 'ORD-MRKTKOQL';
  const kvId = 'auto-pz9makb';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Selamat", "Ulang", "Tahun", "Sayang", "Terima", "Kasih", "Sudah", "Lahir", 
    "Di", "Dunia", "Ini", "Love", "You", "Mas", "✨"
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
    recipient: 'Uyung',
    nickname: 'Sayang',
    theme: 'midnight-blue',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 25th birthday',
    heroLine1: 'To My Dearest,',
    heroLine2: 'Mas Uyung',
    heroSubtitle: '25 tahun perjalanan hidupmu. Makasih udah lahir ke dunia dan jadi kebahagiaannya Oca.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2001-07-15',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "Selamat ulang tahun yang ke-25 tahun sayang! 🥳",
      "Terima kasih banyak ya udah lahir ke dunia ini dan udah jadi pasangan yang paling terbaik buat aku.",
      "Makasih udah selalu ngalah, selalu sabar banget ngadepin egonya Oca, dan selalu berusaha buat nurutin semua keinginannya Oca.",
      "Aku bersyukur banget punya kamu yang nggak pernah kasar dan selalu berusaha sekuat tenaga buat bahagiain Oca selama ini.",
      "Semoga di umur yang baru ini kita bisa sama-sama makin dewasa, makin sayang satu sama lain, dan selalu saling menjaga dan melindungi.",
      "Semoga apa aja yang jadi keinginannya Uyung bisa cepet terwujud, selalu dipermudah, dan dilancarkan segala urusannya.",
      "Aamiin... love you mas! 🤍"
    ],
    introSignOff: 'Dengan penuh cinta, Oca',
    reasonSectionTitle: 'Hal yang Bikin Aku Bersyukur Punya Kamu',
    reasons: [
      {
        title: 'Selalu Ngalah',
        desc: 'Makasih ya udah selalu mau ngalah buat Oca di setiap keadaan.'
      },
      {
        title: 'Super Sabar',
        desc: 'Terima kasih udah jadi cowok yang paling sabar ngadepin semua ego dan manjanya Oca.'
      },
      {
        title: 'Selalu Mengusahakan',
        desc: 'Makasih karena selalu berusaha wujudin semua hal yang Oca pengen.'
      },
      {
        title: 'Nggak Pernah Kasar',
        desc: 'Bersyukur banget punya pasangan selembut kamu yang nggak pernah kasar sama sekali.'
      },
      {
        title: 'Selalu Bikin Bahagia',
        desc: 'Makasih buat semua usahamu yang nggak pernah capek buat bahagiain Oca.'
      },
      {
        title: 'Doa Terbaik',
        desc: 'Semoga kita bisa terus makin dewasa dan makin sayang satu sama lain, saling jaga selamanya.'
      }
    ],
    photos,
    closingLine: 'Semoga kita selalu bersama ya mas.',
    sender: 'Oca',
    secretPhoto,
    secretCaption: 'Happy Birthday, Sayang! 🤍',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga semua doa dan keinginanmu segera terwujud ya sayang. I love you mas! ✨',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Uyung',
    theme: 'midnight-blue',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Uyung (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Let Team Decide'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
