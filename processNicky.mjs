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
  const kvId = 'gift-1785079082787';
  const orderId = 'ORD-MS20QHDP';
  const customerName = 'Nicky';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = [
      "Exactly", "One", "Year", "Ago", "I",
      "First", "Met", "You", "And", "Fell",
      "In", "Love", "With", "You", "❤️"
    ];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "Michelle",
    sender: "Nicky",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Risk it all - Bruno Mars",
    gateSubtitle: "Something Special For u",

    heroPreTitle: "a special story for my prettiest girl",
    heroLine1: "Since The Very First Moment,",
    heroLine2: "My Precious Michelle 💕",
    heroSubtitle: "One year since the day I first laid eyes on you, and my heart has been yours ever since.",

    timeEnabled: true,
    timeTitle: "Since I First Saw You",
    timeSubtitle: "the moment my world changed forever on",
    timeStartDate: "2025-07-27",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Michelle",
    introHeadline3: "With All My Love",
    introText: [
      "Tepat 1 tahun dari hari ini, itu hari pertama aku kenal kamu... Waktu itu jujur aku langsung jatuh cinta sebenarnya, tapi aku masih belum berani buat deketin kamu. Lalu 8 bulan kemudian, aku lihat kamu lagi dan langsung mutusin buat mengenal kamu lebih jauh. ❤️",
      "Sampai hari ini, aku masih gak nyangka bisa sesayang ini sama cewek imut ini. Makasih banyak yaa atas kehadiranmu setiap hari yang selalu buat hari-hariku jauh lebih berwarna dan selalu bikin aku happy. 🥰",
      "Beberapa hari lagi kita udah 4 bulan jadian. Kamu satu-satunya cewek yang akan selalu ada di hatiku. Aku janji bakal sayangin kamu terus, hari ini, besok, dan selamanya.",
      "Aku harap kita bisa bareng terus dan saling sayang terus yaa. Hubungan ini memang gak selalu mudah, tapi mari kita berjuang bareng-bareng untuk jadi lebih baik. I will always love you, Michelle! ❤️✨"
    ],
    introSignOff: "Forever yours, Nicky",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "You Are My Everything",
    reasonsHintTap: "tap to reveal",
    reasonsHintAll: "✨ moments that made me fall for you ✨",
    reasons: [
      {
        icon: "✨",
        title: "Love at First Sight",
        desc: "Tepat setahun lalu saat pertama kali lihat kamu, hatiku langsung yakin kamu orangnya."
      },
      {
        icon: "🌱",
        title: "The Courageous Step",
        desc: "Keputusan terbaikku adalah berani melangkah untuk mengenal kamu lebih jauh."
      },
      {
        icon: "🥰",
        title: "My Daily Happiness",
        desc: "Kehadiran Michelle setiap hari selalu sukses bikin hari-hariku jauh lebih berwarna."
      },
      {
        icon: "💕",
        title: "Four Months Together",
        desc: "Hampir 4 bulan jadian dan rasanya makin sayang setiap harinya dengan cewek imut ini."
      },
      {
        icon: "🤝",
        title: "Growing Side by Side",
        desc: "Walau hubungan gak selalu mudah, kita selalu berjuang bareng untuk jadi lebih baik."
      },
      {
        icon: "🔒",
        title: "Sole Promise",
        desc: "Kamu satu-satunya di hatiku dan aku janji akan selalu sayangin kamu selamanya."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Memories",
    galleryHint: "tap to view photos",
    photos: photos,

    secretPhoto: secretPhoto || '',
    secretTitle: secretPhoto ? "One More Thing..." : '',
    secretCaption: secretPhoto ? "Happy 1st Anniversary of meeting you, Michelle sayang! I love you so much ❤️" : '',

    closingPreTitle: "always & forever",
    closingTitle1: "One Year &",
    closingTitle2: "Forever Yours ❤️",
    closingParagraph: "Exactly one year since I first saw you, Michelle. Thank you for filling my life with so much color and joy. Let's keep growing, fighting together, and loving each other for all the years to come. I will always love you! 💕",
    celebrateBtnText: "forever & always ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Michelle",
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
