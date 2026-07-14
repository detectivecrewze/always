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
  const orderId = 'ORD-MRK47435';
  const kvId = 'auto-iqu8581';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "20th", "Birthday", "Sekar", "Cantik", "I", "Am", "So", 
    "Proud", "Of", "You", "I", "Love", "You", "✨"
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
    recipient: 'Sekar Cantik',
    nickname: 'Sayang',
    theme: 'midnight-blue',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 20th birthday',
    heroLine1: 'To My Beautiful,',
    heroLine2: 'Sekar Cantik',
    heroSubtitle: '20 beautiful years of your journey. I am so incredibly proud of everything you do.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2006-07-29', // Corrected from 2026 to 2006 for 20th birthday
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "Happy 20th Birthday, sayangkuu! 🥳",
      "Semoga kamu selalu sehat, bahagia terus, dan dilancarkan semua rezekinya.",
      "Sayang, I just want you to know how incredibly proud I am of you.",
      "Banyak banget rintangan dan cobaan yang udah kamu hadapi selama ini, tapi kamu selalu milih untuk tetep kuat dan selalu ceria.",
      "Aku juga bangga bangettt akhirnya kamu bisa kuliah di luar negeri! Semoga semua urusan kuliahmu di sana selalu lancar ya, sayang.",
      "Wherever you are, please remember that I'll always be here to support you.",
      "Aku akan selalu bangga sama kamu, no matter what.",
      "I love you so much, sayangku cantik. 🤍"
    ],
    introSignOff: 'With all my love, Danu',
    reasonSectionTitle: 'Things I Love About You',
    reasons: [
      {
        title: 'Your Endless Strength',
        desc: 'Bangga banget liat kamu bisa ngelewatin semua rintangan dan tetep kuat.'
      },
      {
        title: 'Your Cheerful Soul',
        desc: 'Walaupun banyak cobaan, kamu selalu berhasil buat tetep ceria and spread positivity.'
      },
      {
        title: 'Kuliah di LN',
        desc: 'Super proud of you for making it to study abroad! Semangat terus kuliahnya yaa sayang.'
      },
      {
        title: 'My Endless Support',
        desc: 'Apapun yang kamu lakuin, aku bakal selalu ada di belakang buat support kamu.'
      },
      {
        title: 'I\'m So Proud',
        desc: 'Every single day, you always give me new reasons to be proud of you.'
      },
      {
        title: 'I Love You',
        desc: 'Makasih ya udah jadi sayangku yang paling cantik dan selalu bikin aku jatuh cinta.'
      }
    ],
    photos,
    closingLine: 'I will always be proud of you.',
    sender: 'Danu',
    secretPhoto,
    secretCaption: 'Happy Birthday, Cantik! 🤍',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga selalu lancar kuliahmu di sana ya sayang. Aku selalu support dan bangga banget sama kamu. I love you so much! ✨',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: Anything you want- Reality Club'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Sekar Cantik',
    theme: 'midnight-blue',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Sekar Cantik (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Anything you want- Reality Club'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
