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

async function processOrder() {
  const kvId = 'gift-1785137477036';
  const orderId = 'ORD-MS304MN2';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (15)
  // Tidak boleh dilooping atau di-modulo
  const words = [
    "Happy",
    "Girlfriend",
    "Day",
    "Buat",
    "Princess",
    "Kecil",
    "Kesayangan",
    "Aku",
    "Yang",
    "Paling",
    "Cantik",
    "Imut",
    "Lucu",
    "Dan",
    "Gemas"
  ];

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: You Da One - Rihanna",
    recipient: "Princess Kela",
    sender: "Resky",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (DILARANG ADA EMOJI SAMA SEKALI)
    heroPreTitle: "happy girlfriend's day",
    heroLine1: "To My Precious,",
    heroLine2: "Princess Kela",
    heroSubtitle: "Perayaan kecil untuk wanita paling cantik, imut, dan gemes yang jadi milikku sepenuhnya.",
    
    // Time Section (Lainnya - Girlfriend Day)
    timeEnabled: true,
    timeTitle: "Happy Girlfriend's Day",
    timeSubtitle: "mensyukuri hadirmu dalam hidupku sejak",
    timeStartDate: "2026-08-01", 
    
    // Intro Section
    introPreTitle: "a little message",
    introHeadline1: "Buat",
    introHeadline2: "Cintaakuuu,",
    introHeadline3: "Kela",
    introText: [
      "Maacii yaaa sayanggkuu cintaakuuu udaa selaluuu adaa buatt akuu walaupunn kadanggg-kadang akuu seringgg bikinn emosii sedihh kesell tapii kamuu masii milihh akuu di banding cowoo-cowoo yang banyakk deketinn kamuuu.",
      "Akuuu bersyukur dehhh punyaa kamuuu yangg selaluuu ceriaa semangattt manjaa-manjaa ceritaaa, ituu yangg bikinn akuu selaluuu bersyukurr punyaaa kamuuu yangg cantikkk imutt lucuuu gemezzz.",
      "Sekarangg harii inii akuu mauu kasii inii buatt kamuu karnaa harii inii momenn spesiall buatt kamuuu. Maaff yaa cumaa inii doanggg yangg bisaa akuu kasii.",
      "Selaluuu samaaa akuu terusss yaaa walaupun kitaa enggaaa tauu problemm apaa di depan sanaa tapii kitaaa lewatinn samaa samaa yaa sayanggg.",
      "Happy girlfriendd dayy sayangggkuu cintaaakuuu lovee youu princessss kecill yanggg akuuu sayanggg🤍🤍💕💕"
    ],
    introSignOff: "Peluk cium dari, Resky",
    
    // Gallery
    galleryTitle1: "Jejak Langkah",
    galleryTitle2: "Cerita Kita",
    photos: photos,
    
    // Reasons (Tone Bucin ABG)
    reasonsTitle1: "6 Alasan Kenapa",
    reasonsTitle2: "Aku Makin Bucin Sama Kamu",
    reasons: [
      {
        icon: "🥺",
        title: "Selalu Sabar",
        desc: "Makasii yaa sayanggkuu kamu masii milihh akuu walaupun aku sering bikinn emosi."
      },
      {
        icon: "🥰",
        title: "Paling Setia",
        desc: "Kamu tetep stay sama aku di banding cowoo-cowoo lain yang banyakk deketin kamu."
      },
      {
        icon: "🌟",
        title: "Selalu Ceria",
        desc: "Energy kamu yang selalu ceria dan semangat itu bikinn aku makin cintaa."
      },
      {
        icon: "🧸",
        title: "Manja-Manja Gemes",
        desc: "Tingkah manja-manja kamu pas lagi cerita ituuu lohhh yang bikin kangen terus."
      },
      {
        icon: "🎀",
        title: "Cantik & Imut",
        desc: "Punyaa pacarrr secantik, seimut, dan selucu kamuu bener-bener rezeki nomplok."
      },
      {
        icon: "🤍",
        title: "Princess Kecilku",
        desc: "Ngga ada alesan lain selain karna kamu emang princesss kecill yanggg akuuu sayanggg."
      }
    ],
    
    // Closing (Tidak boleh emoji kue, pakai bintang)
    secretPhoto: order.secretPhoto || "",
    secretCaption: "Love youu princessss kecill 🤍",
    closingPreTitle: "always & forever",
    closingTitle1: "Love You",
    closingTitle2: "Sayanggg ✨",
    closingParagraph: "Makasii yaa sekali lagi udah jadi pacar yang paling hebat buat aku. Jangan bosen-bosen ngadepin aku yaa, kita buktiin bareng-bareng kalau kita bisa lewatin semua problem di depan sana!",
    celebrateBtnText: "bucin teruss ✨",
    
    // Meta
    pinEnabled: false,
    pinCode: "",
    pinHint: ""
  };

  console.log(`Saving to gift:${kvId}`);
  await cfSet(`gift:${kvId}`, giftData);
  
  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: giftData.recipient,
    theme: giftData.theme,
    createdAt: new Date().toISOString()
  };
  await cfSet(`draft:${kvId}`, draftData);

  console.log('Done processing order!');
}

processOrder().catch(console.error);
