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
  const orderId = 'ORD-MRG5STV8';
  const slug = 'auto-20301021';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "You", "Are", "My", "Favorite", "Place", "To", "Go",
    "When", "My", "Mind", "Searches", "For", "Peace"
  ];

  // Fetch actual uploaded photos from the order
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const photos = [];
  for (let i = 0; i < 14; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  // Fetch actual secret photo from the order
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    theme: "blush-pink",
    musicUrl: "https://www.youtube.com/watch?v=lY5V4hSLWY8", // Risk it all - Bruno Mars (Die With A Smile)

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Muhammad Alfa",
    gateSubtitle: "From the one who deeply loves you",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Alfa",
    heroSubtitle: "Sedikit hadiah untuk merayakan momen indah ini, karena kamu pantas untuk dirayakan hari ini dan setiap harinya.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Every year of your life has shaped the incredible person you are today.",
    timeStartDate: "2008-07-18",

    introIcons: ["🤍", "✨", "💗"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "18th Birthday",
    introText: [
      "Happy birthday sayang. Semoga di chapter baru ini, Tuhan ngasih banyak surprise manis dan bahagia buat kamu.",
      "Thank you for coming into my life. Ketemu sama orang kayak kamu is literally one of my greatest blessings, dan aku selalu bahagia ada di dekat kamu.",
      "Makasih juga udah selalu sabar ngertiin aku dan sayang sama aku. I give you this as a small token of my love, because I love you as deeply as you love me.",
      "Semoga panjang umur, sehat selalu, dan dilancarkan rezekinya. Semoga hubungan kita langgeng terus selamanya. I'll always be right here, standing by your side."
    ],
    introSignOff: "With all my love,\nLuluu",

    reasonsTitle1: "The Reason",
    reasonsTitle2: "I Love You",
    reasons: [
      { title: "Your Presence", desc: "Datengnya kamu di hidup aku adalah salah satu hal paling indah yang pernah terjadi." },
      { title: "Your Understanding", desc: "Makasih udah selalu sabar dan ngertiin aku dalam segala situasi." },
      { title: "Your Love", desc: "Caramu mencintaiku bikin aku sadar kalau I'm truly blessed to have you." },
      { title: "Our Connection", desc: "Berharap banget semoga hubungan kita selalu dijaga dan langgeng buat selamanya." },
      { title: "Your Heart", desc: "Hati kamu yang tulus selalu jadi alasan kuat kenapa I fall deeply for you." },
      { title: "Everything You Are", desc: "Aku sangat mencintaimu, because you are you. Dan aku akan selalu ada di sini buat kamu." }
    ],

    galleryTitle1: "Beautiful Moments",
    galleryTitle2: "We've Shared",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "sebuah kenangan manis hanya untukmu 🤍",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Alfa",
    closingParagraph: "Selamat ulang tahun yang ke-18! Aku mungkin jarang bilang, tapi kamu sangat berarti buatku. Apapun yang terjadi, aku bakal selalu ada buat kamu.",
    celebrateBtnText: "celebrate ✨",
    sender: "Luluu",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-18.2008)",
    recipientName: "Muhammad alfa",
    specialDate: "2008-07-18",
    relationship: "Pasangan",
    theme: "blush-pink",
    metaphor: "Keepsakes (Kenangan)",
    musicOption: "Playlist: Risk it all - Bruno Mars",
    writingTone: "Indoglish, Puitis",
    message: "happyy birthday sayang, semoga di tahun ini di kasih kejutan sama tuhan yang bahagia🤍. makasih juga ya udh dateng di kehidupan aku, aku selalu bahagia ketemu seseorang seperti kamu, di tahun ini semoga hubungan kita langgeng terus sampai selamanya, makasih juga buat semuanya, udh ngertiin aku udh sayang sama aku, aku ngasih ini ke kamu karna aku sangat mencintaimu, seperti kamu mencintaiku🤍💗.happyy birthday ya sayang di panjang kan umurnya sehat selalu dilancarkan rezekinya, aku selalu bersama kamu disinii💗💗🤍",
    deadline: "Kamis, 16 Juli 2026 pukul 08.16",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for luluu to Muhammad alfa`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
