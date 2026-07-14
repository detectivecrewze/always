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
  const orderId = 'ORD-MRIONHUW';
  const kvId = 'auto-1iogqdp';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = [
    "Happy", "Level", "Up", "Day", "My", "Strong", "Boy", 
    "Thank", "You", "For", "Surviving", "And", "Fighting", 
    "Through", "Everything", "I", "Am", "So", "Proud", "Of", "You", 
    "I", "Love", "You", "So", "Much", "Always", "And", "Forever"
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
    recipient: 'Muhammad Rizki',
    nickname: 'Sayanggg',
    theme: 'midnight-blue',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 24th birthday',
    heroLine1: 'To My Strongest Boy,',
    heroLine2: 'Sayanggg',
    heroSubtitle: 'Happy level up day! 24 beautiful years of you fighting through life, and I am incredibly proud of the man you are today.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2002-07-18',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Sayanggg,',
    introText: [
      "Happy level up day!!! Make a wish for your b'day. 🎂✨",
      "Tahun ini umur kamu bertambah satu tahun dan jatah hidup kamu berkurang satu tahun juga.",
      "Terimakasih udah lahir di dunia ini dan bertahan hidup sejauh ini, you did great.",
      "Semakin kamu dewasa, pasti semakin banyak rintangannya, but it's okayy karna masih banyak orang yang sayang sama kamu, salah satunya aku ><",
      "Apapun susahnya, apapun sedihnya, dan apapun senangnya, semoga kamu bisa terus nikmatin dan bersyukur ya sayang.",
      "Terimakasih sudah menjadi kuat selama ini, walaupun kadang awalnya dikuat-kuatin aja, kamu selalu berhasil melewatinya.",
      "Di antara banyaknya sedih bahkan sempit yang menghampirimu, semoga kamu selalu diberi alasan-alasan kecil yang mampu membangkitkan semangatmu.",
      "Segala lelah dan sakit yang selalu mampu kamu hadapi, semoga kamu selalu berterimakasih kepada dirimu yang hebat itu.",
      "Sekali lagi happy birthday sayang 🥰 ayo kita mulai hal-hal seru hari ini!"
    ],
    introSignOff: 'Love always, Gina Reviana',
    reasonSectionTitle: 'Beautiful Moments With You',
    reasons: [
      {
        title: 'Seeing You Grow',
        desc: 'Setiap kali liat kamu berjuang jadi lebih dewasa tuh bener-bener bikin aku kagum dan bangga banget.'
      },
      {
        title: 'The Little Laughs',
        desc: 'Ketawa bareng buat hal-hal kecil selalu jadi momen yang paling aku kangenin setiap harinya.'
      },
      {
        title: 'Your Strong Shoulders',
        desc: 'Makasih udah selalu nguatin diri sendiri dan jadi tempat bersandar paling nyaman buat aku.'
      },
      {
        title: 'Our Silly Times',
        desc: 'Keseruan dan bercandaan random kita selalu sukses bikin segala lelah dan penat aku hilang.'
      },
      {
        title: 'Fighting Together',
        desc: 'Ngelewatin rintangan bareng-bareng bikin aku sadar kalau sama kamu everything will be alright.'
      },
      {
        title: 'Looking at You',
        desc: 'Bisa natap kamu dan ngeliat kamu tersenyum adalah pemandangan paling indah yang pernah aku punya.'
      }
    ],
    photos,
    closingLine: 'Keep surviving and smiling.',
    sender: 'Gina',
    secretPhoto,
    secretCaption: 'Ayo kita mulai hal seru hari ini dan wujudin mimpi baikmu! ><',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga semua harapan yang diinginkan menjadi kenyataan. Terus berterimakasih pada dirimu yang hebat ya sayang. Ayo kita lewatin lebih banyak hari seru sama-sama! Happy level up day! 🥰',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: selamat ulang tahun sendirian - halstage'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Muhammad Rizki',
    theme: 'midnight-blue',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Rizki (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "selamat ulang tahun sendirian - halstage" in Studio Editor!`);
}

main().catch(console.error);
