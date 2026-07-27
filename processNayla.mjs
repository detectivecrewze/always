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
  const kvId = 'auto-t0yxl15';
  const orderId = 'ORD-MS3CW1CQ';
  const customerName = 'sandi';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Nayla Mufida",
    sender: "sandi",
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: Everything u are - Hindia",
    gateSubtitle: "Something Special For u",

    pinEnabled: true,
    pinCode: "280710",
    pinHint: "280701",

    heroPreTitle: "a special 16th birthday wish",
    heroLine1: "Happy 16th Birthday,",
    heroLine2: "My Dearest Nayla 💕",
    heroSubtitle: "16 beautiful years of your presence making the world a brighter place.",

    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing warmth & light into the world since",
    timeStartDate: "2010-07-28",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Nayla Mufida",
    introHeadline3: "With All My Love",
    introText: [
      "Semoga dengan bertambahnya usia u, u selalu jadi pribadi yang lebih baik lagi dari hari ke hari... Semoga u selalu diberikan kesehatan, baik fisik maupun mentalnyaa, dilancarkan rezekinya, dipermudah semua urusannya, dan dikuatkan di setiap proses yang sedang u jalani saat inii. ✨",
      "Tysm udaa hadir di hidup i, makasii juga atas cinta, perhatian, dan kesabaran yang u kasih selama nii. Semoga u nda mengulangi kesalahan u lagii, i percayaa kalau u pasti bisa berubah. Yang selalu berusaha bertahan dan berjuang walaupun capek and lelah... Semoga semua tujuan dan impian u bisa tercapai satu per satu! 💖",
      "Mangatt!! Berjuangnya mogaa bisa maksimal lat paskibnya, jangann perna berfikir buat menyerah ataupun berhenti di tengah-tengah perjuangan u. Karena lelah ataupun capek itu wajar, tapi berhenti bukan solusinyaa sayangg. Tetap jadi orang baik, meskipun dunia kadang tidak selalu baik ke u. 💪✨",
      "Ingat, sejauh apapun jarak dan sesibuk apapun keadaan, i selalu ada di sini... Mendoakan u, mendukung setiap langkah dan usaha u menjadi lebih baik. Tetap jaga diri, jaga sikap, dan jaga kepercayaan yang kita punya selamaa nii. Sayangg u bb! 🥺🤍✨"
    ],
    introSignOff: "Always yours, sandi",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I'm So Grateful For You",
    reasonsHintTap: "tap to reveal",
    reasonsHintAll: "✨ reasons why you mean the world to me ✨",
    reasons: [
      {
        icon: "🥺",
        title: "Grateful Heart",
        desc: "Tysm udah hadir di hidup i dan selalu memberikan cinta serta perhatian terbaik."
      },
      {
        icon: "💪",
        title: "Unwavering Spirit",
        desc: "Bangga banget lihat semangat u latihan paskib dan selalu berjuang ngelewatin capek."
      },
      {
        icon: "🤍",
        title: "Pure Belief",
        desc: "I selalu percaya kalau u pasti bisa tumbuh menjadi pribadi yang lebih baik lagi."
      },
      {
        icon: "🌌",
        title: "Always By Your Side",
        desc: "Sejauh apapun jarak dan sesibuk apapun keadaan, i selalu ada mendoakan u."
      },
      {
        icon: "✨",
        title: "Kindest Soul",
        desc: "Tetaplah jadi orang baik yaa sayangg, meskipun dunia kadang tidak selalu ramah."
      },
      {
        icon: "🔒",
        title: "Sacred Trust",
        desc: "Mari kita selalu jaga diri, jaga sikap, dan jaga kepercayaan yang kita miliki."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Memories",
    galleryHint: "tap to view photos",
    photos: [],

    secretPhoto: secretPhoto || '',
    secretTitle: secretPhoto ? "One Special Moment..." : '',
    secretCaption: secretPhoto ? "Happy 16th Birthday, Nayla Mufida sayang! Always stay strong & happy 🥺🤍" : '',

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 16th",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Happy 16th Birthday once again, Nayla Mufida sayang. Thank you for 16 wonderful years of your presence and for being my greatest joy. Tetap semangat latihan paskibnya dan jaga kesehatan selalu yaa. Sayang u bb! 🥺🤍✨",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Nayla Mufida",
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
