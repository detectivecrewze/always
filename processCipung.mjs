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
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function cfSet(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  return res.ok;
}

const orderId = 'ORD-MRHW0YQX';
const kvId = 'auto-08zz2j3';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Create an 8-word sentence because there are only 8 photos: "Happy 24th birthday to the most amazing man"
  const words = ["Happy", "24th", "Birthday", "To", "The", "Most", "Amazing", "Man"];
  
  const photos = [];
  // Loop based on actual available photos
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "A Agung",
    theme: "blush-pink",
    music: {
      file: "FILL_MANUALLY: Shape of my heart - backstreet boys",
      title: "Shape of My Heart",
      artist: "Backstreet Boys"
    },
    
    gateSubtitle: "a special gift for you",
    gateTitle: "My Beloved A Agung",
    
    heroPreTitle: "happy birthday",
    heroLine1: "To My Beloved",
    heroLine2: "A Agung",
    heroSubtitle: "24 beautiful years of your journey.",
    
    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "been glowing since",
    timeStartDate: "2002-07-13",
    
    introIcons: ["🎂", "✨", "💌"],
    introPreTitle: "a little note",
    introHeadline1: "Happy",
    introHeadline2: "24th",
    introHeadline3: "Birthday",
    introText: [
      "Dear a agung,",
      "Untuk segala hal yang akan aku ucapkan sekarang, hal terpenting dan yang utama adalah rasa terimakasih.",
      "Terima kasih sudah lahir ke dunia ini dan menjadi pria yang tampan, pintar, dan baik hati.",
      "I'm so, so proud of you. Bukan hanya karena apa yang telah kamu capai, tetapi karna usaha di baliknya.",
      "Stres yang tidak selalu kamu ceritakan ke aku, dan cara kamu berjuang bahkan ketika keadaan terasa tidak adil. Aku benar-benar melihat semuanya selama ini.",
      "Di umurmu yang sekarang ini, jangan pernah menganggap bahwa kamu tertinggal jauh dengan yang lain.",
      "Zira ingin kamu fokus ke prioritas tujuan utama kamu yang lagi kamu lakukan dan kamu usahakan. I know the kind of man you're becoming.",
      "Aku tahu seberapa jauh kamu akan melangkah and one day semua hal yang a agung doakan yakin dan pasti akan tercapai.",
      "Kamu akan menjadi seseorang yang hebat, not because of luck, tetapi karena semua yang kamu rela perjuangkan."
    ],
    introSignOff: "With love,\nCipung (Zira)",
    
    reasonsTitle1: "The Reasons",
    reasonsTitle2: "Why",
    reasons: [
      {
        title: "Rasa Terimakasih",
        desc: "Terima kasih sudah lahir ke dunia ini dan menjadi pria yang sangat luar biasa."
      },
      {
        title: "I'm So Proud",
        desc: "Bukan cuma karena pencapaianmu, tapi karena usaha luar biasa di balik itu semua."
      },
      {
        title: "Aku Melihat Semuanya",
        desc: "Cara kamu berjuang walau keadaan lagi nggak adil, aku lihat semua perjuanganmu sayang."
      },
      {
        title: "Fokus ke Tujuanmu",
        desc: "Jangan pernah ngerasa tertinggal, fokus aja sama apa yang lagi kamu usahakan sekarang."
      },
      {
        title: "The Man You Are",
        desc: "I know the kind of man you're becoming, dan aku tau seberapa jauh kamu akan melangkah."
      },
      {
        title: "Kamu Pasti Hebat",
        desc: "Kamu bakal jadi orang hebat, not because of luck, but because you fought for it."
      }
    ],
    
    photos: photos,
    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    
    closingPreTitle: "always & forever",
    closingTitle1: "Happy Birthday",
    closingTitle2: "A Agung",
    closingParagraph: "Zira yakin suatu saat nanti semua doa dan harapan a agung pasti akan tercapai. Terus semangat berjuang ya sayang, I'll always be here cheering for you.",
    closingLine: "your biggest cheerleader,",
    sender: "Zira (cipung)",
    celebrateBtnText: "celebrate ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "cheers to your 24th! 🥂",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "cipung",
    recipientName: "A Agung",
    deadline: "2026-07-12T22:25",
    theme: "blush-pink",
    moment: "Ultah",
    status: "done",
    createdAt: new Date().toISOString()
  };

  await cfSet(`gift:${kvId}`, giftData);
  console.log(`✅ Successfully saved gift:${kvId}`);

  await cfSet(`draft:${kvId}`, draftData);
  console.log(`✅ Successfully saved draft:${kvId}`);
}

processOrder().catch(console.error);
