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

const orderId = 'ORD-MRI4JQWS';
const kvId = 'auto-zi8k645';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery words: 8 words to match 8 photos
  const words = ["Happy", "26th", "Birthday", "To", "My", "Dearest", "Billy", "Sayang"];
  
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
    recipient: "Billy Sayang",
    theme: "vintage-burgundy",
    music: {
      file: "FILL_MANUALLY: Ceritanya Jatuh Cinta - Aku Jeje",
      title: "Ceritanya Jatuh Cinta",
      artist: "Aku Jeje"
    },
    
    gateSubtitle: "a special gift for you",
    gateTitle: "Untuk Billy",
    
    heroPreTitle: "happy birthday",
    heroLine1: "To My Dearest",
    heroLine2: "Billy",
    heroSubtitle: "26 beautiful years of your journey.",
    
    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "been glowing since",
    timeStartDate: "2000-07-27",
    
    introIcons: ["🎂", "✨", "🤍"],
    introPreTitle: "a little note",
    introHeadline1: "Happy",
    introHeadline2: "26th",
    introHeadline3: "Birthday",
    introText: [
      "Happy 26th birthday, Billy sayang! 🎉",
      "Bismillah, Olak lihat sekarang Billy udah jauh lebih bahagia karena Billy merasa cukup dan sanggup.",
      "Tapi Olak selalu berharap, bahagiamu yang sekarang ini bener-bener berdasarkan apa yang kamu mau, dari karir yang kamu suka, bukan dari kebahagiaan yang terpaksa.",
      "Senyum dan bahagia terus ya, sayangku. I am always so proud of you, atas semua yang udah kamu capai dan proses berat yang berhasil kamu lewati.",
      "Olak tahu jadi anak cowok satu-satunya di keluarga itu nggak mudah. The pressure is heavy, but you always show up whenever they need you.",
      "Temenin Olak terus ya sayang apapun kondisinya, and I promise I'll always be there for you too.",
      "Even in our darkest days, saat kita lagi sedih atau tiba-tiba mau menarik diri, let's stay together.",
      "Olak juga terus berusaha untuk bertumbuh, sayang. Billy nggak harus selalu ngerti semuanya, cukup tetap dan selalu ada. Karena buat Olak, kehadiran Billy aja udah sangat berarti."
    ],
    introSignOff: "With love,\nOlak (Lora)",
    
    reasonsTitle1: "The Beautiful",
    reasonsTitle2: "Flowers",
    reasons: [
      {
        title: "So Proud of You",
        desc: "Olak selalu bangga sama semua usahamu. You did so well and you deserve the world."
      },
      {
        title: "The Best Son",
        desc: "Jadi cowok satu-satunya emang berat, tapi kamu selalu usahain yang terbaik buat keluarga."
      },
      {
        title: "Stay with Me",
        desc: "Temenin Olak ya disaat kita lagi seneng, sedih, atau bahkan saat kita lagi susah dimengerti."
      },
      {
        title: "Growing Together",
        desc: "Olak juga akan terus berusaha untuk bertumbuh bareng kamu. We'll figure everything out together."
      },
      {
        title: "Your Presence",
        desc: "Billy nggak harus selalu ngerti semuanya, cukup tetep stay. Your presence means everything."
      },
      {
        title: "Most Loved",
        desc: "Selalu inget ya sayang, Tuhan aja sayang banget sama Billy, apalagi Olak. 🤍"
      }
    ],
    
    photos: photos,
    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    
    closingPreTitle: "always & forever",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Sayangku",
    closingParagraph: "Sekali lagi happy birthday, Billy. Semoga umur 26 ini bawa lebih banyak kebahagiaan yang bener-bener kamu inginkan. I'll always be your biggest cheerleader.",
    closingLine: "your beloved,",
    sender: "Olak",
    celebrateBtnText: "celebrate ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "cheers to your 26th! 🥂",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "lora",
    recipientName: "billy sayang",
    deadline: "2026-07-27T00:00", // using standard default if deadline not set for the exact hour
    theme: "vintage-burgundy",
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
