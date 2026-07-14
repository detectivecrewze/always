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
  const orderId = 'ORD-MRKDN9TS';
  const kvId = 'auto-5yam97r';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "18th", "Birthday", "Bibinnn", "Makasii", "Yaa", "Udaa", "Sabar", 
    "Sama", "Dedee", "Sayang", "Banget", "Sama", "Kamu", "🩷"
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
    recipient: 'Anaa',
    nickname: 'Bibinnn',
    theme: 'ocean-breeze',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 18th birthday',
    heroLine1: 'To My Best Juspren,',
    heroLine2: 'Bibinnn',
    heroSubtitle: '18 years of your journey! Thank you for being the most patient person for dedee.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2008-07-16', // Corrected year from 2026 to 2008 for 18th birthday
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Bibinnn,',
    introText: [
      "Happy birthday Bibinnn! 🥳 Maapiinn dedee yaa banyaa salaa selama ini.",
      "Aku gaa nyangka banget bisa ketemu kamuu yang super duper sabar sama dedee.",
      "Gatau deh kamu terbuat dari apa, kok bisa-bisanya tahan sama ego dedee yang kadang nyebelin ini 🫣",
      "Makasii yaa binnn udaa sabar ngadepin ego akuu, maraa akuu, cemburuu akuu, dan gajelass akuu.",
      "Kamu tuh sabaarr truss ngadepin aku, sayangg bangett dehh walaupun kita cuma juspren yh wkwk.",
      "Tapii makasii bangett yaa udaa tetep samaa aku padhaal aku kadang kaya ginii.",
      "Happy birthday sekali lagi Bibinnn, doaa terbaik buatt kamuu pokoknyaa.",
      "Sering-sering call dedee yaa, betah-betah terus samaa dedee.",
      "Sering-sering main roblok sama dedee yaa jangan sama dia, main ml juga sama dedee aja jangan sama pt-an kamu ituu 😤"
    ],
    introSignOff: 'With love, Anaa (Dedee)',
    reasonSectionTitle: 'Kenapa Dedee Sayang',
    reasons: [
      {
        title: 'Kesabaran Extra',
        desc: 'Gatau kamu terbuat dari apa, sabar bangett ngadepin ego dedee selama ini.'
      },
      {
        title: 'My Just Friend',
        desc: 'Walaupun cuma juspren, tapi kamu selalu ada buat ngadepin gajelasnya akuu.'
      },
      {
        title: 'Temen Mabar',
        desc: 'Makasii udah jadi temen mabar roblok dan ml paling seruu buat dedee.'
      },
      {
        title: 'Suka Cemburu',
        desc: 'Maapin dedee yaa kalau sering cemburu liat kamu mabar sama pt-an kamu ituu.'
      },
      {
        title: 'Betah Sama Dedee',
        desc: 'Makasih yaa binnn udah tetep milih sama aku padahal aku sering ngambek.'
      },
      {
        title: 'Doa Buat Bibinn',
        desc: 'Semoga di umur 18 ini kamu makin sabar ngadepin dedee dan panjang umur yaa.'
      }
    ],
    photos,
    closingLine: 'Don\'t play with anyone else but me.',
    sender: 'Anaa',
    secretPhoto,
    secretCaption: 'Mabar yuk binnn! 🩷',
    closingPreTitle: 'here is to you,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Sering-sering mabar sama dedee terus yaa, betah-betah yaa binnn. Happy 18th Birthday Bibinnn! 💗',
    celebrateBtnText: 'mabar yuk ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Anaa',
    theme: 'ocean-breeze',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Bibinnn (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Let Team Decide'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
