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
  const kvId = 'auto-am1w92a';
  const orderId = 'ORD-MRVWWUXQ';
  const customerName = 'Sandy pranowo';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Selamat", "Ulang", "Tahun", "Cantikkk", "Semoga", "Kita", "Terus", "Sama", "Sama", "Sampai", "Sukses", "Nanti", "Ya", "Lopyouuuuuu", "🤍"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Cantikkk",
    sender: "Sandy Pranowo",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: shape of my heart",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Selamat Ulang Tahun,",
    heroLine2: "Cantikkk ❤️",
    heroSubtitle: "Merayakan hari istimewamu, semoga ini menjadi awal dari cerita-cerita indah kita ke depannya.",
    
    timeEnabled: true,
    timeTitle: "Cerita Kamu",
    timeSubtitle: "menjadi sosok luar biasa sejak",
    timeStartDate: "2006-07-23",

    introPreTitle: "sebuah pesan spesial",
    introHeadline1: "Untuk",
    introHeadline2: "Si Paling",
    introHeadline3: "Cantikkk",
    introText: [
      "Selamat ulang tahun yaa! Semoga hari demi hari, bulan demi bulan, dan tahun demi tahun kamu bisa makin yakin sama diri aku hehe.",
      "Temenin aku sampai jadi tentara ya, dan aku janji akan ku temani prosesmu sejauh Sabang sampai Merauke.",
      "Semoga kita sama-sama bisa sukses, sama-sama bisa saling nasehatin dan berikan saran yang baik buat diri kita berdua.",
      "Apapun kata orang, itu bukan satu alasan buat kita berhenti bersama, tapi justru buat kita jadi lebih baik kedepannya.",
      "Lopyouuuuuu 🤍"
    ],
    introSignOff: "Love, Sandy",

    reasonsTitle1: "Janji Aku",
    reasonsTitle2: "Buat Kamu",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ janji setiaku ✨",
    reasons: [
      {
        icon: "🥰",
        title: "Yakin Sama Aku",
        desc: "Aku bakal terus berusaha buat bikin kamu makin yakin sama aku dari hari ke hari."
      },
      {
        icon: "🏃",
        title: "Nemenin Prosesmu",
        desc: "Aku bakal selalu ada buat nemenin semua proses kamu, bahkan sejauh Sabang sampai Merauke."
      },
      {
        icon: "🚀",
        title: "Sukses Bareng",
        desc: "Janji buat terus saling support biar kita bisa sama-sama sukses menggapai mimpi kita."
      },
      {
        icon: "🤍",
        title: "Saling Mengingatkan",
        desc: "Aku janji kita bakal terus saling nasehatin dan ngasih saran yang baik satu sama lain."
      },
      {
        icon: "👫",
        title: "Selalu Bersama",
        desc: "Apapun kata orang di luar sana, aku janji itu nggak akan jadi alasan buat kita berhenti bersama."
      },
      {
        icon: "✨",
        title: "Terus Membaik",
        desc: "Semua rintangan yang ada bakal kita jadiin pelajaran buat bikin hubungan kita jauh lebih baik ke depannya."
      }
    ],

    galleryTitle1: "Jejak",
    galleryTitle2: "Kenangan",
    galleryHint: "tap untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Lopyouuuuuu 🤍",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Sekali lagi selamat ulang tahun ya cantikkk. Semoga di usia yang baru ini, kamu makin bahagia dan semua impianmu tercapai. Ingat ya, aku bakal selalu ada buat nemenin langkahmu. Lopyouuuuuu! 🤍",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Cantikkk",
    customerName: customerName,
    theme: "vintage-burgundy",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
