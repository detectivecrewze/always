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

async function processOrder() {
  const kvId = 'gift-1785224452028';
  const orderId = 'ORD-MS4DP3AV';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  const orderPhotos = order.photos || [];

  // HARUS SAMA PERSIS jumlahnya dengan orderPhotos.length (15)
  // Tidak boleh dilooping atau di-modulo
  const words = [
    "Selamat",
    "Ulang",
    "Tahun",
    "Sayang",
    "Semoga",
    "Panjang",
    "Umur",
    "Dan",
    "Bahagia",
    "Selalu",
    "Sama",
    "Aku",
    "Terus",
    "Ya",
    "🤍"
  ];

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: My Everything - Bryant Barnes",
    recipient: "Shalfaa",
    sender: "Hafizz",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero
    heroPreTitle: "a special birthday wish",
    heroLine1: "Untuk Kesayanganku,",
    heroLine2: "Shalfaa",
    heroSubtitle: "Selamat bertambah usia untuk orang yang selalu bikin duniaku lebih berwarna.",
    
    // Time Section (Ultah)
    timeEnabled: true,
    timeTitle: "Chapter of You",
    timeSubtitle: "menghiasi dunia dengan senyuman sejak",
    timeStartDate: "2002-07-30", // Diperbaiki dari 2026 ke 2002 karena umur 24
    
    // Intro Section
    introPreTitle: "a birthday wish",
    introHeadline1: "Untuk",
    introHeadline2: "Milikku Sepenuhnya,",
    introHeadline3: "Shalfaa",
    introText: [
      "Kalau kamu lagi baca surat ini, berarti sekarang kamu lagi ngerayain hari yang paling spesial buat kamu. 🤍",
      "Aku harap pas baca ini kamu lagi senyum yaa, karena semua yang aku tulis di sini bener-bener dari hati. Mungkin aku nggak terlalu jago ngungkapin semuanya secara langsung, jadi aku mau nyampein lewat surat ini. Semoga surat kecil ini bisa jadi salah satu hal yang bikin hari ulang tahun kamu makin berkesan.",
      "Selamat ulang tahun sayaangg shalfaa kuu🌷🥰😘🎉🥳",
      "Gaa kerasa yaa, hari ini ayang resmi bertambah usia. Semoga di umur yang baru ini kamu selalu dikelilingi banyak hal baik dan kebahagiaan yang nggak ada habisnya.",
      "Aku cuma mau bilang makasii yaa, karena udah jadi sosok yang luar biasa buat aku. Makasii udah selalu ada, udah sabar ngadepin aku, udah mau dengerin cerita-cerita aku, dan udah nemenin aku sampai sejauh ini. Kamu itu unik, kuat, baik, dan selalu punya cara sendiri buat bikin suasana jadi lebih seru. Aku bener-bener bersyukur bisa kenal sama kamu dan sampai sekarang masih dikasih kesempatan buat jalan bareng sama kamu.",
      "Di umur yang sekarang, semoga semua doa dan keinginan kamu satu-satu bisa terwujud. Semoga selalu diberi kesehatan, kesabaran, rezeki yang lancar, dan kekuatan buat ngejalanin apa pun yang lagi kamu perjuangkan. Kalau lagi capek, jangan ragu buat istirahat yaa. Kamu nggak harus selalu kuat terus kok. Gapapa pelan-pelan, yang penting jangan nyerah. Aku yakin ayang pasti bisa ngelewatin semuanya satu per satu.",
      "Semoga kamu makin nemuin versi terbaik dari diri sendiri, makin percaya diri, makin yakin sama kemampuan yang kamu punya, makin berani ngejar semua mimpi dan hal-hal yang bikin kamu bahagia. Semoga semua langkah kamu selalu dimudahkan dan dipertemukan sama orang-orang baik di setiap perjalanan hidup kamu.",
      "Dan semoga makin sayang sama aku juga yaa hehehe 🤭❤️ aamiin.",
      "Makasii yaa udah jadi bagian dari hidup aku. Semoga kita masih bisa terus bikin banyak cerita, ketawa bareng, saling dukung, saling ngingetin, dan nemenin satu sama lain dalam waktu yang lama. Aku seneng banget bisa punya kamu. Semoga apa pun yang nanti kita hadapi, kita bisa tetap sama-sama, dan saling pilih setiap harinya.",
      "Oiyaa, buat hadiahnya menyusul yaa. Ditunggu ajaa hehehe😉😋 Semoga kamu suka yaa, walaupun mungkin bukan sesuatu yang mewah, tapi aku nyiapinnya dengan sepenuh hati.",
      "Sekali lagi, selamat ulang tahun yaa sayaangg. Pokoknya hari ini harus bahagia, jangan terlalu mikirin hal-hal yang berat dulu. Nikmatin hari spesial kamu, karena hari ini emang harinya ayang. Semoga semua doa baik balik ke kamu berkali-kali lipat.",
      "Terima kasih yaa, karena tanpa sadar kamu udah jadi salah satu alasan kenapa banyak hari-hari aku terasa lebih menyenangkan. Tetap jadi Shalfa yang aku kenal, yang selalu bisa bikin aku nyaman dan bersyukur setiap harinya.",
      "I'm so lucky to have you. I love you, selalu. 🥰❤️🎂"
    ],
    introSignOff: "Penuh kasih, Hafizz",
    
    // Gallery
    galleryTitle1: "Jejak Langkah",
    galleryTitle2: "Cerita Kita",
    photos: photos,
    
    // Reasons 
    reasonsTitle1: "6 Alasan Kenapa",
    reasonsTitle2: "Aku Bersyukur Ada Kamu",
    reasons: [
      {
        icon: "🥺",
        title: "Tulus Menerimaku",
        desc: "Makasih udah mau sabar ngadepin aku apa adanya sayang."
      },
      {
        icon: "🫂",
        title: "Selalu Ada",
        desc: "Kehadiranmu selalu bikin hari-hariku jadi jauh lebih menyenangkan."
      },
      {
        icon: "👂",
        title: "Pendengar Setia",
        desc: "Makasih yaa udah mau jadi tempat aku cerita semuanya."
      },
      {
        icon: "🌟",
        title: "Sosok Unik",
        desc: "Kamu itu unik, kuat, baik, dan selalu bisa ceriain suasana."
      },
      {
        icon: "✨",
        title: "Kekuatanku",
        desc: "Semangat kamu buat terus berjuang bikin aku ikutan semangat."
      },
      {
        icon: "🤍",
        title: "Teman Hidup",
        desc: "Aku bersyukur banget masih dikasih kesempatan buat nemenin kamu."
      }
    ],
    
    // Closing
    secretPhoto: order.secretPhoto || "",
    secretCaption: "I'll always choose you, Shalfa ❤️",
    closingPreTitle: "to many more years",
    closingTitle1: "Happy",
    closingTitle2: "24th Birthday ✨",
    closingParagraph: "Happy Birthday once again, sayang. Nikmatin hari spesial kamu ini ya, you deserve all the love and happiness in the world!",
    celebrateBtnText: "selamat ulang tahun ✨",
    
    // Meta
    pinEnabled: false,
    pinCode: "",
    pinHint: ""
  };

  console.log(`Saving to gift:${kvId}`);
  await cfSet(`gift:${kvId}`, giftData);
  
  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: giftData.recipient,
    theme: giftData.theme,
    createdAt: new Date().toISOString()
  };
  await cfSet(`draft:${kvId}`, draftData);

  console.log('Done processing order!');
}

processOrder().catch(console.error);
