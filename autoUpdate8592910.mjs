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
  if (!res.ok) {
    const errText = await res.text();
    console.error(`KV GET failed for ${key}: ${res.status} ${res.statusText} - ${errText}`);
    return null;
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function cfSet(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }, // Removed Content-Type application/json because Cloudflare REST API for PUT value expects multipart or raw body without JSON content-type if not metadata. Actually, fetch stringifies it, so default is fine.
    body
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`KV PUT failed for ${key}: ${res.status} ${res.statusText} - ${errText}`);
    return false;
  }
  return true;
}

const slug = 'auto-8592910';

const introText = [
  "Di hari spesialmu ini, aku hanya ingin mengucapkan terima kasih karena kamu telah hadir dan menjadi bagian yang begitu berharga dalam hidupku. Semoga setiap langkah yang kamu ambil selalu dipenuhi kebahagiaan, kesehatan, dan keberhasilan.",
  "Aku tidak berjanji bahwa perjalanan kita akan selalu mudah, tetapi aku ingin terus berjalan di sisimu, saling menguatkan, saling memahami, dan bertumbuh bersama menjadi pribadi yang lebih baik.",
  "Semoga usiamu yang baru membawa lebih banyak alasan untuk tersenyum, lebih banyak mimpi yang terwujud, dan lebih banyak momen indah yang bisa kita ciptakan bersama.",
  "Selamat bertambah usia, cintaku. Tetaplah menjadi seseorang yang selalu membuat hatiku merasa pulang. Aku mencintaimu, hari ini, esok, dan di setiap waktu yang akan datang. ❤️"
];

const captions = [
  "Selamat", "bertambah", "usia,", "Lidyaa", "sayang.",
  "Mari", "terus", "berjalan", "berdampingan,",
  "merangkai", "lebih", "banyak", "kenangan", "yang", "indah. 🤍"
];

const outroText = "Sama seperti bunga yang membutuhkan waktu untuk merekah, setiap tahun yang kamu lewati telah membentukmu menjadi pribadi yang luar biasa indah. Teruslah mekar dan tebarkan pesonamu ke seluruh dunia. Kamu pantas mendapatkan semua bunga di semesta ini, Lidyaa.";

async function run() {
  console.log(`Fetching draft:${slug}...`);
  let draft = await cfGet(`draft:${slug}`);
  
  if (!draft) {
    console.log(`Draft ${slug} not found, initializing empty object.`);
    draft = {};
  }
  
  draft.recipient = "Lidyaa chann";
  draft.sender = "Nabil";
  
  draft.heroLine1 = "A Special Gift For";
  draft.heroLine2 = "Lidyaa chann";
  draft.gateSubtitle = "For Lidyaa, From Nabil";
  
  // They requested: ulang tahun yang ke : 22
  // We can inject it into a time section title
  draft.timeEnabled = true;
  draft.timeTitle = "22 Years of Blooming";
  draft.timeSub = "Time since you started making the world beautiful";
  
  draft.introEnabled = true;
  draft.introText = introText;
  
  // Outro Text / Metaphor
  draft.outroEnabled = true;
  draft.outroText = outroText;
  
  // Photos (Quotes Sambung)
  if (!draft.photos) draft.photos = [];
  
  // Just prefill the captions even if photos are not yet uploaded, 
  // or update existing photos
  for (let i = 0; i < captions.length; i++) {
    if (draft.photos[i]) {
      if (typeof draft.photos[i] === 'string') {
        draft.photos[i] = { url: draft.photos[i], caption: captions[i] };
      } else {
        draft.photos[i].caption = captions[i];
      }
    } else {
      // Create empty photo slots with just captions so they can fill URLs later
      draft.photos.push({ url: '', caption: captions[i] });
    }
  }

  const success1 = await cfSet(`draft:${slug}`, draft);
  const success2 = await cfSet(`gift:${slug}`, draft); // The gift endpoint
  const success3 = await cfSet(`order:${slug}`, draft);
  if (success1 && success2) {
    console.log("KV updated successfully for draft, gift, and order!");
  }
}

run();
