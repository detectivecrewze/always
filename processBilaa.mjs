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

async function run() {
  const orderId = 'ORD-MRFPL1B1';
  const slug = 'auto-29102012';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "You", "Are", "My", "Favorite", "Place", "To", "Go",
    "When", "My", "Mind", "Searches", "For", "Peace"
  ];

  // Fetch actual uploaded photos from the order
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const photos = [];
  for (let i = 0; i < 14; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  // Fetch actual secret photo from the order
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    theme: "midnight-blue",
    musicUrl: "https://www.youtube.com/watch?v=PNjG22Gbo6U", // Last Night on Earth - Green Day

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Wigunaa",
    gateSubtitle: "From the one who loves you",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Wigunaa",
    heroSubtitle: "A little something to mark this beautiful milestone — because you deserve to be celebrated, today and every single day.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Every year of your life has shaped the incredible person you are today.",
    timeStartDate: "2006-07-25",

    introIcons: ["🎉", "✨", "🤍"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Happy",
    introHeadline2: "20th Birthday",
    introText: [
      "Happy birthday sayangg! May you always be happy.",
      "Semakin bertambah usia kamu, aku yakin bakal semakin bertambah juga keberhasilan-keberhasilan yang bakal kamu dapetin ke depannya.",
      "Aku bener-bener berdoa supaya kamu bisa sampe di titik di mana kamu berhasil gapai semua hal-hal hebat yang selalu kamu ceritain ke aku.",
      "I believe in you so much. I love and i miss u so much sayaang!"
    ],
    introSignOff: "With all my love,\nBilaa",

    reasonsTitle1: "The Reasons",
    reasonsTitle2: "I Love You",
    reasons: [
      { title: "Your Dreams", desc: "Aku selalu kagum sama mimpi-mimpi besar yang sering kamu ceritain ke aku." },
      { title: "Your Hard Work", desc: "Perjuangan kamu buat mencapai apa yang kamu mau selalu bikin aku bangga." },
      { title: "Your Smile", desc: "Ngeliat kamu senyum dan bahagia adalah salah satu hal favoritku di dunia." },
      { title: "Our Connection", desc: "Nyambungnya kita bikin aku ngerasa selalu punya tempat untuk pulang." },
      { title: "Your Kindness", desc: "Hati kamu yang baik bikin aku jatuh cinta berkali-kali." },
      { title: "My Missing Piece", desc: "I miss you so much, dan aku selalu pengen ada di setiap perjalanan suksesmu." }
    ],

    galleryTitle1: "Beautiful Moments",
    galleryTitle2: "We've Shared",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "a special memory just for you \uD83E\uDD0D",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Wigunaa",
    closingParagraph: "Happy 20th birthday! No matter where life takes you, I'll always be here cheering for you. You deserve the world, and I can't wait to see you achieve everything you've dreamed of.",
    celebrateBtnText: "celebrate \u2728",
    sender: "Bilaa",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-20)",
    recipientName: "wigunaa",
    specialDate: "2006-07-25",
    relationship: "Pasangan",
    theme: "midnight-blue",
    metaphor: "Seasons (4 Musim)",
    musicOption: "Request: Last Night on Earth - Green day",
    writingTone: "Indoglish, Santai, Title Full English",
    message: "Happy birthday sayangg, may you always be happy, semakin bertambah usia kamu semakin bertambah jugaa keberhasilan' yang bakal kamu dapatkan, aku bener' berdoa supaya kamu bisa sampe di titik dimana kamu bisa gapai hal' yang slalu kamu ceritain ke aku, i love and i miss u so much sayaang",
    deadline: "Sabtu, 18 Juli 2026 pukul 12.10",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Bilaa to Wigunaa`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty (no secret photo uploaded)'}`);
}
run();
