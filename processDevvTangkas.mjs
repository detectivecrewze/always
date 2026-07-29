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
  const kvId = 'auto-21ggf07';
  const orderId = 'ORD-MS4F8RGU';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  console.log('Order found. Photos:', order.photos?.length || 0);
  const orderPhotos = order.photos || [];

  let words = [];
  if (orderPhotos.length > 0) {
      const sentence = "Happy 23rd Birthday to my favorite person in the world 🤍";
      const sentenceWords = sentence.split(" ");
      if (sentenceWords.length === orderPhotos.length) {
          words = sentenceWords;
      } else if (sentenceWords.length > orderPhotos.length) {
          words = sentenceWords.slice(0, orderPhotos.length);
      } else {
          words = [...sentenceWords];
          while (words.length < orderPhotos.length) {
              words.push("✨");
          }
      }
  }

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: Shape of My Heart - Backstreet Boys",
    recipient: "Tangkas Permana",
    sender: "Devv",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero
    heroPreTitle: "a special birthday wish",
    heroLine1: "To My Precious,",
    heroLine2: "Tangkas Permana",
    heroSubtitle: "A very special day for the one who makes my world brighter.",
    
    // Time Section (Ultah)
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "making the world a better place since",
    timeStartDate: "2003-07-30",
    
    // Intro Section
    introPreTitle: "a letter from the heart",
    introHeadline1: "Untuk",
    introHeadline2: "Kesayanganku,",
    introHeadline3: "Tangkas",
    introText: [
      "A Special Day. Wishing You the Happiest of Birthdays. ❤️ Happy Birthday, sayanggg.",
      "There are countless beautiful things in this world, but meeting you will always be one of my favorite miracles.",
      "You came into my life so quietly, yet somehow, you became the place where my heart feels most at home. You have given me reasons to smile on my hardest days, hope when I needed it most, and a kind of love that words could never fully express.",
      "On your birthday, my wish is not only for today to be beautiful, but for every tomorrow to be kinder to you. I hope life always gives you reasons to believe, to dream, and to keep moving forward. I hope your heart never grows tired of chasing the things that truly make you happy.",
      "If life ever feels heavy, I hope you remember that you never have to carry everything alone. I hope you always find comfort in knowing that there is someone who will continue to choose you, believe in you, and love you through every season of life.",
      "Thank you for being exactly who you are. Thank you for every smile, every laugh, every conversation, and every moment that has made my world brighter simply because you are in it.",
      "I don't know what tomorrow will bring, but one thing I know for sure is this: if I get to keep creating memories with you, then I already have more than I could ever ask for.",
      "So today, I celebrate you—not only because it's your birthday, but because the world became a little brighter on the day you were born.",
      "Happy Birthday, my love. ❤️",
      "May your heart always find peace, may your dreams always find their way, and may our story continue to grow with love, patience, and countless beautiful moments.",
      "May this year be your brightest yet, and may we create even more beautiful memories together. 🎂✨",
      "I love you more than yesterday, less than tomorrow, and forever beyond words. Happy Birthday, my forever. ❤️"
    ],
    introSignOff: "With all my love, Devv",
    
    // Gallery
    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    photos: photos,
    
    // Reasons (qualities - Indoglish/Santai)
    reasonsTitle1: "6 Things I",
    reasonsTitle2: "Adore About You",
    reasons: [
      {
        icon: "🤍",
        title: "Your Comforting Presence",
        desc: "Kamu selalu jadi tempat paling nyaman buat aku pulang."
      },
      {
        icon: "🌟",
        title: "Your Brighter Smile",
        desc: "Senyum kamu selalu bisa bikin the hardest days feel so much better."
      },
      {
        icon: "🤝",
        title: "Your Support",
        desc: "Makasih udah selalu percaya sama aku through every season of life."
      },
      {
        icon: "🦋",
        title: "Your Authentic Self",
        desc: "Thank you for being exactly who you are, I wouldn't change a thing."
      },
      {
        icon: "🧸",
        title: "Your Endless Patience",
        desc: "Caramu mengerti aku is a kind of love that words could never fully express."
      },
      {
        icon: "✨",
        title: "Our Beautiful Connection",
        desc: "Setiap ngobrol sama kamu selalu bikin duniaku terasa jauh lebih terang."
      }
    ],
    
    // Closing
    secretPhoto: order.secretPhoto || "",
    secretCaption: "I'll always choose you ❤️",
    closingPreTitle: "to many more years",
    closingTitle1: "Happy",
    closingTitle2: "23rd Birthday ✨",
    closingParagraph: "Happy Birthday once again, my favorite miracle. Semoga di usia yang ke-23 ini, semua hal baik selalu menyertai langkahmu. Cheers to more beautiful memories together!",
    celebrateBtnText: "celebrate ✨",
    
    // Meta
    pinEnabled: false,
    pinCode: "",
    pinHint: ""
  };

  console.log('Generated gift data:', JSON.stringify(giftData, null, 2));

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
