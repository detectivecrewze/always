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
  const orderId = 'ORD-MRIOZK18';
  const kvId = 'auto-fcs4avs';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = ["Happy", "21st", "Birthday", "Sayang", "Thank", "You", "For", "Being", "My", "Home", "I", "Love", "You", "To", "The", "Moon", "And", "Back"];
  const words = baseWords.slice(0, orderPhotos.length);
  while (words.length < orderPhotos.length) {
    words.push("❤️");
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
    recipient: 'Tegar',
    nickname: 'Sayang',
    theme: 'classic-light',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 21st birthday',
    heroLine1: 'To My Safe Haven,',
    heroLine2: 'Sayang',
    heroSubtitle: '21 beautiful years of you, and I am endlessly grateful that you are my home.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2005-08-19',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Teruntuk',
    introHeadline2: 'Sayang',
    introHeadline3: 'Tercinta,',
    introText: [
      "Makasi ya sayang udah mau jadi rumah aku, i have no words to describe how thankful I am.",
      "Berkali kali aku bikin kesalahan berkali kali kamu maafin aku, maaf aku belum jadi pacar yang baik selama ini, i swear i'll be better.",
      "Aku sayang banget sama kamu, makasi udah hadir dihidup aku yaa.",
      "Makasi udah bertahan sama aku padahal aku senyebelin itu.",
      "Makasi buat semuanya sayang, i love you to the moon and back."
    ],
    introSignOff: 'Love, ur princess harum',
    reasonSectionTitle: 'Why I Am So Grateful For You',
    reasons: [
      {
        title: 'Being My Home',
        desc: 'Makasi udah selalu jadi tempat paling nyaman buat aku pulang setiap harinya.'
      },
      {
        title: 'Your Endless Patience',
        desc: 'Walaupun aku sering bikin salah dan nyebelin, kamu selalu sabar ngadepin aku.'
      },
      {
        title: 'Your Forgiveness',
        desc: 'Berkali-kali aku salah tapi kamu selalu kasih aku kesempatan untuk jadi lebih baik.'
      },
      {
        title: 'Staying By My Side',
        desc: 'Thank you for choosing to stay with me di segala kondisi yang kita lewatin.'
      },
      {
        title: 'Loving Me Unconditionally',
        desc: 'Kamu bikin aku ngerasa dicintai apa adanya dan itu priceless banget buat aku.'
      },
      {
        title: 'Everything You Do',
        desc: 'I have no words to describe how thankful I am buat semua hal kecil yang kamu lakuin.'
      }
    ],
    photos,
    closingLine: 'I love you to the moon and back.',
    sender: 'ur princess harum',
    secretPhoto,
    secretCaption: 'Makasi buat semuanya sayang.',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Thank you for being the most patient and loving person in my life. Makasi udah jadi rumah aku dan terus bertahan sama aku. I swear I will be a better girlfriend for you. Here is to celebrating you today and forever.',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: Sampai Jadi Debu - Banda Neira'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Tegar',
    theme: 'classic-light',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Tegar (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "Sampai Jadi Debu - Banda Neira" in Studio Editor!`);
}

main().catch(console.error);
