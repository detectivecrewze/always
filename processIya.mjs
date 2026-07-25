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
  const kvId = 'auto-03b1oc7';
  const orderId = 'ORD-MRZTZQEZ';
  const customerName = 'iyaaaa';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const words = [
    "Happy", "20th", "Birthday", "Abang", "Sayang",
    "Terima", "Kasih", "Sudah", "Selalu", "Sabar",
    "Dan", "Menyayangi", "Aku", "Yaa", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "M. Imam Mahdi (Abang)",
    sender: "iyaaaa",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Dunia Yang Nanti - Raim Laode",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my dearest person",
    heroLine1: "Happy 20th Birthday,",
    heroLine2: "M. Imam Mahdi (Abang) 🤍",
    heroSubtitle: "Today, we celebrate you, sayang. Merayakan 20 tahun perjalanan usiamu di dunia.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing light, joy, and warmth into the world since",
    timeStartDate: "2006-07-27",

    introPreTitle: "a letter for my abang",
    introHeadline1: "To My",
    introHeadline2: "Dearest Abang",
    introHeadline3: "M. Imam Mahdi",
    introText: [
      "Happy u day... Today, we celebrate u, sayang! 🌸✨",
      "Gak kerasa yaa udah 20 tahun abang di dunia. Semoga semakin lama abang menjalani hidup ini, semakin banyak juga pintu kebaikan yang terbuka buat abang. Semoga semua usaha dan kerja keras abang untuk menggapai impian selalu menemukan jalannya dan dihargai oleh dunia.",
      "Makasih banyak selama ini abang udah selalu hadir di hidup aku di segala situasi, udah sabar dan gak pernah capek ngadepin aku, dan makasih udah mau berbagi banyak cerita juga dengerin semua curhatan aku. Sering kali setiap marah aku bilang abang gak cocok jadi sosok abang, nyatanya itu gak bener. Abang selalu jadi sosok abang yang baik di hidup aku. Makasih udah ngasih anak tunggal ini kesempatan untuk ngerasain sosok abang. Tetap jadi selayaknya abang buat anak tunggal ini sampai akhir yaa.",
      "Gak lupa juga aku mau minta maaf... Maaf aku sering marahin abang, ngambek karena hal sepele, dan kadang aku maunya dingertiin tapi kurang bisa ngertiin abang. Aku sadar apa yang aku lakuin itu, tapi aku suka karena waktu aku ngelakuin itu semua, respon abang selalu nyayangin aku. Aku mau selalu disayang abang. Aku gak sensitif ke orang lain karena aku tahu mereka bukan abang, cuma abang yang bisa nyayangin aku kalau aku sensitif.",
      "Semoga kita bisa terus sama-sama yaa, dan pastinya sukses bareng! Makasih udah ngerayain ulang tahun aku beberapa bulan lalu, itu pertama kalinya aku dirayain cowok dan ini juga bakal jadi kali pertama aku ngerayain cowok. Walaupun sederhana, tapi aku mau abang ngerasa spesial di hari ini. Karena aku tahu aku gak bisa ngasih kado di hari ini juga, kadonya di bulan yang akan datang yaa abang sayangg hehe.",
      "Sekali lagi, selamat ulang tahun yaa. Tetap sehat, tetap jadi diri sendiri... Wherever life takes u, just know u'll always have me by ur side, through every step, every challenge, and every win. 🤍✨"
    ],
    introSignOff: "With all my love & affection, Iyaaaa",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I'm Grateful For You",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ thank you for everything ✨",
    reasons: [
      {
        icon: "🚪",
        title: "Open Doors & Dreams",
        desc: "Semoga semua kerja keras abang menggapai impian selalu dihargai dan dibukakan jalan."
      },
      {
        icon: "🤍",
        title: "Sosok Abang Terbaik",
        desc: "Makasih udah ngasih anak tunggal ini kesempatan merasakan sosok abang yang luar biasa."
      },
      {
        icon: "👂",
        title: "Always Listening",
        desc: "Terima kasih selalu hadir di segala situasi, sabar, dan mau dengerin cerita curhatanku."
      },
      {
        icon: "🤗",
        title: "Your Patient Love",
        desc: "Maaf yaa kalau suka ngambek, makasih respon abang selalu nyayangin dan ngertiin aku."
      },
      {
        icon: "🎂",
        title: "First Birthday Celebrating",
        desc: "Seneng banget bisa ngerayain ultah abang pertama kalinya, biarpun sederhana semoga spesial."
      },
      {
        icon: "🤝",
        title: "Always By Your Side",
        desc: "Wherever life takes u, I'll always be by ur side through every step, challenge & win."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to enlarge",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 20th Birthday, Abang Sayang! Kadonya menyusul bulan depan yaa hehe 🤍✨",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 20th",
    closingTitle2: "Birthday 🎂✨",
    closingParagraph: "Happy 20th Birthday once again, Abang Sayang! Terima kasih sudah menjadi sosok yang selalu sabar dan menyayangiku. Wherever life takes you, know that you will always have me by your side through every step, challenge, and win. I love you! 🤍✨",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "M. Imam Mahdi (Abang)",
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
