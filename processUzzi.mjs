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

const orderId = 'ORD-MRHS9W14';
const kvId = 'auto-r828sh0';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery words: 14 words forming a sentence
  // "Happy 20th birthday to the strongest, most cheerful, and slightly annoying person I know." -> 14 words
  // "Happy" "20th" "Birthday" "To" "The" "Strongest" "Most" "Cheerful" "And" "Slightly" "Annoying" "Person" "I" "Know"
  const words = ["Happy", "20th", "Birthday", "To", "The", "Strongest", "Most", "Cheerful", "And", "Slightly", "Annoying", "Person", "I", "Know"];
  
  const photos = [];
  for (let i = 0; i < 14; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Uzzi",
    theme: "midnight-blue",
    music: {
      file: "FILL_MANUALLY: Semua Aku Dirayakan - Nadin Amizah",
      title: "Semua Aku Dirayakan",
      artist: "Nadin Amizah"
    },
    
    gateSubtitle: "a special gift for you",
    gateTitle: "Uzzi's Day",
    
    heroPreTitle: "happy birthday",
    heroLine1: "To The Strongest",
    heroLine2: "Onett",
    heroSubtitle: "20 years of you making the world a brighter place.",
    
    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "been glowing since",
    timeStartDate: "2006-07-13",
    
    introIcons: ["🎂", "✨", "💌"],
    introPreTitle: "a little note",
    introHeadline1: "Happy",
    introHeadline2: "20th",
    introHeadline3: "Birthday",
    introText: [
      "Helooww onett today it's your birthday right???",
      "Semoga dimana pun kamu berada selalu di kelilingi kebahagiaan dan orang yang sayang sama kamu. Semoga tahun ini lebih baik dari tahun kemarin, semoga semesta selalu berpihak ke kamu.",
      "Makasih yah ji udah mau bertahan selama 20 tahun dan itu gabentarr lohh, kmu terlahir di dunia dari kecil bngttt sekrang udah segede iniii.",
      "Banyakk hal yng kmu udah laluin tapi masih banyak bngt hal yang belum kmu laluin. Semakin kamu besarr semakin banyak jga rintangannyaa but it's okee.",
      "Appun susahnya apapun sedih nya appun senangnya kmu nikmatin dan janlup buat bersyukur.",
      "Selamat ulang tahun ya sekali lagi makasihh udah jadi manusia kuat selama ini dan tetap menjadi manusia kuat ceria nyebelin juga yang aku kenal 💐🥰"
    ],
    introSignOff: "With love,\nItii",
    
    reasonsTitle1: "The Beautiful",
    reasonsTitle2: "Flowers",
    reasons: [
      {
        title: "20 Years Strong",
        desc: "Makasih udah bertahan sejauh ini, it's not a short journey but you did great!"
      },
      {
        title: "Growing Up",
        desc: "Dari kecil banget sampe segede ini, so proud to see how far you've come."
      },
      {
        title: "Embrace It All",
        desc: "Susah, sedih, seneng, just enjoy the ride and don't forget to be grateful."
      },
      {
        title: "The Strongest",
        desc: "Thank you for being such a strong human being all these years."
      },
      {
        title: "The Annoying One",
        desc: "Tetap jadi manusia ceria dan nyebelin yang aku kenal ya!"
      },
      {
        title: "Always Supporting",
        desc: "I will always support you in everything you do. Selamat berkelana!"
      }
    ],
    
    photos: photos,
    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    
    closingPreTitle: "always & forever",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Onett",
    closingParagraph: "Semoga hal baik selalu beriringan denganmu, semesta senantiasa berpihak padamu, dan mimpimu dipermudah. Terus tumbuh, melangkah, & bahagia selalu ya. Selamat berkelana, I will always support u.",
    closingLine: "your biggest supporter,",
    sender: "Itii",
    celebrateBtnText: "celebrate ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "cheers to your 20th! 🥂",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "Itii",
    recipientName: "Uzzi",
    deadline: "2026-07-12T22:10",
    theme: "midnight-blue",
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
