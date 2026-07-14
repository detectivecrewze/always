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

const CLOUDFLARE_API_TOKEN = env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
const KV_NAMESPACE_ID = env.KV_NAMESPACE_ID;

if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !KV_NAMESPACE_ID) {
  console.error("Missing Cloudflare credentials in .env.local");
  process.exit(1);
}

const KV_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values`;

async function cfGet(key) {
  try {
    const res = await fetch(`${KV_API_URL}/${key}`, {
      headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to GET ${key}: ${res.statusText}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error(`Error reading ${key}:`, err);
    return null;
  }
}

async function cfPut(key, value) {
  try {
    const res = await fetch(`${KV_API_URL}/${key}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value)
    });
    if (!res.ok) {
      throw new Error(`Failed to PUT ${key}: ${res.statusText}`);
    }
    console.log(`✅ Successfully saved ${key}`);
  } catch (err) {
    console.error(`Error writing ${key}:`, err);
  }
}

async function main() {
  const orderId = "ORD-MRGVA237";
  const slug = "gift-1783802911359";
  
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "I",
    "Will",
    "Always",
    "Be",
    "Here",
    "For",
    "You",
    "My",
    "Beautiful",
    "And",
    "Strong",
    "Girl",
    "Verlita",
    "Love"
  ];

  const photos = [];
  for (let i = 0; i < 14; i++) {
    photos.push({
      url: orderPhotos[i] || '', 
      caption: words[i] || ''
    });
  }

  const giftData = {
    slug: slug,
    theme: "vintage-burgundy",
    
    music: {
      file: "FILL_MANUALLY: Semua aku dirayakan - Nadin Amizah", 
      title: "Semua aku dirayakan",
      artist: "Nadin Amizah"
    },

    heroPreTitle: "A SPECIAL GIFT",
    heroLine1: "To My Precious,",
    heroLine2: "Verlita",
    heroSubtitle: "A little celebration for the one who changed everything, completely by accident.",

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Verlita",
    gateSubtitle: "untuk merayakan hari spesialmu",
    recipient: "Verlita",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu yang telah membawamu sejauh ini.",
    timeStartDate: "2006-07-15",

    introIcons: ["🤍", "✨", "🌙"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "Birthday,",
    introHeadline3: "Verlita",
    introText: [
      "Dear Verlita,",
      "You've been through so much in your life. You've weathered storms that tried to stand in your way, yet you kept moving forward. At the same time, you've always been a light to the people you love. That's why I want you to know that I see you as an incredibly strong person, and I'm so proud of you. Thank you for holding on and making it this far.",
      "My love, I truly believe you're a strong and extraordinary girl. But no matter how strong someone is, there will always be days when everything feels too heavy to carry alone. And if that day ever comes, I'll be more than happy to help you carry the weight. I'll be the first one to stand beside you, the one who protects you, supports you, and reminds you that you don't have to face everything by yourself.",
      "Always remember this, my love: you'll always have a place to come home to. I'll always be here for you, becoming a home where you can find comfort, warmth, and peace. No matter how exhausting the world becomes, my arms and my heart will always be open for you."
    ],
    introSignOff: "With all my love,\nDio",

    reasonsTitle1: "The Best",
    reasonsTitle2: "Things",
    reasons: [
      {
        title: "A Strong Soul",
        desc: "You've weathered storms that tried to stand in your way, yet you kept moving forward."
      },
      {
        title: "My Guiding Light",
        desc: "You have always been a beautiful light to the people you love."
      },
      {
        title: "Incredibly Proud",
        desc: "I see you as an incredibly strong person, and I'm so proud of you for making it this far."
      },
      {
        title: "Sharing The Weight",
        desc: "No matter how strong you are, if things get heavy, I'll be more than happy to help you carry the weight."
      },
      {
        title: "Always Beside You",
        desc: "I'll be the first to stand beside you, protect you, and remind you that you're never alone."
      },
      {
        title: "Your Safe Place",
        desc: "I will always be your home—a place where you can find comfort, warmth, and peace."
      }
    ],

    galleryTitle1: "Our",
    galleryTitle2: "Memories",
    photos: photos,

    closingPreTitle: "ON YOUR SPECIAL DAY",
    closingTitle1: "Happy 20th",
    closingTitle2: "Birthday",
    closingParagraph: "No matter how exhausting the world becomes, my arms and my heart will always be open for you. Happy Birthday, my love 🤍",
    sender: "Dio",
    celebrateBtnText: "celebrate ✨",
    closingLine: "Selalu di sini untukmu.",
    
    secretPhoto: secretPhoto,
    secretCaption: "Happy 20th Birthday, Verlita 🤍"
  };

  const draftMetadata = {
    slug: slug,
    theme: "vintage-burgundy",
    recipient: "Verlita",
    sender: "Dio",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await cfPut(`gift:${slug}`, giftData);
  await cfPut(`draft:${slug}`, draftMetadata);
  
  if (order) {
    order.status = 'done';
    order.updatedAt = new Date().toISOString();
    await cfPut(`order:${orderId}`, order);
    console.log(`✅ Marked order ${orderId} as done`);
  }
}

main().catch(console.error);
