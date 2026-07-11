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

async function run() {
  const orderId = 'ORD-MRG040YE';
  const slug = 'auto-290101201';
  const order = await cfGet(`order:${orderId}`);
  
  const words = [
    "You", "Are", "My", "Favorite", "Place", "To", "Go", 
    "To", "When", "My", "Mind", "Searches", "For", "Peace"
  ];
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const photos = [];
  for (let i = 0; i < 14; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i]
    });
  }

  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    slug: slug,
    recipient: "nemollll",
    sender: "GOVANA",
    theme: "blush-pink",
    musicUrl: "", 

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Nemollll",
    gateSubtitle: "From the one who loves you",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Nemollll",
    heroSubtitle: "A little something to celebrate the beautiful journey we've built together. 🌸",

    timeEnabled: true,
    timeTitle: "Our Journey",
    timeSubtitle: "Setiap detik bersamamu adalah anugerah terindah bagiku.",
    timeStartDate: "2025-07-13",

    introIcons: ["🌸", "✨", "🤍"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "1st Anniversary",
    introText: [
      "Teruntuk nemollll, makasiii ya selama 1 tahun ini udah nemenin aku. Makasih udah selalu sabar, pengertian, dan baik hati banget sama aku, padahal aku sering banget bikin kamu betmut.",
      "Aku kadang masih nggak nyangka kita udah jalan sejauh ini, ngelewatin 1 tahun sama-sama. Aku seneng banget ada kamu di sisi aku. Rasanya kayak nemuin sandaran hidup, tempat aku bisa cerita apa aja, bisa manja-manjaan, dan ngerasa aman.",
      "Maaf yaaa kalo selama ini aku masih kurang pengertian, dan maaf kalau aku belum bisa jadi sosok yang sempurna seperti yang mungkin kamu mau. Tapi satu hal yang pasti, aku bersyukur banget kamu ada di sini.",
      "Tolong selalu sama aku terus yaaaa. Makasiiii buat segala waktu, cinta, dan kesabaran kamu selama ini. I love you! mwahhhhh."
    ],
    introSignOff: "With all my love,\nGOVANA",

    reasonsTitle1: "The Reasons",
    reasonsTitle2: "I Adore You",
    reasons: [
      { title: "Your Patience", desc: "Kamu selalu sabar ngadepin tingkahku, bahkan saat aku lagi nyebelin." },
      { title: "Your Kindness", desc: "Hati kamu yang baik selalu bikin aku merasa beruntung memilikimu." },
      { title: "My Safe Place", desc: "Kamu adalah sandaran hidupku, tempat aku bebas bercerita dan bermanja." },
      { title: "Your Understanding", desc: "Kamu selalu berusaha ngertiin aku dalam segala keadaan." },
      { title: "Your Presence", desc: "Kehadiranmu di sisiku selalu bawa rasa tenang dan bahagia." },
      { title: "Our 1 Year", desc: "Satu tahun ini jadi bukti kalau kita bisa lewatin semuanya bareng-bareng." }
    ],

    galleryTitle1: "Beautiful Moments",
    galleryTitle2: "We've Shared",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "a special memory just for you 🤍",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy",
    closingTitle2: "Anniversary!",
    closingParagraph: "Semoga tahun-tahun berikutnya kita bisa terus sama-sama, saling melengkapi dan menyayangi. Selalu sama aku terus yaaaa!",
    celebrateBtnText: "I Love You Too",
    closingLine: "Forever yours,\nGOVANA"
  };

  await cfSet(`draft:${slug}`, giftData);
  await cfSet(`gift:${slug}`, giftData);
  console.log('Successfully created gift and draft for Govana to nemollll');
}
run();
