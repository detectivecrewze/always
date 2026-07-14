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
  const orderId = 'ORD-MRGL5P62';
  const slug = 'auto-201010103';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "You", "Are", "My", "Favorite", "Art", "That", "I",
    "Will", "Always", "Admire", "For", "The", "Rest", "Of"
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
    theme: "midnight-blue",
    musicUrl: "https://www.youtube.com/watch?v=gK4cOQkXfE4", // Favorite Art - jasmine Nadya

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "My Samudra",
    gateSubtitle: "From the one who truly loves you",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Sweetest Love",
    heroSubtitle: "A little something to celebrate this beautiful milestone, because you deserve to be celebrated today and every single day.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Every year of your life has shaped the incredible person you are today.",
    timeStartDate: "2007-07-18", // Fixed year to make it 19 years old (2026-19)

    introIcons: ["✨", "🤍", "🥀"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "19th Birthday",
    introText: [
      "Happy 19th birthday to you. Terima kasih karena kamu selalu ada buat aku, through every up and down. I love you more than words can say.",
      "Terima kasih sudah membuat aku merasakan apa itu cinta, and all the beautiful things that I've never felt before.",
      "Bersamamu, aku belajar bahwa dicintai dengan tulus adalah perasaan yang paling berharga. You truly are the best thing that ever happened to me.",
      "Semoga kita bisa terus bersama and grow side by side in the future. I love you so much!"
    ],
    introSignOff: "With all my heart,\nPrinces itaa",

    reasonsTitle1: "The Reasons",
    reasonsTitle2: "I Adore You",
    reasons: [
      { title: "Your Constant Presence", desc: "Terima kasih karena selalu ada buat aku. Kehadiranmu is the greatest comfort in my life." },
      { title: "The Meaning of Love", desc: "Terima kasih sudah membuatku benar-benar merasakan apa itu cinta and what it feels like to be truly cared for." },
      { title: "Uncharted Happiness", desc: "Kamu membawaku pada kebahagiaan and beautiful things yang belum pernah aku rasakan di hubungan mana pun." },
      { title: "Sincere Affection", desc: "Bersamamu, aku belajar bahwa dicintai dengan tulus is the most precious feeling in the world." },
      { title: "Our Future Together", desc: "Semoga kita bisa terus berjalan berdampingan, melewati banyak hal dan meraih mimpi bersama di masa depan." },
      { title: "My Endless Love", desc: "I love you. Aku sayang banget sama kamu, lebih dari yang bisa aku ungkapkan dengan kata-kata." }
    ],

    galleryTitle1: "Beautiful Moments",
    galleryTitle2: "We've Shared",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "a special memory just for you 🤍",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy Birthday",
    closingTitle2: "My Love",
    closingParagraph: "Happy 19th birthday! I might not say it often, but you mean the world to me. No matter what happens, I'll always be by your side.",
    celebrateBtnText: "celebrate ✨",
    sender: "Princes itaa",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-19)",
    recipientName: "Syngku cintku samudraku",
    specialDate: "2026-07-18",
    relationship: "Pasangan",
    theme: "midnight-blue",
    metaphor: "Flowers (Bunga)",
    musicOption: "Request: Favorite Art - jasmine Nadya",
    writingTone: "Puitis, Indoglish",
    message: "Terima kasih karena selalu ada buat aku. I love you. Terima kasih sudah membuat aku merasakan apa itu cinta, merasakan perhatian, kebahagiaan, dan semua hal indah yang belum pernah aku rasakan dalam hubungan sebelumnya. Bersamamu, aku belajar bahwa dicintai dengan tulus adalah perasaan yang sangat berharga. Semoga kita bisa terus bersama dan melewati banyak hal di masa depan. Aku sayang kamu",
    deadline: "Rabu, 15 Juli 2026 pukul 23.33",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Princes itaa`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
