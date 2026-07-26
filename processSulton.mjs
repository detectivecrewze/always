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
  const kvId = 'auto-6kv8kv2';
  const orderId = 'ORD-MS1GHVR1';
  const customerName = 'Sultonnuddin';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = [
      "Happy", "25th", "Birthday", "My", "Dearest",
      "Acin", "Thank", "You", "For", "Being",
      "My", "Everything", "Always", "Love", "💕"
    ];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "Vivi Nur Alifah (Acin)",
    sender: "Sultonnuddin",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Everything u are - Hindia",
    gateSubtitle: "Something Special For u",
    
    // PIN Protection from customer form
    pinEnabled: order?.pinEnabled ?? true,
    pinCode: order?.pinCode || "111120",
    pinHint: order?.pinHint || "Tanggal Spesial Kita",

    heroPreTitle: "a special 25th birthday wish",
    heroLine1: "Happy 25th Birthday,",
    heroLine2: "My Precious Acin 💕",
    heroSubtitle: "25 beautiful years of your presence making the world a brighter place.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing warmth & light into the world since",
    timeStartDate: "2001-07-31",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Acin",
    introHeadline3: "With Love",
    introText: [
      "Selamat ulang tahun sayangku, cintakuu, Acin! 🌸🎉 Cieee kamu udah 25 tahun, udah makin tua juga ya? Wkwkwk.",
      "Semoga Acin sehat selalu yaa, makin banyak rezekinya, makin semangat kerjanya. Semoga di tahun-tahun selanjutnya kamu makin sehat, sukses dietnya, makin bahagia, makin cantik (padahal sekarang aja udah cantik banget sih), dan makin dewasa.",
      "Makasih ya Acin udah mau sabar selama ini sama semua tingkahku, kelakuanku, egoisku, dan nakalku. Terima kasih udah selalu kuat mengimbangi aku.",
      "Aku bangga banget sama kamu yang udah bisa bertahan sampai di titik ini ngelewatin semua masalah. Nyangka gak kalau tahun ini kamu bakal wisuda? Anjay akhirnya wisudaa! Selamat yaaa atas semua perjuangan dan kerja kerasmu.",
      "I'm so proud of you, sayang. I love you more than words can say. Happy 25th Birthday, my favorite person! 💕🎂"
    ],
    introSignOff: "With all my love, Sultonnuddin",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I'm So Grateful For You",
    reasonsHintTap: "tap to reveal",
    reasonsHintAll: "✨ reasons why you mean the world to me ✨",
    reasons: [
      {
        icon: "🌸",
        title: "Endless Patience",
        desc: "Makasih udah selalu sabar menghadapi segala kelakuan, egois, dan nakalku selama ini."
      },
      {
        icon: "🎓",
        title: "Graduation Moment",
        desc: "Bangga banget akhirnya kamu wisuda tahun ini setelah melewati semua perjuangan keras."
      },
      {
        icon: "✨",
        title: "Unmatched Charm",
        desc: "Makin hari makin cantik dan selalu berhasil bikin aku jatuh cinta setiap harinya."
      },
      {
        icon: "👑",
        title: "Strong & Resilient",
        desc: "Kagum banget sama kekuatanmu yang selalu bertahan dan bisa melewati semua masalah."
      },
      {
        icon: "🤍",
        title: "Joyful Celebrations",
        desc: "Semoga di umur ke-25 ini makin bahagia, makin sukses, dan rezekinya makin melimpah."
      },
      {
        icon: "💕",
        title: "Proud of You",
        desc: "I'm always so proud of you dan akan terus ada untuk menemani setiap langkahmu."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view photos",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 25th Birthday, Acin sayang! I love you so much 💕",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 25th",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Happy 25th Birthday once again, Acin sayang. Congratulations on your graduation and 25 years of being amazing. I'm endlessly proud of you and I love you with all my heart! 💕",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Vivi Nur Alifah (Acin)",
    customerName: customerName,
    theme: "blush-pink",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
