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
  const kvId = 'auto-lgfucky';
  const orderId = 'ORD-MRULV56F';
  const customerName = 'icaa';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Walaupun", "LDR", "Sayangku", "Ke", "Kamu", "Nggak", "Akan", "Pernah", "Berubah", "Selamanya", "🤍"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Cayoo",
    sender: "Icaa",
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: Semua Aku Dirayakan - Nadin Amizah",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Selamat Ulang Tahun,",
    heroLine2: "Cayanggggg 🤍",
    heroSubtitle: "Walaupun kita LDR, rasa sayang ini nggak akan pernah berubah sekarang, selamanya, dan sampai kapan pun.",
    
    timeEnabled: true,
    timeTitle: "Cerita Tentangmu",
    timeSubtitle: "dunia jadi lebih indah sejak",
    timeStartDate: "2010-07-23",

    introPreTitle: "dari yang paling sayang",
    introHeadline1: "Untuk",
    introHeadline2: "Kesayangan",
    introHeadline3: "Hati",
    introText: [
      "Selamat bertambah usia, cayoo kesayanganku! 🤍",
      "Makasih banyak yaa udah mau nerima aku apa adanya, selalu sabar sama aku, mau nunggu aku, dan mau terbuka sama aku.",
      "Aku bahagia dan ngerasa beruntung banget punya kamu. Walaupun sekarang kita LDR, kamu harus tau kalau aku disini tetep sayang banget ke kamu.",
      "Semoga di umur yang baru ini kamu dipermudah segala urusannya, makin panjang umur, sehat dan bahagia selalu.",
      "Kamu di sana yang semangat yaa, jangan menyerah! Walaupun ini cuma kado sederhana, tapi ini beneran tulus dari hatiku buat kamu."
    ],
    introSignOff: "I love you, Icaa",

    reasonsTitle1: "6 Hal Terspesial",
    reasonsTitle2: "Dari Cayoo",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ alasan kenapa aku beruntung ✨",
    reasons: [
      {
        icon: "🥰",
        title: "Kesabaranmu",
        desc: "Kamu selalu sabar ngadepin aku dan mau nerima aku apa adanya walau kita jauh."
      },
      {
        icon: "🤍",
        title: "Keterbukaanmu",
        desc: "Makasih udah mau selalu terbuka dan nungguin aku terus selama kita jalani LDR ini."
      },
      {
        icon: "🌟",
        title: "Pantang Menyerah",
        desc: "Semangat kamu luar biasa. Aku selalu bangga sama setiap pencapaian yang udah kamu raih."
      },
      {
        icon: "✨",
        title: "Hati Baikmu",
        desc: "Tetep jadi orang baik yaa sayang, walaupun mungkin kadang orang mandang kamu sebelah mata."
      },
      {
        icon: "🔒",
        title: "Kasih Sayangmu",
        desc: "Semoga rasa sayang kamu ke aku nggak akan pernah berubah dari awal sampai akhir."
      },
      {
        icon: "🥺",
        title: "Kehadiranmu",
        desc: "Bikin aku sadar setiap hari kalau aku ini beruntung banget punya kamu di hidupku."
      }
    ],

    galleryTitle1: "Kumpulan",
    galleryTitle2: "Kenangan Kita",
    galleryHint: "ketuk fotonya buat liat lebih deket yaa",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Lagi...",
    secretCaption: "Aku disini selalu sayang kamu 🥰",

    closingPreTitle: "doa dan harapan",
    closingTitle1: "I Love You",
    closingTitle2: "Selamanya 🤍",
    closingParagraph: "Doa terbaikku selalu ada dan menyertai kamu di sana. Semoga kamu bisa jadi pribadi yang lebih baik lagi ke depannya. Aku selalu ada buat kamu, jadi jangan pernah ngerasa sendiri yaa.",
    celebrateBtnText: "kangen banget ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Cayoo",
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
