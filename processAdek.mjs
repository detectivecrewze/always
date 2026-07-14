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
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function cfSet(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  return res.ok;
}

const orderId = 'ORD-MRHVIWZG';
const kvId = 'auto-ngzkoa4';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery words: 8 words to match 8 photos
  const words = ["Selamat", "Ulang", "Tahun", "Ke-23", "Sayangku", "Aku", "Mencintaimu", "Selalu"];
  
  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Mamasss",
    theme: "vintage-burgundy",
    music: {
      file: "FILL_MANUALLY: Risk it all - Bruno Mars",
      title: "Risk it all",
      artist: "Bruno Mars"
    },
    
    gateSubtitle: "hadiah spesial buat kamu",
    gateTitle: "Buat Mamasss",
    
    heroPreTitle: "selamat ulang tahun",
    heroLine1: "Buat Kesayanganku",
    heroLine2: "Mamasss",
    heroSubtitle: "23 tahun perjalananmu yang indah.",
    
    timeEnabled: true,
    timeTitle: "Perjalananmu",
    timeSubtitle: "bersinar sejak",
    timeStartDate: "2003-08-12", // Corrected from 2026-08-12
    
    introIcons: ["🎂", "✨", "🤍"],
    introPreTitle: "catatan kecil",
    introHeadline1: "Selamat",
    introHeadline2: "Ulang Tahun",
    introHeadline3: "Ke-23",
    introText: [
      "Selamat ulang tahun yang ke-23, sayangku! 🎉",
      "Semoga di umur kamu yang baru ini, kamu panjang umur, sehat terus, dan selalu dikelilingi hal-hal baik ya.",
      "Makasih banyak ya sayang, dari lubuk hatiku yang paling dalam, karena kamu selalu sabar banget dan ngertiin aku.",
      "Kamu mungkin nggak tahu betapa bersyukurnya aku ada kamu di hidupku.",
      "Aku sayang banget sama kamu lebih dari apapun, dan semoga kita bisa terus ngerayain ulang tahun bareng-bareng.",
      "Sekali lagi, selamat ulang tahun, Mamasss! 💐"
    ],
    introSignOff: "Dengan penuh cinta,\nAdek",
    
    reasonsTitle1: "Alasan",
    reasonsTitle2: "Mengapa",
    reasons: [
      {
        title: "Paling Sabar",
        desc: "Makasih ya udah sabar banget ngadepin aku. Kesabaranmu berarti banget buat aku."
      },
      {
        title: "Tempat Amanku",
        desc: "Sama kamu aku ngerasa aman banget. Kamu bener-bener orang favoritku."
      },
      {
        title: "Sayang Banget",
        desc: "Aku sayang banget sama kamu lebih dari kata-kata. Susah buat ngungkapin berartinya kamu."
      },
      {
        title: "Bareng Terus",
        desc: "Semoga kita bisa terus bareng-bareng dan ngadepin apa aja yang ada di depan nanti."
      },
      {
        title: "Bersyukur Banget",
        desc: "Dari lubuk hatiku yang paling dalam, aku bersyukur banget bisa ketemu sama kamu."
      },
      {
        title: "Masa Depan",
        desc: "Aku nggak sabar nunggu masa depan kita nanti. Selamat ulang tahun ya sayang!"
      }
    ],
    
    photos: photos,
    galleryTitle1: "Momen",
    galleryTitle2: "Terindah",
    
    closingPreTitle: "selalu & selamanya",
    closingTitle1: "Selamat Ulang Tahun",
    closingTitle2: "Sayangku",
    closingParagraph: "Selamat ulang tahun yang ke-23 sayang. Semoga semua impianmu kecapai dan kita langgeng terus ya. Aku sayang banget sama kamu. Yuk kita rayain hari spesialmu!",
    closingLine: "kesayanganmu,",
    sender: "Adek",
    celebrateBtnText: "rayain yuk ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "selamat ulang tahun ke-23! 🥂",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "Adek",
    recipientName: "Mamasss",
    deadline: "2026-07-13T17:00",
    theme: "vintage-burgundy",
    moment: "Ultah",
    status: "done",
    createdAt: new Date().toISOString()
  };

  await cfSet(`gift:${kvId}`, giftData);
  console.log(`✅ Successfully saved gift:${kvId}`);

  await cfSet(`draft:${kvId}`, draftData);
  console.log(`✅ Successfully saved draft:${kvId}`);
}

processOrder().catch(console.error);
