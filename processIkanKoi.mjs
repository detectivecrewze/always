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
  const orderId = 'ORD-MRKLUC86';
  const kvId = 'gift-1784028939432';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "1st", "Anniversary", "Kacang", "Thank", "You", "For", "Being", 
    "My", "Best", "Friend", "In", "Roblox", "Always", "✨"
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
    recipient: 'Ppeanut',
    nickname: 'Kacang',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 1st anniversary',
    heroLine1: 'To My Best Friend,',
    heroLine2: 'Kacang',
    heroSubtitle: 'Satu tahun penuh cerita, canda tawa, dan petualangan bareng di Roblox. Thank you for being such an amazing friend.',
    timeEnabled: true,
    timeTitle: 'Our Journey',
    timeStartDate: '2025-07-15', // 1 year ago
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Anniversary,',
    introHeadline3: 'Kacangg,',
    introText: [
      "Halo Kacang, sahabat main terbaikku.",
      "Nggak kerasa ya, udah setahun berlalu sejak kita mulai main bareng.",
      "Makasih banyak yaa udah jadi temen main terbaikku di Roblox selama ini.",
      "Makasih juga karena kamu selalu sabar dengerin semua keluh kesahku, dan selalu setia nemenin aku muncak ke segala gununggg.",
      "Meskipun kita mainnya cuma lewat layar, tapi persahabatan dan waktu bareng kamu ini rasanya berharga banget buatku.",
      "Aku harap kita bakal terus sahabatan, mabar, dan bersama dalam waktu yang lama ya."
    ],
    introSignOff: 'Best Wishes, Ikan Koi',
    reasonSectionTitle: 'Our Precious Moments',
    reasons: [
      {
        title: 'Teman Terbaik',
        desc: 'Dari sekian banyak player, aku bersyukur banget bisa ketemu dan mabar sama kamu.'
      },
      {
        title: 'Tempat Cerita',
        desc: 'Makasih udah selalu sabar jadi pendengar yang baik buat semua keluh kesahku.'
      },
      {
        title: 'Muncak Bareng',
        desc: 'Nemenin aku ke segala gunung di in-game selalu jadi momen seru yang nggak terlupakan.'
      },
      {
        title: 'Satu Tahun Kita',
        desc: 'Nggak kerasa udah 365 hari kita main bareng, semoga terus berlanjut ya.'
      },
      {
        title: 'Canda Tawa',
        desc: 'Setiap mabar sama kamu pasti selalu ada aja hal lucu yang bikin aku ketawa.'
      },
      {
        title: 'Harapanku',
        desc: 'Semoga persahabatan kita ini nggak cuma sementara, tapi buat waktu yang sangat lama.'
      }
    ],
    photos,
    closingLine: 'Thank you for making my days brighter.',
    sender: 'Ikan Koi',
    secretPhoto,
    secretCaption: 'Let\'s be friends for a very long time! ✨',
    closingPreTitle: 'here is to our friendship,',
    closingTitle1: 'Happy',
    closingTitle2: 'Anniversary',
    closingParagraph: 'Semoga ke depannya kita masih bisa terus mabar, muncak bareng, dan saling cerita. Thank you for being the best Roblox buddy, Kacang!',
    celebrateBtnText: 'let\'s play ✨',
    musicUrl: 'FILL_MANUALLY: Wonderwall - oasis'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Ppeanut',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Ppeanut (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Wonderwall - oasis'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
