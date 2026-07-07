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

async function cfSet(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  if (!res.ok) {
    console.error(`KV PUT failed for ${key}: ${res.status} ${res.statusText}`);
    return false;
  }
  return true;
}

const slug = 'for-tari';

async function run() {
  const draft = {};
  
  draft.slug = slug;
  draft.theme = "vintage-burgundy";
  draft.recipient = "Tari ❤️";
  draft.sender = "Hilmy";
  
  draft.gateSubtitle = "a special anniversary gift";
  draft.heroPreTitle = "to the one i love";
  draft.heroLine1 = "Happy Anniversary,";
  draft.heroLine2 = "Tari ❤️";
  draft.heroSubtitle = "Two years down, a lifetime to go.";
  
  draft.timeEnabled = true;
  draft.timeTitle = "2 Years of Us";
  draft.timeSubtitle = "And every second feels like a dream.";
  // Anniversary is 2026-07-08, 2 years means started in 2024
  draft.timeStartDate = "2024-07-08";
  
  draft.introEnabled = true;
  draft.introIcons = true;
  draft.introPreTitle = "from my heart";
  draft.introHeadline1 = "You are my";
  draft.introHeadline2 = "greatest";
  draft.introHeadline3 = "blessing.";
  draft.introText = [
    "Happy 2nd Anniversary, sayang. Nggak kerasa ya kita udah sampai di titik ini. Aku cuma mau bilang thank you for being the most amazing partner I could ever ask for.",
    "Please stay being my woman yang selalu sayang sama Mas, keluarga, dan juga diri kamu sendiri. You literally mean the world to me.",
    "Terima kasih sudah bertahan dan berjuang sampai saat ini. Harapanku, hopefully kita bisa terus jalan bareng, facing whatever comes our way, together."
  ];
  draft.introSignOff = "– Hilmy";
  
  draft.reasons = [
    { title: "Your Smile", desc: "It literally brightens up my darkest days." },
    { title: "Your Heart", desc: "So pure, selalu bikin aku ngerasa beruntung." },
    { title: "Your Strength", desc: "The way you keep going, aku bangga banget." },
    { title: "Your Care", desc: "Perhatian kecil kamu yang always makes me feel loved." },
    { title: "Your Comfort", desc: "Being with you feels like coming home." },
    { title: "Your Everything", desc: "Just you being you, is more than enough." }
  ];
  draft.reasonsTitle1 = "The Reasons";
  draft.reasonsTitle2 = "I Adore You";
  
  draft.seasons = []; 
  
  const captions = [
    "Happy", "2nd", "Anniversary,", "Tari", "sayang.",
    "Thank", "you", "for", "everything.",
    "Let's", "make", "more", "beautiful", "memories", "together. 🤍"
  ];
  
  draft.photos = captions.map(c => ({ url: "", caption: c }));
  draft.galleryTitle1 = "Our Beautiful";
  draft.galleryTitle2 = "Journey";
  
  draft.outroEnabled = true;
  draft.closingPreTitle = "forever & always";
  draft.closingTitle1 = "I Love You";
  draft.closingTitle2 = "More Every Day";
  draft.closingParagraph = "Just like flowers that need time to grow, cinta kita juga terus berkembang everyday. You deserve all the beautiful things in this world. Here's to our blooming love, and to many more years together.";
  draft.closingLine = "always yours,";
  draft.celebrateBtnText = "celebrate us ✨";
  
  draft.music = {
    title: "Sparkles (orchestral version)",
    artist: "RADWIMPS",
    file: "",
    cover: ""
  };
  
  const success1 = await cfSet(`draft:${slug}`, draft);
  const success2 = await cfSet(`gift:${slug}`, draft);
  
  if (success1 && success2) {
    console.log(`KV updated successfully for ${slug}!`);
  }
}

run();
