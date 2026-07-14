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
  const orderId = "ORD-MRGQYO74";
  const slug = "auto-f4ucob3";
  
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "I",
    "Love",
    "You",
    "More",
    "And",
    "More",
    "Princess",
    "Kecil",
    "Kesayanganku",
    "Bahagia",
    "Selalu",
    "Ya",
    "Cantik",
    "🤍"
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
    theme: "velvet-purple",
    
    music: {
      file: "FILL_MANUALLY: Risk it all - Bruno Mars", 
      title: "Risk it all",
      artist: "Bruno Mars"
    },

    heroPreTitle: "A SPECIAL GIFT",
    heroLine1: "To My Precious,",
    heroLine2: "Sayangkuu 🤍",
    heroSubtitle: "Sebuah perayaan kecil untuk hadirmu yang begitu bermakna, karena kamu pantas dirayakan.",

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Sayangkuu",
    gateSubtitle: "untuk merayakan hari spesialmu",
    recipient: "Sayangkuu",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu yang telah membawamu sejauh ini menjadi wanita yang luar biasa.",
    timeStartDate: "2007-08-28",

    introIcons: ["🤍", "✨", "🎂"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "Birthday,",
    introHeadline3: "Sayangkuu",
    introText: [
      "Yeyy sudaa 19 tahunn! Semoga diumur yang sekarang makin dilancarkan rezekinya, dimudahkan urusannya, and segala hal baik mengelilingimu ya sayangkuu.",
      "Maaf yaa sayangg tida bisa ngerayain secara langsung. Aku juga pengen dateng buat nempuh 11 jam perjalanan itu buat ngerayain sama kamu, butt mu tau sendiri kerja aku disini kan hhe.",
      "Semoga yang disemogakan tetap jadi orang yang aku kenal ya sayang. Jangan berubah karna hal baru yang dateng secara tiba tiba, mu cantik mu manis mu baikk 🥹🫶🏼",
      "Tetap terus bareng-bareng ya sayang lewatin fase LDR kita ini. Aku yakin bakal ada fase dimana kita kalo pas kangen langsung ketemu, tida harus berantem dulu.",
      "Sisanya dibucket yang aku kirim yaa sayangg, mu terima nanti bucket nya hihi >< I love you more and more princess kecil kesayangankuu 🤍🤍"
    ],
    introSignOff: "With all my love,\nFirmn",

    reasonsTitle1: "The Best",
    reasonsTitle2: "Things",
    reasons: [
      {
        title: "Endless Prayers",
        desc: "Semoga segala hal baik selalu mengelilingimu dan semua urusanmu dimudahkan."
      },
      {
        title: "Distance Can't Stop Us",
        desc: "Meski terpisah 11 jam perjalanan, cintaku tetap sampai ke pelukanmu."
      },
      {
        title: "Don't Change",
        desc: "Tetaplah jadi dirimu yang cantik, manis, dan baik. Jangan pernah berubah ya sayang."
      },
      {
        title: "Our LDR Journey",
        desc: "Mari lewati fase LDR ini bersama, sampai tiba saat kita bisa langsung bertemu saat rindu."
      },
      {
        title: "A Special Bucket",
        desc: "Sisa kasih sayangku ada di buket yang kukirim, terima dengan senyum ya hihi ><"
      },
      {
        title: "I Love You More",
        desc: "I love you more and more, princess kecil kesayangankuu 🤍"
      }
    ],

    galleryTitle1: "Our",
    galleryTitle2: "Memories",
    photos: photos,

    closingPreTitle: "ON YOUR SPECIAL DAY",
    closingTitle1: "Happy 19th",
    closingTitle2: "Birthday",
    closingParagraph: "Semoga kamu selalu dilindungi dan dijaga kebahagiaannya. Happy Birthday sayangkuuu 🤍",
    sender: "Firmn",
    celebrateBtnText: "celebrate ✨",
    closingLine: "Selalu di sini untukmu.",
    
    secretPhoto: secretPhoto,
    secretCaption: "I love you more and more 🤍"
  };

  const draftMetadata = {
    slug: slug,
    theme: "velvet-purple",
    recipient: "Sayangkuu",
    sender: "Firmn",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await cfPut(`gift:${slug}`, giftData);
  await cfPut(`draft:${slug}`, draftMetadata);
  
  if (order) {
    order.status = 'done';
    order.updatedAt = new Date().toISOString();
    await cfPut(`order:${orderId}`, order);
    console.log(`✅ Marked order ${orderId} as done`);
  }
}

main().catch(console.error);
