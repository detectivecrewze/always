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
  const kvId = 'auto-0i96ho3';
  const orderId = 'ORD-MRTKWFMQ';
  const customerName = 'Andhini Mentari';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  let words = [];

  if (photoCount === 1) words = ["Sayangku 🤍"];
  else if (photoCount === 2) words = ["Selalu", "Bahagia 🤍"];
  else if (photoCount === 3) words = ["Selamat", "Ulang", "Tahun 🤍"];
  else if (photoCount === 4) words = ["Selamat", "Ulang", "Tahun", "Sayangku 🤍"];
  else if (photoCount === 5) words = ["Selamat", "Ulang", "Tahun", "Sayangku", "🤍"];
  else if (photoCount === 6) words = ["Selamat", "Ulang", "Tahun", "Sayang", "Terima", "Kasih 🤍"];
  else if (photoCount === 7) words = ["Selamat", "Ulang", "Tahun", "Sayang", "Aku", "Sayang", "Kamu 🤍"];
  else if (photoCount === 8) words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Terima", "Kasih", "Selalu", "Ada 🤍"];
  else if (photoCount === 9) words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Makasih", "Udah", "Jadi", "Alasan", "Senyumku 🤍"];
  else if (photoCount === 10) words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Terima", "Kasih", "Udah", "Bikin", "Aku", "Bahagia 🤍"];
  else if (photoCount === 11) words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Terima", "Kasih", "Udah", "Selalu", "Bikin", "Aku", "Bahagia 🤍"];
  else if (photoCount === 12) words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Terima", "Kasih", "Udah", "Sabar", "Dengerin", "Yappinganku", "Setiap", "Hari 🤍"];
  else if (photoCount === 13) words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Terima", "Kasih", "Udah", "Sabar", "Dengerin", "Yappinganku", "Setiap", "Hari", "🤍"];
  else if (photoCount === 14) words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Terima", "Kasih", "Udah", "Selalu", "Ada", "Dan", "Bikin", "Aku", "Terus", "Tersenyum 🤍"];
  else if (photoCount === 15) words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Terima", "Kasih", "Udah", "Selalu", "Ada", "Dan", "Bikin", "Aku", "Terus", "Tersenyum", "🤍"];
  else {
      for (let i = 0; i < photoCount; i++) {
          words.push(i === photoCount - 1 ? "🤍" : "Sayang");
      }
  }

  words = words.slice(0, photoCount);
  if (words.length > 0 && !words[words.length - 1].includes("🤍")) {
      words[words.length - 1] = words[words.length - 1] + " 🤍";
  }

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Nur Wahid Sattu",
    sender: "Andhini Mentari",
    theme: "ocean-breeze",
    musicUrl: "FILL_MANUALLY: Risk it all - Bruno Mars",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy Birthday,",
    heroLine2: "Sayangku 🤍",
    heroSubtitle: "Perayaan untuk manusia terhebat yang selalu setia dengerin semua ceritaku. Jarak bukan halangan buat kita.",
    
    timeEnabled: true,
    timeTitle: "Perjalanan Kamu",
    timeSubtitle: "dunia jadi lebih indah sejak",
    timeStartDate: "1998-08-23",

    introPreTitle: "surat dari jauh",
    introHeadline1: "Untuk",
    introHeadline2: "Alasan",
    introHeadline3: "Senyumku",
    introText: [
      "Selamat ulang tahun yaa, Sayangku! 🤍",
      "Terima kasih sudah jadi pendengar setia buat semua yappingan ku setiap hari. Terima kasih karena kamu selalu ada. Kehadiranmu itu selalu sukses bikin saya merasa bahagia dan tertawa lepas.",
      "Meskipun pertemuan kita awalnya singkat dan sekarang harus dilanjutkan dengan LDR, aku ngerasa rasa sayang dan cinta kita satu sama lain malah makin bertambah setiap harinya.",
      "Walaupun kita cuma bisa tatap muka lewat layar dan tanpa pertemuan langsung, kamu tetap dan selalu jadi salah satu alasan terbesar kenapa aku bisa terus tersenyum.",
      "Semoga di ulang tahunmu yang ke-28 ini, kamu selalu diberi kebahagiaan yang berlimpah, persis kayak kebahagiaan yang selalu kamu kasih ke aku 🤍"
    ],
    introSignOff: "Peluk dari jauh, Andhini Mentari",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I Love You",
    reasonsHintTap: "sentuh kartunya buat buka pesan yaa",
    reasonsHintAll: "✨ memori manis tentang kita ✨",
    reasons: [
      {
        title: "Dengerin Yappinganku",
        desc: "Momen saat kamu dengan sabar dengerin semua yappinganku setiap hari, itu bikin aku merasa dihargai."
      },
      {
        title: "Kehadiranmu",
        desc: "Setiap kali kamu hadir, rasanya aku selalu bisa ketawa dan ngerasa benar-benar bahagia."
      },
      {
        title: "Pertemuan Singkat",
        desc: "Pertemuan kita mungkin singkat, tapi memori itu cukup buat nguatin aku jalanin LDR ini."
      },
      {
        title: "Rasa yang Tumbuh",
        desc: "Momen di mana aku nyadar kalau rasa sayang kita malah makin bertambah dari hari ke hari."
      },
      {
        title: "Tatap Muka di Layar",
        desc: "Walau cuma lewat layar, ngelihat senyummu selalu jadi momen favoritku setiap harinya."
      },
      {
        title: "Alasan Senyumku",
        desc: "Kamu sukses jadi alasan utama kenapa aku bisa terus tersenyum di tengah jarak ini."
      }
    ],

    galleryTitle1: "Kumpulan",
    galleryTitle2: "Memori Kita",
    galleryHint: "ketuk fotonya buat liat lebih deket yaa",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Lagi...",
    secretCaption: "Walau jauh, rasa ini selalu dekat 🤍",

    closingPreTitle: "doa dari jauh",
    closingTitle1: "Aku Sayang",
    closingTitle2: "Kamu 🤍",
    closingParagraph: "Semoga umur 28 ini bawa banyak kebaikan buat kamu. Walau kita sekarang lagi LDR, aku selalu doain yang terbaik dari sini. Nggak sabar buat bikin lebih banyak memori bareng kamu nanti.",
    celebrateBtnText: "miss you ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Nur Wahid Sattu",
    customerName: customerName,
    theme: "ocean-breeze",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
