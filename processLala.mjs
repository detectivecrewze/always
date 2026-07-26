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
  const kvId = 'auto-jddfw87';
  const orderId = 'ORD-MRZU5U5O';
  const customerName = 'lala';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const words = [
    "Happy", "24th", "Birthday", "Eyy", "Sayang",
    "Terima", "Kasih", "Sudah", "Selalu", "Memilih",
    "Aku", "Setiap", "Hari", "Yaa", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "eyy (sayangg)",
    sender: "lala",
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: Always - Daniel Caesar",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my dearest one",
    heroLine1: "Happy 24th Birthday,",
    heroLine2: "My Dearest Eyy ❤️",
    heroSubtitle: "Merayakan 24 tahun perjalanan usiamu, kebanggaanku yang luar biasa dan sosok terpavoritku.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing strength, warmth, and light into the world since",
    timeStartDate: "2002-07-25",

    introPreTitle: "a letter for my favorite person",
    introHeadline1: "For",
    introHeadline2: "My Dearest",
    introHeadline3: "Eyy",
    introText: [
      "Thank you sayangg sudah berusaha keras akhir-akhir ini untuk menyelesaikan sidangmu. I’m really proud of you. I know it wasn’t easy, but you made it this far. Hope you keep fighting until the very end, stay strong, and never give up. I believe in you, always.",
      "Maaf yaa, sayangg. Akhir-akhir ini aku merasa belum bisa jadi pasangan yang benar-benar mengerti kamu, terutama di saat kamu lagi ada di titik terpuruk. Aku sadar kadang aku masih terlalu egois dan lebih banyak memikirkan perasaanku sendiri. Tapi aku janji akan terus belajar untuk lebih memahami kamu, lebih banyak mendengarkan, dan berusaha jadi pasangan yang lebih baik buat kamu.",
      "Thank you for always staying by my side, for being patient with me, and for never giving up on us. Terima kasih sudah selalu mengusahakanku dan tetap memilih aku setiap hari.",
      "I love you so much, and I’m so grateful to have you in my life. ❤️"
    ],
    introSignOff: "With all my heart & love, Lala",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I Believe In You",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ precious qualities you hold ✨",
    reasons: [
      {
        icon: "🎓",
        title: "So Proud Of You",
        desc: "Aku bangga banget sama perjuangan dan kerja keras kamu menyelesaikan sidangmu."
      },
      {
        icon: "💪",
        title: "Never Give Up",
        desc: "Semangat terus yaa, tetap kuat dan jangan pernah menyerah. I believe in you, always."
      },
      {
        icon: "🌱",
        title: "Learning Together",
        desc: "Aku janji akan terus belajar lebih memahami kamu dan jadi pasangan yang lebih baik."
      },
      {
        icon: "🤍",
        title: "Patient & Kind",
        desc: "Makasih udah selalu sabar mendampingiku dan gak pernah menyerah sama hubungan kita."
      },
      {
        icon: "✨",
        title: "Choosing Me Daily",
        desc: "Terima kasih sudah selalu mengusahakanku dan tetap memilih aku setiap hari."
      },
      {
        icon: "♾️",
        title: "Grateful For Us",
        desc: "I love you so much, dan aku bersyukur banget miliki kamu di hidupku."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to enlarge",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 24th Birthday, Sayangg! I love you so much ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 24th",
    closingTitle2: "Birthday 🎂✨",
    closingParagraph: "Happy 24th Birthday once again, Sayangg. I'm so proud of everything you've accomplished and I will always be right here supporting you. Thank you for choosing me every day, and I love you so much! ❤️",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "eyy (sayangg)",
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
