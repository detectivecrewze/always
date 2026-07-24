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
  const kvId = 'auto-vx3ptet';
  const orderId = 'ORD-MRWB6I3N';
  const customerName = 'Farid botak';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = [
    "Happy", "Third", "Anniversary", "Anggunly", "Sayang",
    "Terima", "Kasih", "Sudah", "Selalu", "Setia",
    "Menemaniku", "Berjuang", "Bersama", "Ya", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Anggunly Sayang",
    sender: "Farid botak",
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: shape of my hearts",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 3rd Anniversary,",
    heroLine2: "Anggunly Sayang 🤍",
    heroSubtitle: "Tiga tahun penuh perjalanan indah, perjuangan, dan cinta yang terus tumbuh bersama.",
    
    timeEnabled: true,
    timeTitle: "Chapters of Us",
    timeSubtitle: "building our future together since",
    timeStartDate: "2023-07-23",

    introPreTitle: "surat dari relung hati",
    introHeadline1: "Untuk",
    introHeadline2: "Anggunly",
    introHeadline3: "Tersayang",
    introText: [
      "Happy anniversary, sayangkuu 🤍",
      "Makasih yaa sayang, selama ini udah bertahan ngejalanin hubungan sama aku. Makasih juga udah sabar ngehadapin sifatku, segala tingkahku, dan tetap memilih buat bertahan.",
      "Terima kasih karena masih sayang sama aku dan udah menerima aku apa adanya. Semoga hubungan kita selalu diberi kebahagiaan, saling menguatkan, saling support, saling percaya, dan bisa sama-sama tumbuh jadi pribadi yang lebih baik.",
      "Aku tahu kita nggak selalu melewati hari-hari yang mudah, tapi aku bersyukur karena kita masih bisa berjuang bersama sampai hari ini.",
      "Semoga tahun depan kita udah jadi orang yang sukses yaa, bisa membanggakan kedua orang tua kita, dan semua usaha serta perjuangan yang kita jalanin sekarang membuahkan hasil yang indah. Semoga kita sama-sama bisa meraih cita-cita yang selama ini kita impikan.",
      "Aku berharap semoga kita bisa terus bareng, saling mendukung, dan selalu mengingat kalau tujuan kita bukan cuma bahagia hari ini, tapi juga membangun masa depan yang lebih baik.",
      "Sekali lagi, happy anniversary, sayang. Semoga ini bukan jadi anniversary yang terakhir, tapi salah satu dari banyak anniversary yang akan kita rayakan bersama 🤍"
    ],
    introSignOff: "Dengan seluruh cintaku, Farid",

    reasonsTitle1: "Momen & Perjalanan",
    reasonsTitle2: "Kita",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ kenangan berharga ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Bertahan Bersama",
        desc: "Makasih udah selalu sabar ngehadapin tingkahku dan tetap memilih bertahan di sampingku."
      },
      {
        icon: "🌱",
        title: "Tumbuh Bersama",
        desc: "Setiap hari bersamamu bikin aku belajar untuk terus tumbuh jadi pribadi yang lebih baik."
      },
      {
        icon: "🤝",
        title: "Melewati Badai",
        desc: "Aku bersyukur kita selalu saling menguatkan dan berjuang bersama melewati hari yang tak mudah."
      },
      {
        icon: "✨",
        title: "Meraih Cita-Cita",
        desc: "Semoga tahun depan dan seterusnya semua impian serta perjuangan kita membuahkan hasil indah."
      },
      {
        icon: "👨‍👩‍👧",
        title: "Banggakan Orang Tua",
        desc: "Harapanku biar kita sama-sama sukses dan bisa bikin kedua orang tua kita bangga."
      },
      {
        icon: "♾️",
        title: "Masa Depan Indah",
        desc: "Tujuan kita bukan cuma bahagia hari ini, tapi merayakan banyak anniversary di masa depan."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 3rd Anniversary, Anggunly sayang! ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 3rd",
    closingTitle2: "Anniversary 🤍",
    closingParagraph: "Terima kasih sudah menjadi rumah dan tempat teraman untukku pulang selama 3 tahun ini, Anggunly sayang. Aku bersyukur memiliki kamu, dan aku tidak sabar untuk terus melangkah bersama menuju masa depan kita yang lebih indah. I love you so much! 🤍",
    celebrateBtnText: "our future ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Anggunly Sayang",
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
