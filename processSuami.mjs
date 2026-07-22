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
  const kvId = 'gift-1784690337823';
  const orderId = 'ORD-MRVITDPN';
  const customerName = 'Suami tercinta';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 4 words
  const words = ["Happy", "Seventh", "Month", "Anniversary"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Istri Tercinta",
    sender: "Suami Tercinta",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Nuansa Romansa - Danar",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 7th Month Anniversary,",
    heroLine2: "Istri Tercinta 🤍",
    heroSubtitle: "Merayakan tujuh bulan perjalanan indah kita, yang kini semakin bermakna dengan kehadiran si kecil.",
    
    timeEnabled: true,
    timeTitle: "Beautiful Moments",
    timeSubtitle: "growing together since",
    timeStartDate: "2025-12-21",

    introPreTitle: "a letter from the heart",
    introHeadline1: "Untuk",
    introHeadline2: "Istriku",
    introHeadline3: "Tersayang",
    introText: [
      "Happy 7th Month Anniversary, cintaku. 🤍 Maaf ya baru mengucapkannya setelah tanggal 21 kemarin.",
      "Alhamdulillah, tujuh bulan sudah kita menjalani perjalanan ini bersama. Terima kasih sudah menjadi istri terbaik dan selalu menemani setiap langkahku.",
      "Anniversary kali ini terasa lebih bermakna karena Allah telah menghadiahkan kita calon buah hati yang kini tumbuh di dalam kandunganmu.",
      "Semoga Allah selalu menjaga kamu dan si kecil, memudahkan setiap proses kehamilan hingga persalinan.",
      "Semoga keluarga kecil kita selalu dipenuhi cinta, keberkahan, dan sakinah, mawaddah, wa rahmah. Terima kasih sudah memilihku menjadi suamimu."
    ],
    introSignOff: "With all my love, Suamimu tercinta",

    reasonsTitle1: "6 Hal yang Paling",
    reasonsTitle2: "Aku Syukuri",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ tentang kita ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Jadi Istri Terbaik",
        desc: "Terima kasih sudah menjadi istri terbaik yang selalu menemani dan mendukung setiap langkahku."
      },
      {
        icon: "👫",
        title: "Perjalanan Kita",
        desc: "Alhamdulillah, tujuh bulan sudah kita lewati bersama dan setiap detiknya begitu berharga."
      },
      {
        icon: "👶",
        title: "Hadiah Terindah",
        desc: "Kehadiran calon buah hati di kandunganmu yang membuat anniversary kali ini terasa lebih bermakna."
      },
      {
        icon: "🥰",
        title: "Kesabaranmu",
        desc: "Kesabaran dan keikhlasanmu dalam menjalani masa-masa kehamilan ini membuatku semakin bersyukur memilikimu."
      },
      {
        icon: "💍",
        title: "Pilihan Hatimu",
        desc: "Dari sekian banyak orang, terima kasih karena kamu sudah memilihku untuk menjadi suamimu."
      },
      {
        icon: "🤲",
        title: "Doa Bersama",
        desc: "Harapanku agar keluarga kecil kita selalu dipenuhi cinta, keberkahan, dan menjadi keluarga yang sakinah."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view closer",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "I love you today, tomorrow, and forever 🤍",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Anniversary 🤍",
    closingParagraph: "Semoga Allah selalu menjaga kamu dan si kecil, serta memudahkan setiap proses kehamilannya hingga persalinan nanti. You are the best thing that ever happened to me, and I will always be by your side. I love you today, tomorrow, and forever. 🤍",
    celebrateBtnText: "cuddle time ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Istri Tercinta",
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
