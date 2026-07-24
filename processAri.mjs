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
  const kvId = 'auto-eqj23vw';
  const orderId = 'ORD-MRVIT60R';
  const customerName = 'Ari Prabowo';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = ["Selamat", "Ulang", "Tahun", "Jessica", "Sayang", "Terima", "Kasih", "Selalu", "Ada", "🤍"];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "Jessica Sayang",
    sender: "Ari Prabowo",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Mesra mesraannya kecil kecilan dulu - Sal Priadi",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 19th Birthday,",
    heroLine2: "Jessica Sayang ❤️",
    heroSubtitle: "Merayakan hari lahirmu, sosok cantik yang hadir membawa kehangatan dan kebahagiaan di hidupku.",
    
    timeEnabled: true,
    timeTitle: "Jejak Usiamu",
    timeSubtitle: "menyinari dunia dengan kebaikanmu sejak",
    timeStartDate: "2007-07-26",

    introPreTitle: "surat sederhana dari hati",
    introHeadline1: "Untuk",
    introHeadline2: "Jessica",
    introHeadline3: "Tersayang",
    introText: [
      "Selamat ulang tahun yang ke-19 yaa sayang.. 🤍",
      "Di hari yang spesial ini, aku cuma mau berdoa semoga dengan bertambahnya usiamu, semua hal baik yang kamu inginkan dan cita-citakan bisa perlahan kesampaian.",
      "Semoga kamu tumbuh menjadi pribadi yang semakin dewasa, semakin baik, dan selalu dikelilingi kebahagiaan di setiap langkahmu.",
      "Terima kasih yaa sayang, terima kasih banyak telah bertahan sampai hari ini melewati setiap proses dan rintangan yang ada.",
      "Kehadiranmu sangat berarti buat aku, dan aku akan selalu ada di sini untuk mendukung serta menemani setiap perjuanganmu."
    ],
    introSignOff: "Dengan penuh rasa sayang, Ari",

    reasonsTitle1: "6 Hal Tentang",
    reasonsTitle2: "Dirimu",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ kebaikan hatimu ✨",
    reasons: [
      {
        icon: "😊",
        title: "Senyum Manismu",
        desc: "Senyumanmu selalu punya cara tersendiri untuk menghangatkan dan menenangkan hariku."
      },
      {
        icon: "🤍",
        title: "Kebaikan Hati",
        desc: "Ketulusan dan rasa pedulimu membuat kamu jadi sosok yang begitu istimewa di mataku."
      },
      {
        icon: "✨",
        title: "Keteguhanmu",
        desc: "Aku sangat kagum dengan caramu bertahan dan melewati setiap ujian hingga hari ini."
      },
      {
        icon: "🌸",
        title: "Kehadiranmu",
        desc: "Kehadiranmu membawa warna indah dan kebahagiaan yang tak tergantikan di hidupku."
      },
      {
        icon: "🌱",
        title: "Semangat Belajar",
        desc: "Usahamu untuk selalu belajar menjadi pribadi yang lebih baik setiap harinya selalu menginspirasi."
      },
      {
        icon: "🥰",
        title: "Rumah Nyaman",
        desc: "Bersamamu membuatku merasa aman, dimengerti, dan bersyukur setiap saat."
      }
    ],

    galleryTitle1: "Kenangan",
    galleryTitle2: "Indah",
    galleryHint: "sentuh untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Hal Lagi...",
    secretCaption: "Selamat ulang tahun yang ke-19, Jessica sayang! ❤️",

    closingPreTitle: "selamanya & seterusnya",
    closingTitle1: "Selamat",
    closingTitle2: "Ulang Tahun 🎂",
    closingParagraph: "Sekali lagi, selamat ulang tahun yang ke-19 yaa Jessica sayang. Terima kasih sudah bertahan dan berjuang sampai hari ini. Semoga usiamu yang baru ini membawa berkah, kesehatan, dan kebahagiaan yang melimpah. Aku sayang kamu hari ini dan seterusnya. ❤️",
    celebrateBtnText: "buat harapan ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Jessica Sayang",
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
