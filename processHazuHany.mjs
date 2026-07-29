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
  const kvId = 'gift-1783604541955';
  const orderId = 'ORD-MS28GXUE';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (15) - Bahasa Inggris
  const words = [
    "Happy",
    "Birthday",
    "To",
    "The",
    "One",
    "Who",
    "Lightens",
    "Up",
    "My",
    "Sparks",
    "For",
    "Love",
    "Every",
    "Single",
    "Day"
  ];

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: Staying - Lizzy McAlpine",
    recipient: "Hany",
    sender: "Hazu",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero (DILARANG ADA EMOJI SAMA SEKALI)
    heroPreTitle: "a special birthday wish",
    heroLine1: "To My Precious,",
    heroLine2: "Hany",
    heroSubtitle: "A very special birthday wish for the love of my life who lightened up my sparks for love.",
    
    // Time Section (Ultah)
    timeEnabled: true,
    timeTitle: "Chapter of You",
    timeSubtitle: "making the world a brighter place since",
    timeStartDate: "2008-08-02",
    
    // Intro Section (Full English)
    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest",
    introHeadline3: "Hany",
    introText: [
      "My dearest Hany,",
      "Happy birthday to the love of my life. It's been 8 months since we get into this beautiful relationship, crazy right? Time sure fly fast. We met each other, shared a few laughs and stories and now here we are.",
      "Every time you laugh, it's like the world is brighter. The sound of your laugh fills my heart with joy and your smile lights my world. I love the way that you really took care of me when i was jealous or hurt, it's a childish behaviour and embarrassment from me and I'm truly sorry about that.",
      "I knew i loved you when when i caught myself saving stories just so i could tell you them later. Whenever I'm bored or when you were gone, i love to reread our conversation in a way that i really value our time together.",
      "I still remember our first time we met each other, we text through telegram and then continue to discord, calls, studying together and even play some games together. I never imagined that would lead to the amazing life we share now.",
      "One day, i hope we can play guitar together, eat that dubaicuwikuki together and spend our time alone together by the waterfall. The way you showed up unexpectedly in my life has turned my life in a way that I felt seen and valued for the first time.",
      "I've never received such love aside from my family, you've changed me alot like for instance, after my last situationship i said to myself \"yeah fuck this, i don't give a fuck anymore. whatever happens, happen. it is what it is\" like that and then after you came without knocking i felt the sense of my old self begging to switch place with the current self. Loverboy.",
      "Although i lost to spark to live but you lighten up my sparks for love in the most unexpected way. You know what? Sometimes, I still can't believe how lucky I am that you chose me, and I promise I will spend every day trying to be the partner you deserve.",
      "When you weren't looking, I see a girl that tries her hardest every day fighting the unsaid problems to people so that she can spend more time with her friends, family and her partner. I love the way you care for the people around you.",
      "Your kindness, the way you still showed up for people even when you're battling with your problems, and patience inspire me every day, and it reminds me of how lucky I am to walk through life with you by my side.",
      "No matter what changes, i hope you never question how deeply you're loved. Even on the version of you that you struggle to love, I'll still choose you. I look forward to growing old with you, sharing all the moments, big and small that make life so beautiful."
    ],
    introSignOff: "With all my heart, Hazu",
    
    // Gallery (Full English)
    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    photos: photos,
    
    // Reasons (Full English & moments theme)
    reasonsTitle1: "6 Unforgettable",
    reasonsTitle2: "Moments We Shared",
    reasons: [
      {
        icon: "💬",
        title: "Our First Conversations",
        desc: "From Telegram to Discord calls, studying and playing games together."
      },
      {
        icon: "📖",
        title: "Saving Stories For You",
        desc: "I knew I loved you when I saved stories just to share them with you."
      },
      {
        icon: "🎸",
        title: "Dreams For Waterfall",
        desc: "Hoping to play guitar, eat cookies, and relax by the waterfall together."
      },
      {
        icon: "🕯️",
        title: "Reigniting My Sparks",
        desc: "You came unexpectedly and brought back my loverboy self when I lost my spark."
      },
      {
        icon: "🥺",
        title: "Your Patient Care",
        desc: "Thank you for taking care of me with love even when I felt childish."
      },
      {
        icon: "🤍",
        title: "Choosing Me Every Day",
        desc: "I promise to spend every single day trying to be the partner you deserve."
      }
    ],
    
    // Closing (Momen Ultah -> WAJIB EMOJI 🎂)
    secretPhoto: order.secretPhoto || "",
    secretCaption: "I'll choose you forever 🎂",
    closingPreTitle: "to many more years",
    closingTitle1: "Happy",
    closingTitle2: "Birthday, Hany 🎂",
    closingParagraph: "May your heart always find peace, may your dreams come true, and may our story continue to grow with endless love and laughter. Happy Birthday, my love!",
    celebrateBtnText: "celebrate 🎂",
    
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
