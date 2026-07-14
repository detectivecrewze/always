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
  const orderId = 'ORD-MRG0T937';
  const slug = 'auto-mrg0t937';

  console.log(`Processing order ${orderId} ...`);

  // We are creating a gift that has no photos uploaded by the user, but purely romantic words.
  const giftData = {
    theme: "ocean-breeze",
    musicUrl: "https://www.youtube.com/watch?v=OT5msu-dap8", // shape of my heart - backstreet boys

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Muhammad Ambri",
    gateSubtitle: "Dari yang sangat bersyukur memilikimu",
    gateButtonText: "Buka Pesan Ini",

    heroPreTitle: "STRAIGHT FROM MY HEART",
    heroLine1: "To My",
    heroLine2: "Future Husband",
    heroSubtitle: "Sebuah perayaan kecil untuk hadirmu yang begitu bermakna, karena kamu pantas untuk dirayakan pada hari ini dan selamanya.",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu telah membawamu sejauh ini, mengukir kisah hebat seorang pria tangguh.",
    timeStartDate: "2003-07-15",

    introIcons: ["✨", "🤍", "🌊"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Selamat",
    introHeadline2: "Bertambah Usia",
    introText: [
      "Terima kasih telah hadir dan menjadi bagian terindah dalam hidupku. Terima kasih untuk setiap usahamu, dan bagaimana kamu selalu memperhatikan hal-hal kecil yang berhasil membuatku bahagia.",
      "Aku bangga padamu, karena kamu telah menjadi pria yang dewasa, romantis, selalu terlihat kuat, dan pantang menyerah menghadapi apapun.",
      "I'm so lucky to have you. Semoga di usiamu yang bertambah ini, kamu selalu dikelilingi oleh segala hal baik dan semua impianmu segera terwujud.",
      "Wish you all the best for you sayangku, cintaku, duniaku, semestaku, my future husband."
    ],
    introSignOff: "Penuh cinta,\nDinda",

    reasonsTitle1: "The Reason",
    reasonsTitle2: "I Love You",
    reasons: [
      { title: "Your Constant Effort", desc: "Terima kasih karena selalu mengusahakan diriku di setiap langkahmu." },
      { title: "The Little Things", desc: "Caramu memperhatikan hal-hal kecil selalu berhasil membuatku merasa sangat dicintai." },
      { title: "Your Maturity", desc: "Kedewasaanmu membuatku merasa aman dan selalu menemukan tempat bersandar." },
      { title: "Your Romance", desc: "Sisi romantismu selalu berhasil membuatku merasa menjadi wanita paling beruntung di dunia." },
      { title: "Your Inner Strength", desc: "Ketangguhanmu dan sifat pantang menyerahmu adalah hal yang paling aku kagumi darimu." },
      { title: "My Everything", desc: "Kamu adalah duniaku, semestaku, dan pria yang aku doakan untuk menjadi teman hidupku selamanya." }
    ],

    // Missing photos, so we leave it empty. The Gallery section is conditional and will skip rendering gracefully.
    photos: [],
    secretPhoto: null,
    secretCaption: null,

    closingPreTitle: "ONE LAST THING",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Sayang",
    closingParagraph: "Selamat ulang tahun yang ke-23! Semoga kamu selalu dikelilingi kebahagiaan seutuhnya. Apapun yang terjadi di masa depan, aku akan selalu menggenggam tanganmu.",
    celebrateBtnText: "selamat ulang tahun ✨",
    sender: "Dinda",
  };

  const draftData = {
    orderId: orderId,
    moment: "Ultah (ke-23)",
    recipientName: "Muhammad Ambri Nahrowi",
    specialDate: "2003-07-15",
    relationship: "Pasangan",
    theme: "ocean-breeze",
    metaphor: "Seasons (4 Musim)", // Keeps the requested value in draft metadata, though we skip it in the Gift
    musicOption: "Request: shape of my heart - backstreet boys",
    writingTone: "Puitis, Title Full english",
    message: "timaakaaciii udah datang di kehidupan aku, yg selalu mengusahakan akuu...",
    deadline: "No deadline specified",
    status: "draft",
    createdAt: new Date().toISOString()
  };

  const ok1 = await cfSet(`draft:${slug}`, draftData);
  const ok2 = await cfSet(`gift:${slug}`, giftData);
  console.log(`draft: ${ok1 ? 'OK' : 'FAILED'} | gift: ${ok2 ? 'OK' : 'FAILED'}`);
  console.log(`Successfully created gift and draft for Dinda to Muhammad Ambri Nahrowi (Custom poetic wording, zero photos)`);
}
run();
