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
  const orderId = 'ORD-MRKBJS25';
  const kvId = 'auto-cab0zpa';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery quotes matching exact photo count
  const baseWords = [
    "You", "Always", "Give", "Me", "The", "Best", "Surprises", 
    "And", "Show", "Your", "Love", "Through", "Actions", "Every", "Day", "I", "Love", "You"
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
    recipient: 'Dyp',
    nickname: 'Sayang',
    theme: 'velvet-purple',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'since our first dinner',
    heroLine1: 'To My One And Only,',
    heroLine2: 'Dyp',
    heroSubtitle: 'Setiap momen sejak dinner pertama kita di Kupang selalu jadi kejutan yang indah. Here\'s to your silent care and loud love.',
    timeEnabled: true,
    timeTitle: 'Since Our First Dinner',
    timeStartDate: '2025-10-19',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Thank',
    introHeadline2: 'You,',
    introHeadline3: 'Sayang,',
    introText: [
      "Makasih ya udah selalu ngasih kejutan-kejutan yang mindblowing banget buat aku.",
      "Kadang aku suka mikir, kok bisa ya kamu selalu ngerti apa yang aku butuhin, padahal kamu tuh jarang banget ngomong.",
      "Kamu selalu mikirin aku dan mastiin semuanya fine, walaupun keseringan kamu ngelakuinnya diam-diam di balik layar.",
      "Jujur, punya pasangan yang nggak banyak kata tapi langsung action tuh bikin aku ngerasa bener-bener spesial.",
      "But seriously, I appreciate every little thing you do for us. It means the world to me.",
      "Cuma ya... walaupun kejutan kamu selalu berhasil bikin aku speechless, kayaknya next time kita bisa deh ngobrol-ngobrol dulu hehe.",
      "Thank you for loving me the way you do, sayang."
    ],
    introSignOff: 'Love always, Snp',
    reasonSectionTitle: 'Things I Appreciate About You',
    reasons: [
      {
        title: 'Your Actions',
        desc: 'Kamu tuh emang nggak banyak ngomong, tapi action kamu selalu ngebuktiin semuanya.'
      },
      {
        title: 'Mind-blowing Surprises',
        desc: 'Selalu ada aja cara kamu bikin aku kaget sama kejutan yang bener-bener mindblowing.'
      },
      {
        title: 'Behind The Scenes',
        desc: 'Diem-diem selalu mikirin aku dan ngelakuin yang terbaik buat kita di balik layar.'
      },
      {
        title: 'Silent Love',
        desc: 'Cara kamu sayang sama aku tuh bikin aku ngerasa bener-bener aman and appreciated.'
      },
      {
        title: 'Always On Your Mind',
        desc: 'Makasih ya udah selalu jadiin aku prioritas di setiap hal yang kamu lakuin.'
      },
      {
        title: 'The First Dinner',
        desc: 'Sejak dinner pertama kita di Kupang, hari-hariku jadi jauh lebih berwarna.'
      }
    ],
    photos,
    closingLine: 'You are my favorite surprise.',
    sender: 'Snp',
    secretPhoto,
    secretCaption: 'Let\'s communicate more, tapi jangan pernah berhenti sayang sama aku ya! ✨',
    closingPreTitle: 'here is to us,',
    closingTitle1: 'Endless',
    closingTitle2: 'Journey',
    closingParagraph: 'I really love how you show your care through actions. Makasih banyak ya buat semua kejutan mindblowing yang udah kamu kasih. Here\'s to more surprises, endless love, and maybe a little more talking beforehand haha ❤️',
    celebrateBtnText: 'cheers ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Dyp',
    theme: 'velvet-purple',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Dyp (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Let Team Decide (Random)'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
