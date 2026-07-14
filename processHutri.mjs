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
  const orderId = 'ORD-MRKTXFCI';
  const kvId = 'auto-kjohyhj';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "24th", "Birthday", "Abang", "Sayangg", "I", "Am", "So", 
    "Proud", "Of", "You", "I", "Love", "You", "🤍"
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
    recipient: 'Yadi Saputra',
    nickname: 'abang sayangg',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 24th birthday',
    heroLine1: 'To My Dearest,',
    heroLine2: 'Abang Sayangg',
    heroSubtitle: '24 beautiful years of your journey. So proud to call you mine.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2002-07-18',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "Happy 24th birthday, abang sayangg! 🤍",
      "Di hari spesial ini, I just want you to know betapa bersyukurnya aku karena semesta mempertemukan kita.",
      "Aku selalu bangga banget bisa memiliki abang, melihat caramu berjuang dan berusaha setiap harinya.",
      "Semoga semua doa, harapan, dan impian abang satu per satu bisa segera tercapai ya.",
      "My deepest prayer is that Allah always blesses you with good health, kelancaran rezeki, dan kebahagiaan yang nggak ada habisnya.",
      "May He always protect you wherever you go, and keep you safe in His endless grace.",
      "I promise to always be by your side, supporting every step you take.",
      "I love you so much, abang. Enjoy your special day! ✨"
    ],
    introSignOff: 'With love, Hutri Annisak',
    reasonSectionTitle: 'Why I Am So Proud of You',
    reasons: [
      {
        title: 'My Biggest Pride',
        desc: 'Aku selalu bangga sama semua kerja keras dan usahamu selama ini.'
      },
      {
        title: 'Your Beautiful Heart',
        desc: 'You have the kindest heart that always makes me feel so loved and safe.'
      },
      {
        title: 'Your Endless Effort',
        desc: 'Terima kasih selalu berusaha jadi versi terbaik dari dirimu buat aku.'
      },
      {
        title: 'A Blessing to Me',
        desc: 'You are truly one of the most beautiful blessings yang pernah Tuhan kasih.'
      },
      {
        title: 'My Safe Place',
        desc: 'Bersamamu selalu ngasih rasa tenang yang nggak bisa aku dapetin di tempat lain.'
      },
      {
        title: 'The Best Partner',
        desc: 'I wouldn\'t want to spend this beautiful journey with anyone else but you.'
      }
    ],
    photos,
    closingLine: 'I will always be by your side.',
    sender: 'Hutri Annisak',
    secretPhoto,
    secretCaption: 'Happy Birthday, Abang! 🤍',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'May all your beautiful dreams come true. Aku bakal selalu di sini buat abang. Happy Birthday! 🤍',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: until i found you - stephen sanchez'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Yadi Saputra',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Yadi Saputra (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'until i found you - stephen sanchez'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
