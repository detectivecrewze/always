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
  // Fix Hesti's order
  const hestiSlug = 'for-93010212';
  const hestiDraft = await cfGet(`draft:${hestiSlug}`);
  if (hestiDraft) {
    hestiDraft.timeSubtitle = "Celebrating every precious memory since the day you were born.";
    delete hestiDraft.timeText;
    await cfSet(`draft:${hestiSlug}`, hestiDraft);
    await cfSet(`gift:${hestiSlug}`, hestiDraft);
    console.log('Fixed Hesti timeSubtitle');
  }

  // Create Ervan's order
  const orderId = 'ORD-MRDJ4W75';
  const slug = 'auto-2010310';
  const order = await cfGet(`order:${orderId}`);
  
  const words = [
    "I", "Am", "Sorry", "For", "Everything", "But", "I", 
    "Still", "Love", "You", "More", "Than", "You", "Know"
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
    recipient: "To the prettiest girl, amirah",
    sender: "ervan",
    theme: "blush-pink",
    musicUrl: "", 

    gatePreTitle: "A SINCERE CONFESSION FOR",
    gateTitle: "Amirah",
    gateSubtitle: "To the prettiest girl",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Amirah",
    heroSubtitle: "No filter, just honestly how I feel about you. 🌸",

    timeEnabled: true,
    timeTitle: "Our Journey",
    timeSubtitle: "Through every season, my feelings for you have only grown stronger.",
    timeStartDate: "2025-11-02",

    introIcons: ["🌸", "☀️", "🍁"],
    introPreTitle: "MY DEAREST IQIS",
    introHeadline1: "I'm Sorry",
    introHeadline2: "For Hurting You",
    introHeadline3: "Genuinely, from the bottom of my heart",
    introText: [
      "Iqis, I know I've hurt you, and honestly that's the last thing I ever wanted to do. Maaf kalau selama ini ada kata-kata, sikap, atau tindakan aku yang bikin hati kamu capek. Kadang aku terlalu sibuk sama isi kepala aku sendiri sampai lupa kalau ada hati kamu yang harus aku jaga.",
      "The truth is, I love you so much. Makin sakit rasanya ketika aku sadar orang yang paling aku sayang justru terluka karena aku. Aku tau cinta aja ga cukup tanpa cara yang benar untuk memperlakukanmu, dan aku masih harus banyak belajar untuk jadi lebih baik buat kamu.",
      "Aku ga mau minta kamu langsung lupa sama kesalahanku, I know healing takes time. Tapi aku harap kamu percaya penyesalan ini beneran dari hati aku. Tiap kali aku lihat kamu sedih, rasanya pengen peluk kamu and bilang kalau kamu ga pantas dapet rasa sakit itu.",
      "So, from the deepest part of my heart, I'm sorry. Maaf pernah bikin kamu nangis dan ngeraguin diri sendiri. But one thing you should know, my feelings for you have never changed. Aku masih sayang kamu, masih peduli sama kamu, dan berharap bisa bikin lebih banyak kenangan bahagia bareng kamu.",
      "Aku tahu rekam jejak aku kurang baik, dan aku gak bakal nyari alasan. Aku cuma mau buka kartu aja, dan aku udah buktiin lewat tindakan kalau aku udah berubah. Dan kamu selalu jadi tujuan aku."
    ],
    introSignOff: "Yours, still. Always,",

    reasonsTitle1: "The Reasons",
    reasonsTitle2: "I Love You",
    reasons: [
      { title: "Still Yours", desc: "Walau banyak yang harus aku perbaiki, perasaanku ke kamu nggak pernah berubah." },
      { title: "Deepest Regret", desc: "Menyakitimu adalah penyesalan terbesarku, aku janji akan berusaha jauh lebih baik." },
      { title: "My Only Goal", desc: "Kamu selalu jadi tujuanku, alasan aku buat terus belajar dan memperbaiki diri." },
      { title: "Healing Time", desc: "I know healing takes time, aku akan sabar nunggu sampai kamu bisa percaya lagi." },
      { title: "More Happiness", desc: "Aku berharap bisa nebus semuanya dengan ngasih kamu lebih banyak memori bahagia." },
      { title: "Always You", desc: "Aku udah buktiin lewat tindakan kalau aku berubah, and it's all for you." }
    ],

    galleryTitle1: "Through The Seasons",
    galleryTitle2: "Our Memories",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,

    closingPreTitle: "ONE LAST QUESTION",
    closingTitle1: "Can You Be",
    closingTitle2: "My Girlfriend?",
    closingParagraph: "Aku gak nuntut kamu buat jawab 'iya' sekarang juga, karena aku tahu butuh waktu buat percaya lagi. Tapi aku berharap kamu tahu kalau perasaanku ini tulus. Take your time, I'll be right here waiting.",
    celebrateBtnText: "Yes, I will",
    closingLine: "Yours, still. Always,"
  };

  await cfSet(`draft:${slug}`, giftData);
  await cfSet(`gift:${slug}`, giftData);
  console.log('Successfully created gift and draft for Ervan to Amirah');
}
run();
