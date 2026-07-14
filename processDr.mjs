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
  const orderId = 'ORD-MRKGLTHQ';
  const kvId = 'gift-1784020436679';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "Birthday", "Yudha", "You", "Are", "So", "Strong", 
    "I", "Will", "Always", "Wait", "For", "You", "Here", "✨"
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
    recipient: 'Yudha Gangsar Rizki',
    nickname: 'Yudha',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy birthday',
    heroLine1: 'To A Strong Man,',
    heroLine2: 'Yudha',
    heroSubtitle: 'Untuk kamu yang sedang berjuang keras menaklukkan dunia. Selamat bertambah usia.',
    timeEnabled: false,
    timeTitle: 'Your Journey',
    timeStartDate: '2026-07-15',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Yudha,',
    introText: [
      "Selamat ulang tahun untuk laki-laki hebat yang selalu berusaha terlihat kuat.",
      "Aku tau beban yang kamu pikul nggak pernah mudah. Sebagai anak bungsu yang menanggung harapan keluarga, kamu udah ngelakuin yang terbaik.",
      "Di luar kamu selalu terlihat ceria, tapi aku tau sebenarnya ada banyak luka yang kamu simpan sendiri.",
      "Aku harap di usiamu yang baru ini, segalanya jadi semakin membaik buat kamu. Semoga bahumu dikuatkan, dan hatimu dilapangkan.",
      "Asal kamu tau, aku selalu ada di sini. Menunggu dengan sabar hari di mana aku bisa benar-benar diterima untuk jadi teman hidupmu.",
      "Aku siap menerima segala kurang dan lebihmu, menemani kamu melewati beratnya dunia ini.",
      "Selamat bertambah usia, Yudha. Semoga bahagia selalu mengiringi langkahmu ke depannya."
    ],
    introSignOff: 'Love always, Dr.',
    reasonSectionTitle: 'Things I See In You',
    reasons: [
      {
        title: 'Pria yang Kuat',
        desc: 'Kekuatanmu menghadapi beratnya beban hidup selalu berhasil membuatku kagum.'
      },
      {
        title: 'Senyum Ceria',
        desc: 'Di balik semua luka yang kamu simpan, senyum ceriamu selalu bisa menghangatkan suasana.'
      },
      {
        title: 'Tanggung Jawabmu',
        desc: 'Meski sebagai anak bungsu, kamu rela memikul beban keluarga dengan sangat luar biasa.'
      },
      {
        title: 'Ketegaran Hati',
        desc: 'Kamu ngajarin aku kalau menjadi dewasa itu tentang bertahan dan terus melangkah maju.'
      },
      {
        title: 'Sisi Rapuhmu',
        desc: 'Bahkan dengan segala kekurangan dan lukamu, kamu tetap sempurna di mataku.'
      },
      {
        title: 'Harapanku',
        desc: 'Aku nggak akan pernah lelah nunggu waktu di mana aku bisa jadi tempatmu bersandar seutuhnya.'
      }
    ],
    photos,
    closingLine: 'You are stronger than you think.',
    sender: 'Dr.',
    secretPhoto,
    secretCaption: 'Aku selalu ada buat kamu, kapan pun itu. ✨',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Teruslah melangkah, tapi jangan lupa untuk istirahat. Aku selalu ada di sini, siap menjadi teman hidupmu kapan pun kamu siap. Sekali lagi, Happy Birthday, Yudha.',
    celebrateBtnText: 'stay strong ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Yudha Gangsar Rizki',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Yudha (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Playlist: None'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
