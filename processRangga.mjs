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
  const rawKvId = 'gift-1784625042763';
  // If the user provided 'gift-xxxx', we might need to use it directly, but typically the URL is just the ID. 
  // Let's use the full rawKvId as the ID for the URL just in case, but usually we prefix with 'gift:' in KV.
  // Actually, standard is 'gift:id' and 'draft:id'. So if ID is 'gift-1784625042763', then key is 'gift:gift-1784625042763'.
  // I will use 'gift-1784625042763' as the ID.
  const kvId = rawKvId; 
  const orderId = 'ORD-MRUHCL38';
  const customerName = 'Rangga';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Selamat", "Ulang", "Tahun", "Wanita", "Paling", "Kuat", "Dan", "Berharga", "Aku", "Mau", "Kamu", "Selamanya", "Cintaku", "Sayangku", "🤍"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Angelica Aura Salsabila",
    sender: "Rangga",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: shape of my heart",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Selamat Ulang Tahun,",
    heroLine2: "Sayangku Cintaku 🤍",
    heroSubtitle: "Merayakan hari lahir wanita paling kuat dan berharga yang ngebikin aku punya tujuan hidup lagi.",
    
    timeEnabled: true,
    timeTitle: "Hadirmu di Dunia",
    timeSubtitle: "dunia jadi lebih indah sejak",
    timeStartDate: "2005-07-23",

    introPreTitle: "sebuah pesan manis",
    introHeadline1: "Untuk",
    introHeadline2: "Cintaku",
    introHeadline3: "Tersayang",
    introText: [
      "Selamat ulang tahun yaa sayangku, cintaku. Lewat surat ini aku cuma mau jujur cerita tentang perasaanku ke kamu.",
      "Kamu itu orang pertama yang berhasil ngebikin aku punya tujuan hidup lagi. Kamu cantik, lucu, imut, gemes, dan walau kadang suka marah-marah karena aku nakal dan nggak nurut, aku tau itu karena kamu sayang.",
      "Aku masih inget, di awal dulu kamu itu kelihatan cuek, judes, dan agak egois. Tapi seiring berjalannya waktu, kamu perlahan berubah jadi pribadi yang lebih nurut dan sabar ngadepin aku.",
      "Kamu selalu berusaha ngebujuk aku ketika aku lagi marah atau diem. Maafin aku ya kalau selama ini malah aku yang sering jadi egois.",
      "Intinya, kamu berharga banget di hidupku. Kamu itu wanita tangguh, kuat, dan pekerja keras. Tanpa bantuan orang tua pun, kamu bisa buktiin kalau kamu hebat, cerdas, dan bisa beli apa pun sendiri.",
      "Aku selalu bangga sama kamu sayang, dan intinya... aku mau sama kamu selamanya."
    ],
    introSignOff: "Penuh cinta, Rangga",

    reasonsTitle1: "6 Hal Terspesial",
    reasonsTitle2: "Dari Kamu",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ kenapa aku sayang banget ✨",
    reasons: [
      {
        icon: "🧭",
        title: "Tujuan Hidupku",
        desc: "Kamu adalah orang pertama yang berhasil ngebikin aku punya arah dan tujuan hidup lagi."
      },
      {
        icon: "💪",
        title: "Wanita Mandiri",
        desc: "Kagum banget lihat kamu yang tangguh dan pekerja keras, bisa raih apapun pakai usahamu sendiri."
      },
      {
        icon: "🥰",
        title: "Menggemaskan",
        desc: "Sifat kamu yang cantik, lucu, imut, dan gemes walau kadang suka marah pas aku nakal."
      },
      {
        icon: "🥺",
        title: "Sabar & Pengertian",
        desc: "Kamu yang selalu nurut dan selalu mau ngebujuk aku ketika aku lagi marah atau diem."
      },
      {
        icon: "🌟",
        title: "Cerdas & Hebat",
        desc: "Kamu selalu bisa buktiin kalau kamu itu perempuan yang hebat, cerdas, dan luar biasa."
      },
      {
        icon: "🤍",
        title: "Paling Berharga",
        desc: "Intinya kamu itu sosok yang berharga banget di hidupku, dan aku mau kamu selamanya."
      }
    ],

    galleryTitle1: "Kumpulan",
    galleryTitle2: "Memori Kita",
    galleryHint: "ketuk fotonya buat liat lebih deket yaa",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Lagi...",
    secretCaption: "Intinya, aku mau kamu selamanya 🤍",

    closingPreTitle: "doa dari hati",
    closingTitle1: "I Love You",
    closingTitle2: "Selamanya 🤍",
    closingParagraph: "Semoga di usiamu yang ke-21 ini, kamu makin bahagia, rezekinya lancar, dan semua yang kamu cita-citakan tercapai. Terima kasih sudah hadir dan jadi bagian terpenting di hidupku. Aku sayang banget sama kamu.",
    celebrateBtnText: "cuddle time ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Angelica Aura Salsabila",
    customerName: customerName,
    theme: "vintage-burgundy",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  // Note: if kvId is 'gift-1784625042763', saving to `gift:gift-1784625042763`
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
