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
  const kvId = 'gift-1784698315178';
  const orderId = 'ORD-MRVOJ58W';
  const customerName = 'Adrian';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Semoga", "Harimu", "Selalu", "Dipenuhi", "Hal", "Hal", "Baik", "I", "Love", "You", "❤️"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Beby Sayang",
    sender: "Adrian",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Risk it all - Bruno Mars",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Selamat Ulang Tahun,",
    heroLine2: "Beby Sayang ❤️",
    heroSubtitle: "Merayakan hari istimewamu, seseorang yang menjadi alasan terbesar di balik senyumku setiap hari.",
    
    timeEnabled: true,
    timeTitle: "Cerita Beby",
    timeSubtitle: "menjadi sosok yang luar biasa sejak",
    timeStartDate: "2002-07-23",

    introPreTitle: "sebuah pesan spesial",
    introHeadline1: "Untuk",
    introHeadline2: "Beby",
    introHeadline3: "Tersayang",
    introText: [
      "Selamat ulang tahun, sayangku. ❤️",
      "Hari ini adalah hari yang sangat spesial karena dunia pernah menghadirkan seseorang yang kini menjadi alasan terbesar di balik senyumku. Terima kasih sudah selalu ada, menemani setiap langkahku, dan mencintai aku dengan tulus.",
      "Aku berharap di usiamu yang baru ini, semua impianmu satu per satu menjadi kenyataan, kesehatan dan kebahagiaan selalu menyertaimu, dan setiap harimu dipenuhi hal-hal baik.",
      "Apa pun yang terjadi, aku ingin terus berada di sisimu, merayakan setiap momen, mendukungmu, dan tumbuh bersama.",
      "Semoga cinta kita semakin kuat, penuh kepercayaan, dan selalu dipenuhi tawa. Terima kasih sudah menjadi rumah terbaik untuk hatiku.",
      "Selamat ulang tahun, cintaku. Aku mencintaimu hari ini, esok, dan di setiap hari yang akan datang. 🎉🎂❤️"
    ],
    introSignOff: "Love, Adrian",

    reasonsTitle1: "Janji Aku",
    reasonsTitle2: "Buat Beby",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ janji setiaku ✨",
    reasons: [
      {
        icon: "👫",
        title: "Selalu Ada",
        desc: "Aku janji bakal selalu ada di samping kamu, nemenin setiap langkah kamu dalam situasi apa pun."
      },
      {
        icon: "🎉",
        title: "Merayakanmu",
        desc: "Aku bakal terus ngerayain setiap momen bahagia kamu sekecil apa pun itu, karena kamu pantes dapet yang terbaik."
      },
      {
        icon: "🌱",
        title: "Tumbuh Bersama",
        desc: "Apapun yang terjadi, aku janji buat terus tumbuh bersama kamu dan ngelewatin semua hal bareng-bareng."
      },
      {
        icon: "❤️",
        title: "Mencintaimu Tulus",
        desc: "Aku janji bakal terus mencintai kamu dengan tulus, hari ini, esok, dan seterusnya."
      },
      {
        icon: "✨",
        title: "Jadi Pendukungmu",
        desc: "Aku bakal selalu ngedukung semua impian kamu sampai satu per satu mimpi kamu jadi kenyataan."
      },
      {
        icon: "🥰",
        title: "Menjaga Senyummu",
        desc: "Kamu adalah alasan terbesar senyumku, dan aku janji bakal terus berusaha buat bikin kamu selalu tersenyum juga."
      }
    ],

    galleryTitle1: "Jejak",
    galleryTitle2: "Kenangan",
    galleryHint: "tap untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Aku mencintaimu hari ini, esok, dan selamanya ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Sekali lagi, selamat ulang tahun sayangku. Makasih ya udah jadi rumah terbaik buat hatiku. Semoga kita bisa terus bikin banyak kenangan indah bareng-bareng. I love you so much! ❤️",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Beby Sayang",
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
