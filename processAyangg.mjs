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
  const orderId = 'ORD-MRIRHULC';
  const kvId = 'auto-40510201';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Karena cuma ada 1 foto, kata pertamanya dibuat bermakna kalau berdiri sendiri
  const baseWords = [
    "Bestie✨", "Thank", "You", "For", "Being", "My", "Unbiological", 
    "Sibling", "I", "Love", "You", "So", "Much", "Forever", "And", "Always"
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
    recipient: 'Leo',
    nickname: 'Sayangku',
    theme: 'midnight-blue',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 20th birthday',
    heroLine1: 'To My Dearest Bestie,',
    heroLine2: 'Sayangku',
    heroSubtitle: '20 beautiful years of you. You are my chosen family, my LDR sibling, and my very best friend.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2006-07-23',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Sayangku,',
    introText: [
      "Selamat ulang tahun sahabatku, saudara kandung LDR-ku, dan ayangku! 🎂✨",
      "Semoga kamu selalu diberikan panjang umur, kesehatan, dan kebahagiaan yang melimpah.",
      "Terima kasih banyak ya untuk 2+ tahun ini udah mau bersahabat dan selalu ada buat aku.",
      "Semoga Allah senantiasa memberikan rezeki yang melimpah buat kamu dan juga keluarga di sana.",
      "Terima kasih udah jadi sosok yang sangat kuat, selalu melewati hari-harimu dengan sabar, dan ngga pernah nyerah.",
      "Terima kasih juga udah hadir dan memilihku sebagai sahabatmu, selalu nemenin aku dalam keadaan suka maupun duka.",
      "You always make me feel so special karena kamu selalu ngutamin aku selama ini.",
      "Jadi, izinkan aku membahagiakanmu di hari ulang tahunmu ini, walaupun cuma lewat pesan ini dan sedikit hadiah dari aku.",
      "I am so blessed to have a best friend like you. Happy birthday, my dearest Leo! ❤️"
    ],
    introSignOff: 'Love always, Ayangg mu 🤍✨',
    reasonSectionTitle: 'Why I Am So Grateful For You',
    reasons: [
      {
        title: 'My LDR Sibling',
        desc: 'Walaupun kita jauh, rasanya kayak punya saudara kandung sendiri yang selalu ngertiin aku.'
      },
      {
        title: 'Your Endless Strength',
        desc: 'Aku selalu kagum ngeliat gimana kuatnya kamu ngelewatin semua cobaan tanpa pernah nyerah.'
      },
      {
        title: 'Always Choosing Me',
        desc: 'Dari sekian banyak orang, terima kasih udah selalu milih aku buat jadi sahabat terbaikmu.'
      },
      {
        title: 'Through Ups and Downs',
        desc: 'Kamu selalu ada buat nemenin aku dalam suka dan duka, and I am forever grateful for that.'
      },
      {
        title: 'Making Me Special',
        desc: 'Cara kamu ngutamin dan memperlakukan aku tuh selalu berhasil bikin aku ngerasa bener-bener spesial.'
      },
      {
        title: 'Our Beautiful Bond',
        desc: 'Dua tahun lebih bersahabat sama kamu adalah salah satu anugerah terbaik yang pernah aku dapetin.'
      }
    ],
    photos,
    closingLine: 'My favorite unbiological sibling.',
    sender: 'Ayangg mu🤍✨',
    secretPhoto,
    secretCaption: 'Makasih udah jadi sahabat terbaikku. ❤️',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga semua doa baik berbalik ke kamu ya. Tetep kuat, tetep jadi sahabat terbaikku, dan semoga kita bisa terus bareng-bareng. I love you, bestie! ❤️',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Leo',
    theme: 'midnight-blue',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Leo (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "team choose" in Studio Editor!`);
}

main().catch(console.error);
