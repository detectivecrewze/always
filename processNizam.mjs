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
  const kvId = 'auto-lr4a1eq';
  const orderId = 'ORD-MRYDG5CX';
  const customerName = 'Nizam Rusydan Asyakur';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const words = [
    "Selamat", "Ulang", "Tahun", "Bu", "RT",
    "Cantik", "Terima", "Kasih", "Sudah", "Selalu",
    "Bertahan", "Bersamaku", "Ya", "Sayang", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Chariza (Bu RT)",
    sender: "Nizam Rusydan",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Sempurna",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my prettiest girl",
    heroLine1: "Happy 15th Birthday,",
    heroLine2: "Bu RT Cantikku 🤍",
    heroSubtitle: "Merayakan 15 tahun keindahan harimu, sosok tersayang yang selalu bikin hariku makin berwarna.",
    
    timeEnabled: true,
    timeTitle: "Perjalanan Usiamu",
    timeSubtitle: "menyinari dunia dengan senyumanmu sejak",
    timeStartDate: "2011-08-07",

    introPreTitle: "surat manis untuk bu rt",
    introHeadline1: "Untuk",
    introHeadline2: "Chariza",
    introHeadline3: "Tersayang",
    introText: [
      "Happy birthday yang ke-15 yaa Bu RT cantikkuuu! 🤍",
      "Makasih yaa udah mau bertahan sama aku selama ini, udah selalu sabar dan mau ngertiin aku di setiap keadaan.",
      "Semoga di usiamu yang baru ini, kamu makin tumbuh jadi pribadi yang makin baik, selalu sehat, dan semua impian kamu bisa pelan-pelan terwujud yaaa.",
      "Aku bakal selalu ada di sini buat nemenin kamu dan dukung setiap proses kamu. Pokoknya harus selalu bahagia yaaa sayang! ✨"
    ],
    introSignOff: "Dengan rasa sayang, Nizam",

    reasonsTitle1: "6 Hal Tentang",
    reasonsTitle2: "Dirimu",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ kebaikan hatimu ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Kebaikan Hatimu",
        desc: "Makasih yaa udah selalu tulus dan sabar banget mengerti aku di setiap moment."
      },
      {
        icon: "😊",
        title: "Senyum Manismu",
        desc: "Senyuman kamu tuh selalu sukses bikin hariku jadi makin cerah dan berwarna."
      },
      {
        icon: "✨",
        title: "Keteguhanmu",
        desc: "Aku salut banget sama kamu yang selalu kuat dan bertahan sejauh ini bareng aku."
      },
      {
        icon: "🌸",
        title: "Kehadiranmu",
        desc: "Adanya kamu di hidupku bener-bener bawa kebahagiaan yang manis banget."
      },
      {
        icon: "🥰",
        title: "Perhatianmu",
        desc: "Rasa peduli dan perhatian kecil dari kamu selalu bikin aku merasa berharga."
      },
      {
        icon: "🤝",
        title: "Setia Bersamaku",
        desc: "Bersamamu terasa seru dan nyaman, tempat terfavoritku buat berpulang."
      }
    ],

    galleryTitle1: "Kenangan",
    galleryTitle2: "Indah",
    galleryHint: "sentuh untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Hal Lagi...",
    secretCaption: "Happy 15th Birthday, Chariza sayang! 🤍",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 15th",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Sekali lagi selamat ulang tahun yang ke-15 yaa Bu RT cantikku. Terima kasih sudah mau bertahan dan berjalan sejauh ini bersamaku. Semoga harimu selalu penuh tawa dan kebahagiaan. I love you so much! 🤍",
    celebrateBtnText: "buat harapan ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Chariza (Bu RT)",
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
