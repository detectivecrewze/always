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
  const orderId = 'ORD-MRKOTHNJ';
  const kvId = 'auto-7zfy3jv';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "28th", "Birthday", "Handsome", "I", "Love", "You", "More", 
    "Than", "Words", "Can", "Say", "My", "Love", "✨"
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
    recipient: 'Shakeelkhan',
    nickname: 'My man',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 28th birthday',
    heroLine1: 'To My Everything,',
    heroLine2: 'My Man',
    heroSubtitle: '28 beautiful years of your journey. Thank you for making my life brighter every single day.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '1998-07-12', // Corrected from 2026 to 1998 for 28th birthday
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Handsome,',
    introText: [
      "Happy Birthday, my love! ❤️",
      "I just want you to know that you make my life brighter and my heart happier every single day.",
      "I am so incredibly grateful to have you in my life.",
      "I hope this year brings you endless happiness, good health, success, and all the love you truly deserve.",
      "Thank you for being such an amazing man to me.",
      "No matter where life takes us, please remember that I'll always be right here cheering for you.",
      "Enjoy your special day, handsome.",
      "I love you more than words can say. Happy Birthday! 🎉🎂"
    ],
    introSignOff: 'Forever yours, Ida',
    reasonSectionTitle: 'Things I Love About You',
    reasons: [
      {
        title: 'You Make Me Happy',
        desc: 'You have this beautiful way of making my heart happier every single day.'
      },
      {
        title: 'You Are My Light',
        desc: 'Thank you for making my life brighter just by being in it.'
      },
      {
        title: 'An Amazing Man',
        desc: 'I am forever grateful to be loved by such an amazing man like you.'
      },
      {
        title: 'You Deserve The World',
        desc: 'You truly deserve endless happiness, success, and all the good things in life.'
      },
      {
        title: 'My Biggest Pride',
        desc: 'No matter where life takes you, I will always be your biggest cheerleader.'
      },
      {
        title: 'Beyond Words',
        desc: 'I love you in a way that words could never fully explain.'
      }
    ],
    photos,
    closingLine: 'I will always be cheering for you.',
    sender: 'Ida',
    secretPhoto,
    secretCaption: 'Happy Birthday, Handsome! ❤️',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'No matter where life takes us, I will always be right here cheering for you. Enjoy your special day, handsome!',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: Risk it all - Bruno Mars'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Shakeelkhan',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Shakeelkhan (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Risk it all - Bruno Mars'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
