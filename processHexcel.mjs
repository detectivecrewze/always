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
  const kvId = 'gift-1784739957848';
  const orderId = 'ORD-MRWCH32N';
  const customerName = 'Hexcel';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Nasya Sayang",
    sender: "Hexcel",
    theme: "velvet-purple",
    musicUrl: "FILL_MANUALLY: Semua Aku Dirayakan - Nadin Amizah",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy Sweet 17th & Anniversary,",
    heroLine2: "Nasya Sayang ❤️",
    heroSubtitle: "Merayakan dua momen paling indah di hari yang sama: hari lahirmu dan awal kisah cinta kita.",
    
    timeEnabled: true,
    timeTitle: "Double Celebration",
    timeSubtitle: "making memories together since",
    timeStartDate: "2009-07-25",

    introPreTitle: "a letter from the heart",
    introHeadline1: "Untuk",
    introHeadline2: "Nasya",
    introHeadline3: "Tersayang",
    introText: [
      "Selamat ulang tahun, sayangku. ❤️",
      "Hari ini jadi hari yang sangat spesial karena kita merayakan dua hal sekaligus: ulang tahunmu dan hari jadi hubungan kita.",
      "Terima kasih sudah hadir dan menjadi bagian terindah dalam hidupku.",
      "Semoga di usiamu yang baru, semua impianmu tercapai, kesehatan dan kebahagiaan selalu menyertaimu, dan setiap langkahmu dipenuhi keberuntungan.",
      "Aku berharap kita terus tumbuh bersama, saling menguatkan, saling mendukung, dan tetap bertahan melewati apa pun yang datang.",
      "Terima kasih sudah mencintai dan menerimaku apa adanya. Semoga ini bukan hanya perayaan hari ini, tetapi awal dari banyak momen indah yang akan kita lalui bersama.",
      "Happy Birthday dan Happy Anniversary, cintaku. Aku sayang kamu, hari ini, besok, dan seterusnya. ❤️🎉"
    ],
    introSignOff: "With all my love, Hexcel",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "You Are Special",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ precious moments ✨",
    reasons: [
      {
        icon: "🎉",
        title: "Double Happiness",
        desc: "Merayakan ulang tahunmu sekaligus anniversary kita di hari yang sama adalah kebahagiaan terbaik."
      },
      {
        icon: "🤍",
        title: "Unconditional Love",
        desc: "Terima kasih udah mencintai dan menerima aku apa adanya tanpa pernah menuntut lebih."
      },
      {
        icon: "🌱",
        title: "Growing Together",
        desc: "Aku berharap kita bisa terus tumbuh bareng, saling menguatkan dan mendukung di setiap langkah."
      },
      {
        icon: "🛡️",
        title: "Facing Everything",
        desc: "Makasih udah mau bertahan dan melewati apa pun rintangan yang datang bareng-bareng."
      },
      {
        icon: "✨",
        title: "The Sweetest Part",
        desc: "Kehadiran kamu benar-benar jadi bagian yang paling indah dan berharga di hidup aku."
      },
      {
        icon: "♾️",
        title: "Always & Forever",
        desc: "Semoga ini jadi awal dari lebih banyak momen indah yang akan kita lalui bersama seterusnya."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap untuk memperbesar",
    photos: [],

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy Sweet 17th Birthday & Anniversary, Nasya sayang! ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy Sweet 17th",
    closingTitle2: "& Anniversary 🎂❤️",
    closingParagraph: "Sekali lagi, selamat ulang tahun ke-17 dan Happy Anniversary, Nasya sayangku. Terima kasih sudah menjadi bagian paling manis di hidupku. Aku sayang kamu hari ini, besok, dan selamanya. ❤️🎉",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Nasya Sayang",
    customerName: customerName,
    theme: "velvet-purple",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
