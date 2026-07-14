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
  const orderId = 'ORD-MRIU34WK';
  const kvId = 'auto-pv887lg';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = ["Distance", "Means", "Nothing", "When", "You", "Mean", "Everything", "To", "Me", "I", "Miss", "You", "So", "Much", "Adek", "Sayang", "Forever"];
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
    recipient: 'Aurelia Shevina Kian Cantika',
    nickname: 'Adek',
    theme: 'midnight-blue',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'my beautiful girl',
    heroLine1: 'To My Precious,',
    heroLine2: 'Adek',
    heroSubtitle: 'Distance means so little when someone means so much. I am endlessly grateful for you.',
    timeEnabled: true,
    timeTitle: 'Our Journey',
    timeStartDate: '2026-05-31',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Teruntuk',
    introHeadline2: 'Adek',
    introHeadline3: 'Sayang,',
    introText: [
      "Hai sayang, aku nulis ini karena aku pengen banget kamu tau seberapa bersyukurnya aku bisa kenal dan milikin kamu.",
      "Rasa sayang aku ke kamu bener-bener tulus, and I want you to feel that every single day no matter what.",
      "Aku tau sekarang kamu lagi berjuang ngelawan sinus, and I know it's really hard for you right now.",
      "Tolong tetep kuat dan cepet sembuh ya sayang. I wish I could be there with you.",
      "Walaupun kita LDR dan ngga bisa selalu bareng, please remember that I'm always here supporting and loving you dari jauh.",
      "Satu hal yang paling berharga buat aku adalah, sama kamu aku bisa bebas jadi diriku sendiri tanpa pernah takut dihakimi.",
      "Thank you for being my safe space. I miss you so much."
    ],
    introSignOff: 'Love, Vincen',
    reasonSectionTitle: 'Why I Am So Grateful For You',
    reasons: [
      {
        title: 'My Safe Space',
        desc: 'Sama kamu aku bisa bebas jadi diri sendiri tanpa pernah takut dihakimi.'
      },
      {
        title: 'Your Genuine Heart',
        desc: 'Ketulusan kamu selalu bikin aku ngerasa jadi cowok paling beruntung di dunia.'
      },
      {
        title: 'Being So Strong',
        desc: 'Ngelawan sakit sinus emang berat tapi kamu selalu berusaha kuat dan itu bikin aku bangga.'
      },
      {
        title: 'Closing The Distance',
        desc: 'Walaupun kita LDR, kasih sayang dan perhatian kamu selalu kerasa deket banget di hatiku.'
      },
      {
        title: 'My Daily Blessing',
        desc: 'Bisa kenal dan milikin kamu adalah salah satu hal yang paling aku syukuri setiap harinya.'
      },
      {
        title: 'Your Unconditional Love',
        desc: 'Terima kasih udah selalu nerima aku apa adanya dan selalu jadi tempat pulang paling nyaman.'
      }
    ],
    photos,
    closingLine: 'I will always be right here.',
    sender: 'Vincen',
    secretPhoto,
    secretCaption: 'Cepet sembuh ya sayang.',
    closingPreTitle: 'once again,',
    closingTitle1: 'See You',
    closingTitle2: 'Soon',
    closingParagraph: 'I know long distance is hard, but you are completely worth every mile. Cepet sembuh ya sayang dari sinusnya. Aku akan selalu ada di sini buat nungguin hari di mana kita bisa ketemu dan bareng-bareng lagi. I love you so much.',
    celebrateBtnText: 'miss you ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Aurelia Shevina Kian Cantika',
    theme: 'midnight-blue',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Aurelia (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "team choose" in Studio Editor!`);
}

main().catch(console.error);
