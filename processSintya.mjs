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

const CLOUDFLARE_API_TOKEN = env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
const KV_NAMESPACE_ID = env.KV_NAMESPACE_ID;

if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !KV_NAMESPACE_ID) {
  console.error("Missing Cloudflare credentials in .env.local");
  process.exit(1);
}

const KV_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values`;

async function cfGet(key) {
  try {
    const res = await fetch(`${KV_API_URL}/${key}`, {
      headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to GET ${key}: ${res.statusText}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error(`Error reading ${key}:`, err);
    return null;
  }
}

async function cfPut(key, value) {
  try {
    const res = await fetch(`${KV_API_URL}/${key}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value)
    });
    if (!res.ok) {
      throw new Error(`Failed to PUT ${key}: ${res.statusText}`);
    }
    console.log(`✅ Successfully saved ${key}`);
  } catch (err) {
    console.error(`Error writing ${key}:`, err);
  }
}

async function main() {
  const orderId = "ORD-MRHIOJ8K";
  const slug = "auto-l8a85fy";
  
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "Happy",
    "25th",
    "Birthday",
    "To",
    "My",
    "Dearest",
    "Love,",
    "Thank",
    "You",
    "For",
    "Being",
    "My",
    "Everything",
    "❤️"
  ];

  const photos = [];
  for (let i = 0; i < 14; i++) {
    photos.push({
      url: orderPhotos[i] || '', 
      caption: words[i] || ''
    });
  }

  const giftData = {
    slug: slug,
    theme: "vintage-burgundy",
    
    music: {
      file: "FILL_MANUALLY: My love", 
      title: "My Love",
      artist: "Requested"
    },

    heroPreTitle: "A SPECIAL GIFT",
    heroLine1: "To My Love,",
    heroLine2: "Fery",
    heroSubtitle: "Sebuah apresiasi kecil untuk hadirmu yang sangat berharga dalam hidupku.",

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Fery",
    gateSubtitle: "untuk merayakan usiamu yang ke-25",
    recipient: "Fery",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Every step you take is something to be proud of, keep moving forward.",
    timeStartDate: "2001-07-20", // 25 years old in 2026

    introIcons: ["❤️", "✨", "🎂"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "25th",
    introHeadline3: "Birthday",
    introText: [
      "Aku bukanlah wanita yang paling pintar dalam memahami cara berpikirmu, dan aku juga bukan wanita yang selalu bisa memberikan kejutan-kejutan indah untukmu. Mungkin aku masih memiliki banyak kekurangan dan terkadang belum bisa menjadi seseorang yang sempurna untukmu. Tapi jika kamu pernah berpikir bahwa aku tidak peduli denganmu, kamu salah.",
      "Karena tanpa kamu sadari, hal-hal kecil yang terjadi padamu selalu menjadi sesuatu yang aku pikirkan. Aku selalu mencoba memahami perasaanmu, memikirkan bagaimana cara menyikapinya, dan bagaimana caraku bisa membuatmu merasa lebih baik. Mungkin aku tidak selalu pandai menunjukkan semuanya, tapi rasa peduliku selalu ada untukmu.",
      "Terima kasih telah hadir di hidupku dan memberikan cinta yang belum pernah aku temui sebelumnya. Terima kasih untuk setiap kesempatan, setiap waktu, dan setiap momen kecil yang membuatku merasa begitu bahagia. Terima kasih juga karena selama ini kamu selalu sabar menghadapi segala hal, tetap bertahan, dan memberikan kasih sayang yang begitu besar.",
      "Aku berharap di usiamu yang ke-25 ini, semoga semua hal baik selalu beriringan denganmu. Semoga kamu selalu diberikan kesehatan, dilancarkan rezekinya, disayangi oleh keluarga, dimudahkan dalam setiap urusan, dan terus menjadi pribadi yang lebih baik lagi.",
      "Teruslah tumbuh, melangkah maju, dan kejar semua impianmu. Ketika nanti kamu merasa lelah atau ragu, ingatlah bahwa ada seseorang yang selalu percaya padamu, yang selalu bangga dengan setiap prosesmu, baik dalam keberhasilan maupun kegagalanmu.",
      "Aku mungkin tidak selalu bisa berada di sampingmu setiap saat, tetapi aku akan selalu mendukungmu dari mana pun aku berada. Melihatmu berusaha, berkembang, dan menjadi versi terbaik dari dirimu adalah salah satu kebahagiaan terbesar bagiku.",
      "Selamat ulang tahun, my love. Terima kasih sudah menjadi bagian terindah dalam hidupku. I love you ❤️"
    ],
    introSignOff: "With all my love,\nSintya",

    reasonsTitle1: "The Best",
    reasonsTitle2: "Keepsakes",
    reasons: [
      {
        title: "Unspoken Care",
        desc: "My care for you is always here, silently wishing you the best."
      },
      {
        title: "Endless Patience",
        desc: "Terima kasih sudah bersabar and giving me love I've never known."
      },
      {
        title: "Little Moments",
        desc: "Hal kecil tentangmu adalah memori terindah di pikiranku."
      },
      {
        title: "Growing Together",
        desc: "Keep chasing your dreams. Aku selalu bangga padamu."
      },
      {
        title: "Endless Support",
        desc: "My endless support will always reach you wherever you are."
      },
      {
        title: "My Greatest Joy",
        desc: "Melihatmu bahagia is one of my greatest joys in life."
      }
    ],

    galleryTitle1: "Our Sweet",
    galleryTitle2: "Memories",
    photos: photos,
    
    secretPhoto: secretPhoto,
    secretTitle: "A Little Secret",
    secretCaption: "Terima kasih sudah lahir dan bertumbuh menjadi pria hebat. You are my safe place.",

    closingTitle1: "Happy",
    closingTitle2: "Birthday",
    closingText: "Enjoy your 25th birthday, Fery. May this year bring you closer to all your dreams. I love you endlessly.",
    celebrateBtnText: "celebrate ✨"
  };

  const draft = {
    orderId,
    slug,
    customerName: "Sintya",
    recipientName: "Fery",
    createdAt: new Date().toISOString(),
    status: "done",
    isDraft: true
  };

  await cfPut(`gift:${slug}`, giftData);
  await cfPut(`draft:${slug}`, draft);
}

main();
