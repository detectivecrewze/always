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
  const orderId = 'ORD-MRIV86DG';
  const kvId = 'auto-iupnc3y';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = [
    "Happy", "18th", "Birthday", "Sayang", "Thank", "You", "For", 
    "Being", "So", "Sincere", "And", "Patient", "With", "Me", "I", 
    "Love", "You", "So", "Much", "More", "Than", "You", "Know", 
    "Sayanggg", "Forever", "And", "Always"
  ];
  const words = baseWords.slice(0, orderPhotos.length);
  while (words.length < orderPhotos.length) {
    words.push("🤍");
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
    recipient: 'Sehann',
    nickname: 'Sayang',
    theme: 'midnight-blue',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 18th birthday',
    heroLine1: 'To My Favorite Person,',
    heroLine2: 'Sayang',
    heroSubtitle: 'Happy 18th birthday! Kehadiran kamu sangatt berarti buat akuu.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2008-08-09',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Sayang,',
    introText: [
      "Happy birthday sayangkuuu! 🎊🤍",
      "Di hari spesial ini, aku cuma mau kamu tau kalau kehadiran kamu itu sangatt berarti buat akuu.",
      "Makasihh yaa udahh jadi pribadi yang sangat tulus, sabar, dan selalu berusaha ngelakuin yang terbaik dengan caramu sendiri.",
      "Semoga di umur barumu inii, kamu bisa makin dewasa, dan hal-hal baik pelan-pelan datang ke kamuu.",
      "Semoga semua yang kamu harapkan dan kamu inginkan bisa segera tercapai.",
      "Dan semoga apapun yang lagi kamu perjuangkan sekarang bisa dipermudahkan jalannya.",
      "Akuu harap kedepannya kita masih bisa saling mendukungg, saling jaga, dan tumbuh sama-sama ke arah yang lebih baikk.",
      "Selamat bertambah usiaaa sayangkuuu!",
      "Semoga hari ini berjalan dengan sangat bahagia, lancar, dan penuh gembiraaa. Happy 18! 🎊🤍"
    ],
    introSignOff: 'Lovee uu sayanggg, Rona',
    reasonSectionTitle: 'Why I Am So Grateful For You',
    reasons: [
      {
        title: 'Ketulusan Hati Kamu',
        desc: 'Makasihh yaa udah sayang sama aku setulus itu, rasanya tenang banget bisa sama kamuu.'
      },
      {
        title: 'Sabar Banget',
        desc: 'Kesabaran kamu ngadepin aku itu luar biasa, bikin aku ngerasa beruntung banget punya kamu.'
      },
      {
        title: 'Usaha Terbaikmu',
        desc: 'Aku selalu hargain cara kamu berusaha ngasih yang terbaik buat hubungan kita dengan caramu sendiri.'
      },
      {
        title: 'Saling Mendukungg',
        desc: 'Seneng banget kita bisa terus saling dukung dan tumbuh bareng ke arah yang lebih baikk.'
      },
      {
        title: 'Arti Kehadiranmu',
        desc: 'Cuma mau ngingetin lagi kalo kehadiran kamu itu bener-bener sangatt berarti buat akuu.'
      },
      {
        title: 'Masa Depan Kita',
        desc: 'Semoga kita bisa terus saling jaga, melewati semua hal baik dan buruk sama-sama yaa sayang.'
      }
    ],
    photos,
    closingLine: 'Tumbuh sama-sama yaa.',
    sender: 'ronakrisna',
    secretPhoto,
    secretCaption: 'Semoga kita bisa terus tumbuh sama-sama yaa sayang. 🤍',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga panjang umur dan semua doamu terkabul. I am always here for you, saling dukung dan jaga terus yaa kitaa. Lovee uu sayanggg! 🤍',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Sehann',
    theme: 'midnight-blue',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Sehann (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "team choose" in Studio Editor!`);
}

main().catch(console.error);
