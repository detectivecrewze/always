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
  const orderId = 'ORD-MRKGTQ02';
  const kvId = 'auto-x4ldzjf';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "24th", "Birthday", "Bosfik", "Thank", "You", "For", "Being", 
    "You", "I", "Am", "So", "Grateful", "For", "You"
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
    recipient: 'Fikri Fauzan',
    nickname: 'Bosfik',
    theme: 'midnight-blue',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 24th birthday',
    heroLine1: 'To The Best Boss,',
    heroLine2: 'Bosfik',
    heroSubtitle: '24 beautiful years of your journey. I am so grateful to cross paths with you in this lifetime.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2002-07-15', // Corrected year from 2026 to 2002 for 24th birthday
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Kakk,',
    introText: [
      "Halllooo kaakk 👋🏻💗 hehehe.. baarakallah fii umrikk.. happy birthday 24 years old 🎂",
      "Nggak kerasa yaa udah hampir seperempat abad kamu hidup di dunia ini 🫣",
      "Dengan banyaknya up and down, lika-liku, suka duka, dan cerita yang udah pernah kakak alamin, aku selalu berdoa...",
      "Semoga di pembuka usia yang baru ini Allah selalu sediakan banyak kebahagiaan buat kakak di depan, selalu Allah deketin sama orang-orang baik dan lingkungan yang baik.",
      "Semoga diberikan umur panjang dan berkah, ditambahkan iman, ketaatan, rezeki, dan semua nikmat-Nya.",
      "Semoga punya masa depan yang indah, kehidupan yang stabil, dan bisa kasih manfaat ke ribuan bahkan jutaan manusia di muka bumi ini, hehe aaamiiinn!!! 💗",
      "Kaakk, I don't know if you know, tapi dari banyaknya orang di dunia ini, aku adalah salah satu yang sangat amat berterima kasih karena kakak udah hadir di dunia ini.",
      "Makasih udah ngizinin aku buat kenal dan bahkan bisa deket sama kakak.",
      "Makasih juga buat waktu, tenaga, dan materi yang udah kakak kasih selama ini, sedikit banyaknya aku bersyukurrrr banget akan hal itu 🫶🏻",
      "Entah ada aku atau ngga di masa yang akan datang nanti, aku harap kakak akan selalu jadi laki-laki yang baik yaa.",
      "Mungkin saat ini kakak jadi anak yang baik, tapi kelak aku yakin kakak pasti bakal jadi pasangan dan juga ayah yang sangat baik ✨",
      "Sekali lagi, happyyyy birthdayy my boss 🥳 semoga setelah ini hidup kakak akan selalu diberkahi, lebih heppyy dan sehat selalu 🫰🏻"
    ],
    introSignOff: 'Best Wishes, Adinduy',
    reasonSectionTitle: 'Things I Appreciate About You',
    reasons: [
      {
        title: 'The Best Boss',
        desc: 'Makasih buat waktu dan tenaga yang udah kakak luangkan buat aku selama ini.'
      },
      {
        title: 'Orang yang Baik',
        desc: 'Aku selalu berharap kakak akan terus jadi laki-laki yang baik buat siapa pun.'
      },
      {
        title: 'Penuh Syukur',
        desc: 'Bersyukur banget dari sekian banyak orang, aku bisa kenal dan deket sama kakak.'
      },
      {
        title: 'Hebatnya Kamu',
        desc: 'Ngelewatin berbagai up and down hidup, kakak tetap jadi pribadi yang luar biasa.'
      },
      {
        title: 'Future Great Dad',
        desc: 'Mungkin saat ini jadi anak yang baik, tapi kelak pasti jadi ayah yang baik juga.'
      },
      {
        title: 'Bermanfaat Bagi Semua',
        desc: 'Doaku semoga kakak selalu bisa kasih manfaat ke ribuan orang di bumi ini.'
      }
    ],
    photos,
    closingLine: 'May your life be full of blessings.',
    sender: 'Adinduy',
    secretPhoto,
    secretCaption: 'Happy Birthday, sehat selalu yaa! ✨',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga langkahmu ke depan selalu dipenuhi kebahagiaan dan semua doa baikmu dikabulkan. Once again, Happy 24th Birthday, Bosfik!',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Fikri Fauzan',
    theme: 'midnight-blue',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Bosfik (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Let Team Decide'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
