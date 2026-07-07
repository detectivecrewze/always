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
  if (res.status === 404) return null;
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

const slug = 'auto-8592910';

async function run() {
  const draft = {};
  
  draft.slug = slug;
  draft.theme = "blush-pink"; // Based on user's theme choice
  draft.recipient = "Lidyaa chann";
  draft.sender = "Nabil";
  
  draft.gateSubtitle = "For Lidyaa, From Nabil";
  draft.heroPreTitle = "a love letter in bloom";
  draft.heroLine1 = "A Special Gift For";
  draft.heroLine2 = "Lidyaa chann";
  draft.heroSubtitle = "Every petal holds a whisper of how much you mean to me.";
  
  draft.timeEnabled = true;
  draft.timeTitle = "22 Years of Blooming";
  draft.timeSubtitle = "Time since you started making the world beautiful";
  draft.timeStartDate = "2004-07-12";
  
  draft.introEnabled = true;
  draft.introIcons = true;
  draft.introPreTitle = "from my heart";
  draft.introHeadline1 = "You are my";
  draft.introHeadline2 = "wildest dream";
  draft.introHeadline3 = "come true.";
  draft.introText = [
    "Di hari spesialmu ini, aku hanya ingin mengucapkan terima kasih karena kamu telah hadir dan menjadi bagian yang begitu berharga dalam hidupku. Semoga setiap langkah yang kamu ambil selalu dipenuhi kebahagiaan, kesehatan, dan keberhasilan.",
    "Aku tidak berjanji bahwa perjalanan kita akan selalu mudah, tetapi aku ingin terus berjalan di sisimu, saling menguatkan, saling memahami, dan bertumbuh bersama menjadi pribadi yang lebih baik.",
    "Semoga usiamu yang baru membawa lebih banyak alasan untuk tersenyum, lebih banyak mimpi yang terwujud, dan lebih banyak momen indah yang bisa kita ciptakan bersama.",
    "Selamat bertambah usia, cintaku. Tetaplah menjadi seseorang yang selalu membuat hatiku merasa pulang. Aku mencintaimu, hari ini, esok, dan di setiap waktu yang akan datang. ❤️"
  ];
  draft.introSignOff = "– Nabil";
  
  // REQUIRED ARRAYS TO PREVENT CRASH
  draft.reasons = [
    { title: "Your Smile", desc: "It lights up my entire world." },
    { title: "Your Heart", desc: "So kind and full of love." },
    { title: "Your Laugh", desc: "The most beautiful sound." },
    { title: "Your Soul", desc: "Pure and genuine." },
    { title: "Your Kindness", desc: "It lights up everyone around you." },
    { title: "Your Presence", desc: "Just being with you is more than enough." }
  ];
  draft.reasonsTitle1 = "The Reasons";
  draft.reasonsTitle2 = "I Love You";
  
  draft.seasons = []; 
  // If seasons is empty, maybe we just omit it since it's optional 
  // (the code does: {data.seasons && <SeasonsSection ... />})
  
  const captions = [
    "Selamat", "bertambah", "usia,", "Lidyaa", "sayang.",
    "Mari", "terus", "berjalan", "berdampingan,",
    "merangkai", "lebih", "banyak", "kenangan", "yang", "indah. 🤍"
  ];
  
  draft.photos = captions.map(c => ({ url: "", caption: c }));
  draft.galleryTitle1 = "Our Beautiful";
  draft.galleryTitle2 = "Memories";
  
  draft.outroEnabled = true;
  draft.closingPreTitle = "always & forever";
  draft.closingTitle1 = "You Are Loved";
  draft.closingTitle2 = "Beyond Words";
  draft.closingParagraph = "Sama seperti bunga yang membutuhkan waktu untuk merekah, setiap tahun yang kamu lewati telah membentukmu menjadi pribadi yang luar biasa indah. Teruslah mekar dan tebarkan pesonamu ke seluruh dunia. Kamu pantas mendapatkan semua bunga di semesta ini, Lidyaa.";
  draft.closingLine = "always yours,";
  draft.celebrateBtnText = "make a wish ✨";
  
  // User requested music: "Bergema sampai selamanya (Nadhif basalamah)"
  draft.music = {
    title: "Bergema sampai selamanya",
    artist: "Nadhif basalamah",
    file: "",
    cover: ""
  };
  
  const success1 = await cfSet(`draft:${slug}`, draft);
  const success2 = await cfSet(`gift:${slug}`, draft);
  
  // We won't overwrite order, let's just fix draft and gift.
  if (success1 && success2) {
    console.log("KV fixed successfully!");
  }
}

run();
