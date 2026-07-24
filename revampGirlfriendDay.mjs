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

async function main() {
  const kvId = 'auto-kvoggmb';
  console.log(`Fetching existing gift data for ${kvId}...`);
  const existingGift = await cfGet(`gift:${kvId}`);

  if (!existingGift) {
    console.error('Gift data not found!');
    return;
  }

  // Preserve media files & audio
  const photos = existingGift.photos || [];
  const words = [
    "Happy", "National", "Girlfriend's", "Day", "To",
    "My", "Precious", "Girlfriend", "Lisa", "🤍"
  ];

  for (let i = 0; i < photos.length; i++) {
    photos[i].caption = words[i] || '';
  }

  const updatedGiftData = {
    ...existingGift,
    recipient: "Lisa Sayang",
    sender: "Al",
    theme: "vintage-burgundy",
    gateSubtitle: "Something Special For u",

    heroPreTitle: "to my prettiest girl",
    heroLine1: "Happy Girlfriend's Day,",
    heroLine2: "Lisa Sayang",
    heroSubtitle: "Merayakan 1 Agustus, hari spesial buat ngapresiasi cewek paling cantik dan paling berharga di hidupku.",

    timeEnabled: true,
    timeTitle: "Us Through Time",
    timeSubtitle: "4 tahun bareng-bareng sejak",
    timeStartDate: "2022-04-24",

    introPreTitle: "national girlfriend's day special",
    introHeadline1: "To The Most",
    introHeadline2: "Beautiful Girl",
    introHeadline3: "Lisa Tersayang",
    introText: [
      "Happy National Girlfriend's Day yaa sayang! 🤍",
      "Hari ini, 1 Agustus, diciptain khusus buat ngerayain kamu, sosok cewek luar biasa yang selalu bikin hari-hariku penuh tawa, kehangatan, dan rasa bahagia.",
      "Thank you so much udah jadi partner yang paling sabar, penyayang, dan selalu support aku. Bersamamu, aku belajar kalau being loved sincerely is the sweetest feeling ever.",
      "Makasih yaa udah milih buat bertahan dan selalu ada di sampingku. I feel so lucky and proud to have you as my girlfriend.",
      "Happy Girlfriend's Day, my love. Hari ini, besok, dan selamanya, kamu bakal selalu jadi favorit aku."
    ],
    introSignOff: "With all my love, Al",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "You Are My Everything",
    reasonsHintTap: "tap kartunya yaa",
    reasonsHintAll: "✨ hal-hal yang bikin aku bersyukur ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Your Sweet Smile",
        desc: "Senyum manismu tuh selalu punya cara buat ngilangin capek dan ngehangatin hariku."
      },
      {
        icon: "✨",
        title: "Endless Kindness",
        desc: "Ketulusan dan kebaikan hatimu selalu bikin aku bersyukur banget bisa miliki kamu."
      },
      {
        icon: "🛡️",
        title: "My Safe Haven",
        desc: "Tiap di sampingmu rasanya nyaman dan tenang banget, tempat teraman buat aku berpulang."
      },
      {
        icon: "🦋",
        title: "Constant Support",
        desc: "Makasih udah selalu jadi support system terbaik yang nggak pernah berhenti percaya sama aku."
      },
      {
        icon: "🥺",
        title: "Pure Compassion",
        desc: "Kesabaranmu ngehadapin aku bener-bener ngajarin aku arti cinta tulus yang sesungguhnya."
      },
      {
        icon: "🤞",
        title: "Our Beautiful Journey",
        desc: "Aku bersyukur banget bisa terus melangkah dan tumbuh bareng cewek sehebat kamu."
      }
    ],

    seasonsTitle1: "A Love For",
    seasonsTitle2: "Every Season",
    seasonsHint: "tap each card to unfold its meaning",
    seasons: [
      {
        icon: "🌸",
        name: "Spring",
        teaser: "where it all bloomed",
        message: "Like the first bloom of spring, you brought fresh hope and joy into my life. Every day with you feels brand new."
      },
      {
        icon: "☀️",
        name: "Summer",
        teaser: "warmth of your laugh",
        message: "Your warmth and laughter are the sunshine that keeps my heart glowing through every single day."
      },
      {
        icon: "🍂",
        name: "Autumn",
        teaser: "constant through change",
        message: "Through every season of life, my love for you remains steadfast, true, and unchanging."
      },
      {
        icon: "❄️",
        name: "Winter",
        teaser: "my favorite warmth",
        message: "Even in cold times, having you is all the warmth I will ever need. You are my home."
      }
    ],

    galleryTitle1: "My Beautiful",
    galleryTitle2: "Girlfriend",
    galleryHint: "tap to enlarge",
    photos: photos,

    secretTitle: "One More Thing...",
    secretCaption: "Happy National Girlfriend's Day, Lisa sayang! 🤍",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Girlfriend's Day 💐",
    closingParagraph: "Sekali lagi, Happy Girlfriend's Day untuk gadis tercantikku. Terima kasih sudah hadir dan mewarnai duniaku dengan indah. I love you more than words can ever express! 🤍",
    celebrateBtnText: "love you always ✨"
  };

  const draftData = {
    id: kvId,
    orderId: "ORD-GIRLFRIENDSDAY",
    recipientName: "Lisa Sayang",
    customerName: "Al",
    theme: "vintage-burgundy",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Updating KV for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, updatedGiftData);
  console.log(`✅ Revamped gift ${kvId} for National Girlfriend's Day!`);
}

main().catch(console.error);
