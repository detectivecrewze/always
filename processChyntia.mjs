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
  const kvId = 'auto-av61yi4';
  const orderId = 'ORD-MRUB83AZ';
  const customerName = 'Chyntia';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Riki",
    sender: "Chyntia",
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: shape of my heart - backstreet boys",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy Birthday,",
    heroLine2: "My Favorite Person ❤️",
    heroSubtitle: "Celebrating 28 years of you. Semoga tahun ini jadi tahun yang penuh keberuntungan dan cinta buat kamu.",
    
    timeEnabled: true,
    timeTitle: "A Beautiful Life",
    timeSubtitle: "making the world a better place since",
    timeStartDate: "1998-07-29", // Corrected year from 2026 to 1998 for 28th birthday

    introPreTitle: "a letter from the heart",
    introHeadline1: "For",
    introHeadline2: "The One",
    introHeadline3: "I Love",
    introText: [
      "Happy Birthday Sayang ❤️ Semoga di usia yang baru ini kamu selalu sehat, panjang umur, makin bahagia, rezekinya lancar, dan semua impian yang lagi kamu kejar bisa tercapai.",
      "I always pray that God protects you wherever you go and gives you strength in every challenge you face.",
      "Thank you for being such an amazing person in my life. Makasih karena selalu ada buat aku, selalu sabar ngadepin sifat aku, dan dengerin cerita-cerita random aku.",
      "Aku tahu kita nggak selalu punya hari yang sempurna. Kadang ada salah paham, tapi aku bersyukur karena kita selalu berusaha buat saling mengerti dan tetap bertahan.",
      "Thank you for every little thing you’ve done for me. Every hug, every laugh, every late-night conversation, and every moment we’ve shared together is so precious to me."
    ],
    introSignOff: "With all my love, Chyntia",

    reasonsTitle1: "Why You Are",
    reasonsTitle2: "So Special",
    reasonsHintTap: "tap to read more",
    reasonsHintAll: "✨ things I absolutely adore about you ✨",
    reasons: [
      {
        icon: "🫂",
        title: "My Safe Place",
        desc: "Thank you for making me feel loved, appreciated, and safe. You really mean so much to me."
      },
      {
        icon: "👂",
        title: "Great Listener",
        desc: "Makasih udah selalu nemenin aku di saat senang maupun capek dan sabar dengerin aku."
      },
      {
        icon: "🤝",
        title: "Our Understanding",
        desc: "Walau kadang kita beda pendapat, aku bersyukur kita selalu berusaha buat saling mengerti."
      },
      {
        icon: "🌟",
        title: "Your Hard Work",
        desc: "Aku akan selalu support kamu dan bangga sama setiap proses yang lagi kamu jalanin sekarang."
      },
      {
        icon: "💫",
        title: "The Little Things",
        desc: "Every reminder to stay strong and every simple moment we share means the world to me."
      },
      {
        icon: "❤️",
        title: "Being Yourself",
        desc: "Keep smiling and being yourself, because that’s exactly why I fell in love with you."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view closer",
    photos: [],

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "I love you more than words can say 🤍",

    closingPreTitle: "always & forever",
    closingTitle1: "Enjoy Your",
    closingTitle2: "Special Day 🎂",
    closingParagraph: "I hope this year brings you more happiness than ever before. Don’t forget to take care of yourself, eat well, get enough rest, and don’t push yourself too hard. Semoga kita bisa bikin banyak kenangan baru dan terus saling menemani apa pun yang terjadi.",
    celebrateBtnText: "celebrate ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Riki",
    customerName: customerName,
    theme: "midnight-blue",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
