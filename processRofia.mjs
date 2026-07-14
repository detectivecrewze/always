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
  const orderId = 'ORD-MRIQLL4F';
  const kvId = 'auto-rgeh7zf';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = ["Wishing", "You", "The", "Happiest", "24th", "Birthday", "Ever", "Rofia", "May", "All", "Your", "Dreams", "Come", "True", "Always", "Be", "Happy"];
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
    recipient: 'Rofia Ananda',
    nickname: 'Rofia',
    theme: 'blush-pink',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 24th birthday',
    heroLine1: 'To Someone Special,',
    heroLine2: 'Rofia Ananda',
    heroSubtitle: '24 years of you being an amazing person. Wishing you all the best today and always.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2002-07-17',
    introPreTitle: 'a message for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Rofia',
    introText: [
      "Hai 👋👋 selamat ulang tahun, ya 🎂🍰.",
      "Semoga hari ini jadi momen yang spesial buatmu, dan semoga setiap langkah yang kamu ambil ke depan selalu dipenuhi hal-hal baik.",
      "Aku harap kamu selalu dikelilingi orang-orang yang bisa bikin kamu tersenyum.",
      "Orang-orang yang bisa ngingetin kamu kalau kamu istimewa, dan yang bisa nemenin kamu melewati hari-hari susah sekalipun.",
      "Aku ngga mau ini terdengar aneh, tapi aku cuman mau bilang kalau aku selalu berharap yang terbaik buatmu.",
      "Semoga semua impian dan tujuanmu tercapai, dan kamu bisa terus berkembang jadi versi terbaik dari dirimu.",
      "Selamat ulang tahun, semoga hidupmu selalu penuh kebahagiaan, tawa, dan kenangan indah."
    ],
    introSignOff: 'Best, ex',
    reasonSectionTitle: 'Things I Admire About You',
    reasons: [
      {
        title: 'Your Kind Heart',
        desc: 'Kamu selalu punya cara untuk peduli sama orang-orang di sekitarmu.'
      },
      {
        title: 'Always Growing',
        desc: 'Aku selalu kagum liat gimana kamu terus berusaha jadi versi terbaik dari dirimu.'
      },
      {
        title: 'Your Bright Smile',
        desc: 'Senyum kamu selalu bisa bawa aura positif buat orang lain.'
      },
      {
        title: 'Staying Strong',
        desc: 'Ngelewatin hari susah ngga gampang tapi kamu selalu bisa bertahan.'
      },
      {
        title: 'Being Special',
        desc: 'Tanpa kamu sadari, kamu itu bener-bener istimewa buat orang-orang di sekitarmu.'
      },
      {
        title: 'Inspiring Others',
        desc: 'Cara kamu ngejar impian itu selalu ngasih semangat buat siapapun yang liat.'
      }
    ],
    photos,
    closingLine: 'Wishing you the best.',
    sender: 'ex',
    secretPhoto,
    secretCaption: 'Semoga impianmu tercapai.',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga semua impian dan tujuanmu di usia yang baru ini bisa tercapai. Aku selalu berharap yang terbaik buatmu. Have a wonderful birthday filled with happiness and beautiful memories.',
    celebrateBtnText: 'wishing you well ✨',
    musicUrl: 'FILL_MANUALLY: off my face - justin bieber'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Rofia Ananda',
    theme: 'blush-pink',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Rofia (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "off my face - justin bieber" in Studio Editor!`);
}

main().catch(console.error);
