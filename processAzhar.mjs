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
  const kvId = 'auto-35w6krn';
  const orderId = 'ORD-MRUU0CS5';
  const customerName = 'Azhar';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Selamat", "Ulang", "Tahun", "Melia", "Putri", "Lestari", "Sayangku", "Terima", "Kasih", "Telah", "Hadir", "Di", "Hidupku", "Cantik", "🤍"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Meme",
    sender: "Azhar",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: My Love Mine All Mine - Mitski",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Selamat Ulang Tahun,",
    heroLine2: "Sayangku 🌷",
    heroSubtitle: "Sebuah perayaan kecil untuk mensyukuri kehadiranmu yang begitu mewarnai kanvas kosong di hidupku.",
    
    timeEnabled: true,
    timeTitle: "Hadirmu Di Dunia",
    timeSubtitle: "dunia jadi lebih bermakna sejak",
    timeStartDate: "2005-07-22",

    introPreTitle: "sebuah pesan cinta",
    introHeadline1: "Untuk",
    introHeadline2: "Meme",
    introHeadline3: "Tersayang",
    introText: [
      "Terima kasih atas ketidaksengajaan pertemuan kita yang bisa dibilang absurd, dan terima kasih sudah memberi warna dalam kanvas kosongku.",
      "Terima kasih sudah jadi tempat bersandar paling nyaman di hidup aku. Ngga ada hari tanpa rasa syukur karena aku punya kamu.",
      "Kamu masih bertahan dengan segala kekuranganku, kamu masih berdiri kokoh di tengah terjangan angin kencang di hidup kamu. Aku bangga milikin kamu.",
      "Kita ngga boleh menyalahkan jarak, karena jaraklah yang pada akhirnya mempertemukan kita.",
      "Semua momen yang kita buat lewat obrolan singkat, ketikan panjang, maupun saat bermain game sangat berarti buat aku, buat kita."
    ],
    introSignOff: "Dengan seluruh cintaku, Azhar",

    reasonsTitle1: "6 Hal yang Sangat",
    reasonsTitle2: "Aku Syukuri",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ tentang kamu ✨",
    reasons: [
      {
        icon: "🎨",
        title: "Pertemuan Absurd",
        desc: "Ketidaksengajaan yang mempertemukan kita dan pada akhirnya memberi warna indah di kanvas hidupku."
      },
      {
        icon: "🫂",
        title: "Tempat Bersandar",
        desc: "Terima kasih karena kamu sudah menjadi tempat bersandar yang paling nyaman di hidup aku."
      },
      {
        icon: "🌱",
        title: "Bertahan Bersama",
        desc: "Kamu yang selalu sabar bertahan dengan segala kekuranganku sampai hari ini."
      },
      {
        icon: "✨",
        title: "Rasa Bangga",
        desc: "Melihatmu berdiri kokoh menghadapi angin kencang di hidupmu membuatku selalu bangga memilikimu."
      },
      {
        icon: "✈️",
        title: "Makna Jarak",
        desc: "Aku bersyukur atas jarak, karena jarak itulah yang pada akhirnya mempertemukan kita berdua."
      },
      {
        icon: "🎮",
        title: "Setiap Momen",
        desc: "Semua obrolan singkat, ketikan panjang, maupun saat kita main game bareng sangat berarti buat aku."
      }
    ],

    galleryTitle1: "Kumpulan",
    galleryTitle2: "Memori Kita",
    galleryHint: "ketuk fotonya buat liat lebih deket",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Lagi...",
    secretCaption: "Selamat ulang tahun, Melia Putri Lestari 🤍",

    closingPreTitle: "doa dan harapan",
    closingTitle1: "Selamat",
    closingTitle2: "Ulang Tahun 🤍",
    closingParagraph: "Semoga di usiamu yang ke-21 ini, kamu selalu dikelilingi kebahagiaan dan terus menjadi versi terbaik dari dirimu. Mari lewati lebih banyak jarak, waktu, dan rintangan bersama-sama. Selamat bertemu di tahun-tahun berikutnya. Selamat ulang tahun, Melia Putri Lestari, sayangku. Aku bangga dan bersyukur memilikimu.",
    celebrateBtnText: "miss you ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Meme",
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
