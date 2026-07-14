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
  const orderId = 'ORD-MRJ55KAG';
  const kvId = 'auto-4ixrnch';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = [
    "Happy", "17th", "Birthday", "Sayang", "Thank", "You", "For", 
    "Coloring", "My", "World", "I", "Am", "So", "Lucky", "To", "Have", 
    "You", "I", "Love", "You", "More", "And", "More", "Everyday", "Forever"
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
    recipient: 'Lisa Gifa Aulia',
    nickname: 'Sayang',
    theme: 'midnight-rose',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 17th birthday',
    heroLine1: 'To My Beautiful Girl,',
    heroLine2: 'Sayang',
    heroSubtitle: '17 beautiful years of you. Bersamamu, duniaku yang sempat redup kini menemukan warnanya kembali.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2009-11-02',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Sayang,',
    introText: [
      "Selamat ulang tahun yang ke-17, sayang. 🎂✨",
      "Di hari istimewamu ini, aku cuma mau mengucapkan terima kasih yang sebesar-besarnya untukmu.",
      "Terima kasih karena kamu sudah hadir dan berhasil membuat hidupku menjadi berwarna lagi.",
      "Kehadiranmu di sampingku selalu berhasil membuatku merasa bahagia di setiap harinya.",
      "Melihat senyummu dan memilikimu adalah sebuah anugerah yang selalu aku syukuri.",
      "Aku merasa menjadi laki-laki yang paling beruntung karena bisa memilikimu.",
      "Semoga di umurmu yang baru ini, kamu selalu dikelilingi oleh kebahagiaan dan cinta yang luar biasa.",
      "I love you so much."
    ],
    introSignOff: 'Love always, Rizky',
    reasonSectionTitle: 'Things I Love About You',
    reasons: [
      {
        title: 'Menjadi Warnaku',
        desc: 'Kehadiranmu berhasil menghidupkan kembali warna-warni di duniaku yang sempat memudar.'
      },
      {
        title: 'Senyum Bahagiamu',
        desc: 'Melihat senyummu setiap hari adalah hal yang paling berhasil membuat hatiku merasa tenang.'
      },
      {
        title: 'Kehadiranmu',
        desc: 'Cukup dengan ada di sampingku, kamu selalu berhasil membuat segala hal terasa jauh lebih baik.'
      },
      {
        title: 'Kehangatan Hatimu',
        desc: 'Cara kamu menyayangiku membuatku sadar betapa beruntungnya aku bisa memilikimu seutuhnya.'
      },
      {
        title: 'Ketulusanmu',
        desc: 'Segala hal yang kamu lakukan dengan tulus selalu berhasil membuatku jatuh cinta berkali-kali.'
      },
      {
        title: 'Masa Depan Kita',
        desc: 'Bersamamu, aku tidak lagi takut melangkah karena aku tahu ada kamu yang selalu menggenggam tanganku.'
      }
    ],
    photos,
    closingLine: 'Semua tentangmu aku rayakan.',
    sender: 'Rizky',
    secretPhoto,
    secretCaption: 'Aku beruntung banget punya kamu. ❤️',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga panjang umur dan dilancarkan semua harapanmu. Aku akan selalu berusaha merayakanmu setiap harinya. I love you, sayang. ❤️',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: Semua aku di rayakan - Nadin Amizah'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Lisa Gifa Aulia',
    theme: 'midnight-rose',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Lisa (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "Semua aku di rayakan - Nadin Amizah" in Studio Editor!`);
}

main().catch(console.error);
