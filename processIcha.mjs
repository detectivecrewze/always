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
  const kvId = 'gift-1784629253476';
  const orderId = 'ORD-MRVFRZY9';
  const customerName = 'Icha';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 6 words
  const words = ["Happy", "Thirty", "Fifth", "Birthday", "My", "Love"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Steve",
    sender: "Icha",
    theme: "ocean-breeze",
    musicUrl: "FILL_MANUALLY: Shape of My Heart",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 35th Birthday,",
    heroLine2: "Steve ❤️",
    heroSubtitle: "Celebrating the day you were born and reminding you how much you mean to me.",
    
    timeEnabled: true,
    timeTitle: "A Beautiful Life",
    timeSubtitle: "making the world a better place since",
    // 2026 - 35 = 1991
    timeStartDate: "1991-07-27",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To",
    introHeadline2: "My",
    introHeadline3: "Favorite Person",
    introText: [
      "Alles Gute zum Geburtstag, mein Schatz! ❤️ Heute ist dein besonderer Tag, und ich wünsche dir von ganzem Herzen nur das Allerbeste.",
      "Ich bin unendlich dankbar, dass es dich gibt und dass ich dich kennenlernen durfte. Du bist einer der wertvollsten Menschen in meinem Leben. Mit dir fühlt sich selbst ein ganz normaler Tag besonders an.",
      "Ich bewundere deine Stärke, deine Geduld und dein großes Herz. Du gibst jeden Tag dein Bestes, und ich bin unglaublich stolz auf alles, was du bereits erreicht hast und noch erreichen wirst.",
      "Für dein neues Lebensjahr wünsche ich dir Gesundheit, Glück, Erfolg und ganz viele Momente, die dich zum Lächeln bringen. Ich hoffe, dass all deine Träume Schritt für Schritt in Erfüllung gehen. Und egal, was das Leben für dich bereithält – du musst nie alleine kämpfen. Ich werde immer an deiner Seite sein und an dich glauben.",
      "Auch wenn uns im Moment noch viele Kilometer trennen, träume ich von dem Tag, an dem wir deinen Geburtstag gemeinsam feiern können. Ich freue mich schon jetzt auf all die Erinnerungen, die wir noch zusammen schaffen werden.",
      "Danke, dass du mich liebst, mich unterstützt und mir jeden Tag das Gefühl gibst, etwas Besonderes zu sein. Du machst mein Leben schöner, einfach weil es dich gibt.",
      "Ich liebe dich von ganzem Herzen und freue mich auf alles, was noch vor uns liegt. Alles Gute zum Geburtstag, mein Liebling. Hab einen wundervollen Tag. ❤️🎂 Ich liebe dich – heute, morgen und jeden einzelnen Tag danach."
    ],
    introSignOff: "Deine Freundin, Icha",

    reasonsTitle1: "6 Things I Admire",
    reasonsTitle2: "About You",
    reasonsHintTap: "tap to read more",
    reasonsHintAll: "✨ why you are amazing ✨",
    reasons: [
      {
        icon: "💪",
        title: "Your Strength",
        desc: "I deeply admire your strength, your patience, and your incredibly big heart."
      },
      {
        icon: "🌟",
        title: "Your Effort",
        desc: "You always give your best every single day, and I am so proud of everything you have achieved."
      },
      {
        icon: "🤍",
        title: "Your Love",
        desc: "Thank you for loving me, supporting me, and making me feel special every single day."
      },
      {
        icon: "✨",
        title: "Your Presence",
        desc: "You make my life so much more beautiful just by existing in it."
      },
      {
        icon: "🚀",
        title: "Your Ambition",
        desc: "I believe in you so much, and I know all your dreams will come true step by step."
      },
      {
        icon: "✈️",
        title: "Our Future",
        desc: "Even though we are miles apart, I am looking forward to all the memories we will create together."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view closer",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Ich liebe dich von ganzem Herzen ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Birthday ❤️",
    closingParagraph: "Once again, happy 35th birthday! Thank you for loving me, supporting me, and making my life so much more beautiful. I am dreaming of the day we can finally celebrate together. I love you today, tomorrow, and every single day after! ❤️",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Steve",
    customerName: customerName,
    theme: "ocean-breeze",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
