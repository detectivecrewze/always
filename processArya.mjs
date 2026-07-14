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
  const orderId = 'ORD-MRJA1OEM';
  const kvId = 'auto-royhbad';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = [
    "Happy", "27th", "Birthday", "Bee", "Thank", "You", "For", 
    "Being", "My", "Reason", "To", "Come", "Back", "Home", "I", 
    "Can't", "Wait", "To", "See", "You", "Again", "I", "Love", 
    "You", "So", "Much", "And", "Always"
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
    recipient: 'Rizha',
    nickname: 'Bee',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 27th birthday',
    heroLine1: 'To My Favorite Person,',
    heroLine2: 'Bee',
    heroSubtitle: '27 beautiful years of you. Kamu adalah satu-satunya alasanku untuk kembali.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '1999-07-15',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Bee,',
    introText: [
      "Happy birthday ya, Bee! 🎂✨",
      "Terima kasih banyak udah lahir dan hadir ke dunia ini.",
      "Kamu harus tau, kamu itu satu-satunya alasanku buat terus berjuang dan pengen cepet-cepet kembali pulang.",
      "Please always take good care of yourself ya, apalagi pas kita lagi jauh kayak gini.",
      "I know being apart is hard, tapi aku pengen kita tetep saling percaya satu sama lain.",
      "Percaya ya Bee, kalau di ujung penantian kita nanti, pasti ada keindahan yang udah nungguin kita.",
      "Semoga di umur kamu yang baru ini, semua hal baik selalu nyertain langkah kamu.",
      "I love you so much, and I can't wait to see you again soon."
    ],
    introSignOff: 'Love always, Arya',
    reasonSectionTitle: 'Why I Am So Grateful For You',
    reasons: [
      {
        title: 'My Reason to Return',
        desc: 'Jujur aja, kamu tuh satu-satunya alesan yang selalu bikin aku pengen cepet pulang.'
      },
      {
        title: 'Your Trust',
        desc: 'Makasih ya udah selalu percaya sama aku, itu bikin aku tenang banget walau kita lagi LDR-an.'
      },
      {
        title: 'Selalu Nungguin Aku',
        desc: 'Sabar banget sih kamu nungguin aku, makasih ya udah mau bertahan sejauh ini.'
      },
      {
        title: 'Being My Safe Place',
        desc: 'Kalo lagi capek banget sama urusan di sini, inget kamu aja tuh rasanya langsung tenang.'
      },
      {
        title: 'Your Independence',
        desc: 'Salut banget ngeliat kamu bisa mandiri dan jaga diri baik-baik pas kita lagi jauh.'
      },
      {
        title: 'Our Future Together',
        desc: 'Aku yakin banget ke depannya bakal ada hal-hal seru dan indah yang nungguin kita berdua.'
      }
    ],
    photos,
    closingLine: 'I will be back for you.',
    sender: 'Arya',
    secretPhoto,
    secretCaption: 'Tunggu aku kembali ya, Bee. ❤️',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga panjang umur dan dilancarkan semua urusannya. Take care of yourself ya di sana, dan tunggu aku pulang. I miss you and I love you. ❤️',
    celebrateBtnText: 'see you soon ✨',
    musicUrl: 'FILL_MANUALLY: Shape of my heart - Backstreet Boys'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Rizha',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Rizha (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "Shape of my heart - Backstreet Boys" in Studio Editor!`);
}

main().catch(console.error);
