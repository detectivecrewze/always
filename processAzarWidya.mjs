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
  const kvId = 'gift-1785216930139';
  const orderId = 'ORD-MS49NSZN';

  console.log(`Fetching order: order:${orderId}`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error(`Order order:${orderId} not found!`);
    return;
  }

  console.log('Order found. Photos:', order.photos?.length || 0);
  const orderPhotos = order.photos || [];

  let words = [];
  if (orderPhotos.length > 0) {
      // 10 words example sentence
      const sentence = "Makasih udah mau nerima aku jadi bagian hidupmu sayang 🤍";
      const sentenceWords = sentence.split(" ");
      if (sentenceWords.length === orderPhotos.length) {
          words = sentenceWords;
      } else if (sentenceWords.length > orderPhotos.length) {
          words = sentenceWords.slice(0, orderPhotos.length);
      } else {
          words = [...sentenceWords];
          while (words.length < orderPhotos.length) {
              words.push("✨");
          }
      }
  }

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    theme: "midnight-rose",
    musicUrl: "FILL_MANUALLY: Staying - Lizzy McAlpine",
    recipient: "Widya",
    sender: "Azar",
    
    // Gate
    gateSubtitle: "Something Special For u",
    
    // Hero
    heroPreTitle: "to my prettiest girl",
    heroLine1: "Untuk Sayangku,",
    heroLine2: "Widya",
    heroSubtitle: "Perjalanan jarak jauh kita mungkin penuh tantangan, tapi perasaanku ke kamu nggak akan pernah berubah.",
    
    // Time Section (LDR)
    timeEnabled: true,
    timeTitle: "Perjalanan Kita",
    timeSubtitle: "menjalin kasih jarak jauh bersama sejak",
    timeStartDate: "2026-06-29",
    
    // Intro Section
    introPreTitle: "cerita tentang kita",
    introHeadline1: "Untuk",
    introHeadline2: "Wanita Hebatku,",
    introHeadline3: "Widya",
    introText: [
      "Setelah 3 tahun kita kenal dan cuma bisa chatan sejak ngerjain portofolio bareng, akhirnya aku beraniin diri main ke rumah kamu. Hari pertama ketemu, aku seneng banget karena diterima dengan hangat sama keluargamu dan adek-adekmu.",
      "Lalu di hari kedua, kita sempet jalan dan makan bareng. Terus tiba-tiba kamu marah ke aku... Jujur waktu itu aku ngerasa takut banget kamu bakal menjauh dan ngilang dari aku.",
      "Sampai akhirnya di hari ketiga, tepat tanggal 29 Juni, aku berani ngajak kamu ketemu lagi buat ngungkapin semua perasaan aku. Setelah ngobrol panjang, akhirnya kamu mau nerima aku, dan kita mutusin untuk jalani hubungan ini lebih dalam.",
      "Walaupun sekarang kita harus LDR-an, aku bersyukur banget bisa lewatin semua momen itu sama kamu. Makasih ya sayang, udah ngasih aku kesempatan. Let's make this work together! 🤍"
    ],
    introSignOff: "Penuh cinta, Azar",
    
    // Gallery
    galleryTitle1: "Jejak Langkah",
    galleryTitle2: "Cerita Kita",
    photos: photos,
    
    // Reasons (moments)
    reasonsTitle1: "6 Momen Kenapa",
    reasonsTitle2: "Aku Sayang Banget Sama Kamu",
    reasons: [
      {
        icon: "💬",
        title: "Teman Chat 3 Tahun",
        desc: "Dari sekadar kenal waktu buat portofolio, obrolan kita selalu bikin aku ngerasa nyambung."
      },
      {
        icon: "🏡",
        title: "Disambut Keluargamu",
        desc: "Hari pertama main ke rumah, kehangatan keluargamu bikin aku ngerasa diterima."
      },
      {
        icon: "🍽️",
        title: "Makan Bareng",
        desc: "Momen hari kedua jalan dan makan bareng jadi memori yang susah aku lupain."
      },
      {
        icon: "🥺",
        title: "Takut Kehilanganmu",
        desc: "Waktu kamu marah di hari kedua, aku sadar betapa takutnya aku kalau kamu ngilang."
      },
      {
        icon: "🌻",
        title: "Keberanian 29 Juni",
        desc: "Hari di mana aku jujur soal perasaanku, dan betapa leganya aku saat kamu nerima."
      },
      {
        icon: "✈️",
        title: "Menjalani LDR",
        desc: "Kepercayaan kamu buat jalani hubungan jarak jauh ini bikin aku makin sayang."
      }
    ],
    
    // Closing
    secretPhoto: order.secretPhoto || "",
    secretCaption: "Kita pasti bisa lewatin jarak ini sama-sama 🤍",
    closingPreTitle: "always & forever",
    closingTitle1: "See You",
    closingTitle2: "Soon, Sayang ✨",
    closingParagraph: "Jaga diri baik-baik di sana ya sayang. Walau jarak misahin kita, hati kita bakal terus saling terikat. Nggak sabar buat ketemu kamu lagi dan bikin lebih banyak kenangan bareng. I love you!",
    celebrateBtnText: "miss you ✨",
    
    // Meta
    pinEnabled: false,
    pinCode: "",
    pinHint: ""
  };

  console.log('Generated gift data:', JSON.stringify(giftData, null, 2));

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
