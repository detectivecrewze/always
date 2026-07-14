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
  const orderId = 'ORD-MRIVAF1J';
  let rawKvId = 'gift-1783916712268';
  // DO NOT STRIP PREFIX. The ID is exactly what the user gave!
  const kvId = rawKvId;

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = ["Happy", "19th", "Birthday", "Sayanggg", "Thank", "You", "For", "Always", "Being", "By", "My", "Side", "I", "Love", "You", "So", "Much"];
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
    recipient: 'Ghina',
    nickname: 'Sayang',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 19th birthday',
    heroLine1: 'To My Favorite Person,',
    heroLine2: 'Sayang',
    heroSubtitle: 'Makasih banyak yaa sayang uda nemenin aku sejauh iniii, you mean the entire world to me.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2007-07-14',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Sayangku,',
    introText: [
      "Happy 19th birthday, sayanggg! 🎂✨",
      "Di umur kamu yang baru ini, aku bener-bener cuma pengen liat kamu selalu happy dan sehat terus setiap harinya.",
      "Makasih banyak yaa sayang uda nemenin aku sejauh iniii, bener-bener grateful banget bisa kenal dan ada kamu di hidupku.",
      "Aku tau mungkin perjalanan kita ngga selalu mulus, tapi kamu selalu pilih buat tetep stay dan berjuang bareng aku.",
      "Maafinn kaloo menurut kamuu aku masih banyaakk kurangnyaa selama kita bareng.",
      "Terkadang aku sadar aku ngga sempurna, tapi ketulusan kamu selalu bikin aku pengen jadi versi terbaik dari diriku.",
      "Tapi aku janji, as long as it's about you, I'll definitely make an effort buat jadi cowok yang lebih baik lagi buat kamu. 🫶🏻",
      "Semoga semua hal baik selalu nyertai langkah kamu, dan semua mimpimu perlahan bisa terwujud.",
      "You deserve the whole world and more, sayangg. I love you so much!"
    ],
    introSignOff: 'Love, Arfha',
    reasonSectionTitle: 'Things I Love About You',
    reasons: [
      {
        title: 'Your Patience',
        desc: 'Kesabaran kamu buat ngadepin semua kurangku bener-bener bikin aku amazed banget.'
      },
      {
        title: 'Caring Banget',
        desc: 'Cara kamu merhatiin hal-hal kecil dari aku bikin aku ngerasa disayang banget.'
      },
      {
        title: 'Always Supportive',
        desc: 'Kamu selalu ada buat dukung aku kapanpun and I appreciate that so much.'
      },
      {
        title: 'Bikin Nyaman',
        desc: 'Sama kamu aku selalu ngerasa aman dan nyaman buat jadi diriku sendiri.'
      },
      {
        title: 'Your Effort',
        desc: 'Setiap usaha yang kamu kasih buat hubungan kita selalu bikin aku makin jatuh cinta.'
      },
      {
        title: 'My Safe Place',
        desc: 'Thank you for always being the home I want to go back to setiap harinya.'
      }
    ],
    photos,
    closingLine: 'I will always make an effort for you.',
    sender: 'Arfha',
    secretPhoto,
    secretCaption: 'I love you so much! 🫶🏻',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga di umur yang ke-19 ini kamu makin sukses, sehat, dan semua wish kamu terkabul yaa sayangg. As long as it is you, aku bakal terus berusaha jadi pacar yang lebih baik lagi. I love you endlessly. 🫶🏻',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: You Are My Everything (feat Red) - Glenn Fredly,Red'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Ghina',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Ghina (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "You Are My Everything (feat Red) - Glenn Fredly,Red" in Studio Editor!`);
}

main().catch(console.error);
