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
  const orderId = 'ORD-MRGH4D8P';
  const slug = 'auto-291012012';

  console.log(`Fetching order ${orderId} from KV...`);
  const order = await cfGet(`order:${orderId}`);
  if (!order) {
    console.error('Order not found in KV!');
    process.exit(1);
  }

  console.log(`Order found. Photos: ${order.photos?.length || 0}, Secret: ${order.secretPhoto ? 'yes' : 'no'}`);

  const words = [
    "Distance", "Means", "So", "Little", "When", "Someone", "Means",
    "So", "Much", "To", "My", "Heart", "Every", "Day"
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
    theme: "vintage-burgundy",
    musicUrl: "https://www.youtube.com/watch?v=lY5V4hSLWY8", // Risk it all - Bruno Mars (Die With A Smile)

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Kiaa",
    gateSubtitle: "Dari yang sangat merindukanmu",
    gateButtonText: "Open Message",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Kiaa",
    heroSubtitle: "Sebuah pesan pengingat betapa berharganya perjalanan ini, walau raga kita terpisah oleh jarak.",

    timeEnabled: true,
    timeTitle: "Our Journey",
    timeSubtitle: "Menghitung setiap detik waktu yang terus menguji dan menguatkan cinta kita.",
    timeStartDate: "2026-05-30",

    introIcons: ["✨", "🤍", "🥀"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "My Love",
    introHeadline2: "My Universe",
    introText: [
      "Hai sayangku, my love, my world, my home, my universe. Aku cuma mau bilang kalau aku bener-bener beruntung banget punya kamu.",
      "Bersamamu, aku merasa jauh lebih bahagia dari sebelumnya. You bring so much light and joy into my everyday life.",
      "Thank you for staying and holding on up to this point. Makasih ya sayang, kamu udah bertahan sejauh ini meskipun kita harus berjuang melawan jarak."
    ],
    introSignOff: "With all my love,\nIqball",

    reasonsTitle1: "The Reasons",
    reasonsTitle2: "I Adore You",
    reasons: [
      { title: "My Universe", desc: "Kamu bukan cuma pasanganku, but you are literally my home, my world, and my entire universe." },
      { title: "Your Resilience", desc: "Terima kasih sudah bertahan sampai di titik ini. Kesabaranmu dalam jalani hari bikin aku makin jatuh cinta." },
      { title: "True Happiness", desc: "Since you came into my life, aku merasa jauh lebih bahagia dari sebelum-sebelumnya." },
      { title: "The Distance", desc: "Jarak mungkin memisahkan raga kita, but it will never change how deeply I feel for you." },
      { title: "My Greatest Luck", desc: "Memilikimu adalah salah satu hal yang paling aku syukuri. I'm so incredibly lucky to have you." },
      { title: "Endless Love", desc: "Apapun yang terjadi ke depannya, cintaku ke kamu bakal terus ada dan makin besar." }
    ],

    galleryTitle1: "Beautiful Moments",
    galleryTitle2: "We've Shared",
    galleryQuotes: words,
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "a special memory just for you 🤍",

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "See You",
    closingTitle2: "Soon",
    closingParagraph: "Aku mungkin nggak bisa selalu ada di sampingmu setiap saat, tapi kamu akan selalu ada di pikiranku setiap waktu. Tunggu aku ya, sayang. We will meet very soon.",
    celebrateBtnText: "miss you ✨",
    sender: "Iqball",
  };

  const draftData = {
    orderId: orderId,
    moment: "LDR",
    recipientName: "sayangkuu Kiaa",
    specialDate: "2026-05-30",
    relationship: "Pasangan",
    theme: "vintage-burgundy",
    metaphor: "Keepsakes (Kenangan)",
    musicOption: "Playlist: Risk it all - Bruno Mars",
    writingTone: "Indoglish, Puitis",
    message: "haiii sayanggggggkuuuuu cintaaaaakuuuuuuu duniaaakuuuuuuu rumahhhhkuuuuuu semestaaaakuuuuuuuu akuuuuu cumaaa mauuu bilanggg kalauuu akuuu beruntungggg bangettttt punyaaaaa kamuuuu.. samaaa kamuuu akuuuu jauhhhhh lebihhhhhhhh bahagiaaa dariii sebelummm nyaaaaa.. makasiiii yaaaaa sayangggggggg kamuuu udahhhh bertahannn sampaiii dititikkk iniii...",
    deadline: "Minggu, 12 Juli 2026 pukul 22.22",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Iqball to Kiaa (LDR)`);
  console.log(`Photos used: ${photos.filter(p => p.url).length} | Secret: ${secretPhoto ? 'yes' : 'empty'}`);
}
run();
