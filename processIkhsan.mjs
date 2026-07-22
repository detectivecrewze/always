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
  const kvId = 'auto-xs8ekys';
  const orderId = 'ORD-MRUP0UW8';
  const customerName = 'Ikhsan';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Selamat", "Ulang", "Tahun", "Rara", "Sayang", "Calon", "Ibu", "Persit", "Yang", "Paling", "Mas", "Cinta", "I", "Love", "You"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Rara",
    sender: "Mas Ikhsan",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Somebody's Pleasure - Aziz Hedra",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Selamat Ulang Tahun,",
    heroLine2: "Sayangkuu 🤍",
    heroSubtitle: "Sebuah pesan kecil untuk merayakan hari lahir calon ibu persit kesayangannya mas.",
    
    timeEnabled: true,
    timeTitle: "Hadirmu Di Dunia",
    timeSubtitle: "dunia jadi lebih indah sejak",
    timeStartDate: "2007-07-31",

    introPreTitle: "surat dari mas",
    introHeadline1: "Untuk",
    introHeadline2: "Adek",
    introHeadline3: "Tersayang",
    introText: [
      "Selamatt bertambah usiaa sayanggkuuu! Semoga panjang umur, sehat selalu, dan dilancarkan rezekinya.",
      "Makasih yaa udah sabar banget dan setia nunggu mas. Maaf kalau mas sering banget bikin adek badmood akhir-akhir ini.",
      "Semoga kita bisa lewatin ini semua bareng-bareng yaa, sampai kita halal nanti. Mas sayanggg banget sama adek.",
      "Tunggu mas yaa, sampai nanti waktunya mas ajak adek pengajuan buat nikah. Mas ngga bakal aneh-aneh kok di sini.",
      "Jaga diri baik-baik yaaa sayanggg. Semoga adek tetep sayang dan cinta sama mas."
    ],
    introSignOff: "Love youuu sayangku, calon ibu persitt! Mas Ikhsan",

    reasonsTitle1: "6 Sifat Adek yang Bikin",
    reasonsTitle2: "Mas Makin Sayang",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ calon istriku ✨",
    reasons: [
      {
        icon: "🥰",
        title: "Kesabaran Adek",
        desc: "Makasih yaa udah selalu sabar banget ngadepin mas yang kadang suka bikin adek badmood."
      },
      {
        icon: "⏳",
        title: "Kesetiaan Adek",
        desc: "Setia nunggu mas sampai nanti waktunya kita halal dan pengajuan buat nikah."
      },
      {
        icon: "🤍",
        title: "Perhatian Adek",
        desc: "Yang selalu bikin mas ngerasa dicintai dan dijaga, walau kita lagi terpisah jarak."
      },
      {
        icon: "🥺",
        title: "Pengertian Adek",
        desc: "Selalu ngertiin keadaan mas di sini, tenang aja mas ngga bakal aneh-aneh kok."
      },
      {
        icon: "👑",
        title: "Calon Ibu Persit",
        desc: "Sifat adek yang selalu bikin mas yakin kalau adek adalah calon ibu persit yang paling hebat."
      },
      {
        icon: "💖",
        title: "Cinta Tanpa Syarat",
        desc: "Adek yang tetep sayang dan cinta sama mas, walaupun mas belum bisa ngasih apa-apa."
      }
    ],

    galleryTitle1: "Kumpulan",
    galleryTitle2: "Memori Kita",
    galleryHint: "ketuk fotonya buat liat lebih deket ya",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Lagi...",
    secretCaption: "Tunggu mas yaa sampai nanti halal 🤍",

    closingPreTitle: "selalu & selamanya",
    closingTitle1: "Selamat",
    closingTitle2: "Ulang Tahun 🤍",
    closingParagraph: "Sekali lagi, selamat ulang tahun yang ke-19 yaa sayangku. Maaf kalau mas gabisa ngasih apa-apa di hari spesial ini, tapi kasih sayang mas buat adek ngga akan pernah berkurang. Tunggu mas ya, sampai kita beneran halal dan sah. Jaga diri baik-baik di sana sayanggg, love uu! ✨",
    celebrateBtnText: "miss you ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Rara",
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
