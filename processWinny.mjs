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
  const kvId = 'auto-7f1k8w6';
  const orderId = 'ORD-MRULMDB7';
  const customerName = 'Winnyyyaaa';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Terima", "Kasih", "Untuk", "Setiap", "Cerita", "Indah", "Yang", "Udah", "Kita", "Lewati", "Bersama", "Di", "SGD", "8", "🤍"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "SGD 8",
    sender: "Winnyyyaaa",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Not a lot, just forever - Adrianne Lenker",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "To My Dearest Friends,",
    heroLine2: "SGD 8 🤍",
    heroSubtitle: "Our journey in SGD 8 may have come to an end, but our memories will last a lifetime.",
    
    timeEnabled: true,
    timeTitle: "Since Our Farewell",
    timeSubtitle: "time passed since",
    timeStartDate: "2026-07-21",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To",
    introHeadline2: "My",
    introHeadline3: "Friends",
    introText: [
      "Tidak terasa perjalanan kita di SGD 8 sudah sampai di akhir. Rasanya baru kemarin kita saling mengenal, lalu perlahan tumbuh menjadi kelompok yang penuh cerita.",
      "Terima kasih untuk setiap diskusi, tawa, perdebatan, bantuan, dan kebersamaan yang bikin proses belajar terasa lebih ringan.",
      "Di balik tugas yang menumpuk, praktikum yang lelah, dosen yang menantang, dan ujian blok yang bikin panik, selalu ada kalian yang bikin itu semua jadi kenangan manis.",
      "Hari ini kita mungkin berpisah sebagai anggota kelompok, tapi semoga bukan sebagai teman. Semoga langkah kita bawa kita makin dekat sama mimpi jadi dokter yang hebat.",
      "Jika suatu hari nanti kita bertemu kembali dengan jas putih dan senyum yang sama, semoga kita masih mengingat bahwa perjalanan besar ini pernah dimulai dari kelompok kecil bernama SGD 8."
    ],
    introSignOff: "Penuh rindu, Winnyyyaaa",

    reasonsTitle1: "6 Unforgettable",
    reasonsTitle2: "Moments",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ our journey ✨",
    reasons: [
      {
        icon: "👋",
        title: "The Beginning",
        desc: "Rasanya baru kemarin kita saling mengenal, lalu tumbuh jadi kelompok yang penuh cerita."
      },
      {
        icon: "📚",
        title: "Ups & Downs",
        desc: "Melewati tugas numpuk, praktikum, dosen, sampai ujian blok yang bikin panik bareng."
      },
      {
        icon: "💬",
        title: "Discussions & Laughs",
        desc: "Terima kasih buat setiap diskusi, tawa, perdebatan, dan bantuan yang ringanin beban kita."
      },
      {
        icon: "💭",
        title: "Beautiful Memories",
        desc: "Selalu ada kalian yang ngebuat semua masa-masa berat dan melelahkan itu jadi indah."
      },
      {
        icon: "🎓",
        title: "Our Shared Dreams",
        desc: "Semoga langkah kita bawa kita makin dekat buat capai mimpi jadi dokter yang bermanfaat."
      },
      {
        icon: "🩺",
        title: "The White Coats",
        desc: "Kalau kita ketemu lagi dengan jas putih, semoga kita ingat memori kecil ini."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "ketuk fotonya buat liat lebih deket yaa",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Terima kasih untuk semuanya 🤍",

    closingPreTitle: "to our future",
    closingTitle1: "Sampai Jumpa",
    closingTitle2: "Teman-temanku 🤍",
    closingParagraph: "Terima kasih banyak untuk semuanya ya. Sampai jumpa di cerita berikutnya. Semoga kita semua selalu diberi kesehatan, kebahagiaan, dan kesuksesan terus ke depannya.",
    celebrateBtnText: "miss you ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "SGD 8",
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
