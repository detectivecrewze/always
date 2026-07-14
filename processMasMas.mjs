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
  const orderId = "ORD-MRH0SZJJ";
  const slug = "gift-1783732720511";
  
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "Celamatt",
    "Ulang",
    "Tauu",
    "Bububbb",
    "Yang",
    "Paling",
    "Cantikk",
    "Duniaku",
    "Rumahku",
    "Aku",
    "Sayang",
    "Kamu",
    "Sangat",
    "Banyak"
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
      file: "FILL_MANUALLY: Ada Titik Titik Di Ujung Doa - Sal Priadi", 
      title: "Ada Titik Titik Di Ujung Doa",
      artist: "Sal Priadi"
    },

    heroPreTitle: "A SPECIAL GIFT",
    heroLine1: "To My Beautiful,",
    heroLine2: "Cayangkuu",
    heroSubtitle: "Bukan cuma tentang bertambahnya usia, tapi tentang betapa bersyukurnya aku karena kamu ada di hidupku.",

    gatePreTitle: "A SPECIAL GIFT FOR",
    gateTitle: "Cayangkuu Yang Cantikk",
    gateSubtitle: "untuk merayakan hari spesialmu",
    recipient: "Cayangkuu Yang Cantikk",

    timeEnabled: true,
    timeTitle: "Your Journey",
    timeSubtitle: "Waktu yang terus mengiringi langkahmu menjadi wanita yang luar biasa.",
    timeStartDate: "2008-07-13",

    introIcons: ["💖", "🎂", "✨"],
    introPreTitle: "A LETTER FOR YOU",
    introHeadline1: "Selamat",
    introHeadline2: "Ulang Tahun,",
    introHeadline3: "Bububbb",
    introText: [
      "Selamattt ulangg tahunn bububbb nyaa akuu yangg cantikkk 💖💖",
      "Di harii yanggg spesiall inii bukann cuma tentangg bertambahnyaa usiaa bububbb, tapii tentangg betapaa bersyukurr nyaa akuu karena Allah masii kasii bububbb kesempatannn buatt teyuss hidupp, tersenyumm, dann jadii orangg yangg berartiii di idupp akuuu hihihii.",
      "Di usia bububb yangg baruu inii akuu doa in semogaa setiapp langkahh bububb selaluu di jagaa Allah, semogaa diberii kesehatann jugaaa, rezekii nyaa dilancarkan, semogaa impian impiann bububb tercapaii satuu persatuu yaaa, semogaaa hatii bububbb banyaaa tenangg nyaaa yaaa, kuranginn dikitt dikitt egoo nyaa hihihi, dan semogaa semuaa kesedihann dann rasaaa sakitt ituuu semuaa di gantii dengann kebahagiaan yaa bububb.",
      "Semogaa bububb selaluu di kelilingi orang orangg yang benerr benerr menyayangii dirimuu bubbbb, selainn ituu akuu jugaa doainn semogaa bububb tetepp jadii perempuann yangg kuatt, lembutt, baikk hatii, dann selaluu bisaaa lewatii semuaa rintangann yangg datangg yaa bububbb.",
      "Ouhhh iyaaa maacii jugaa yaaa karenaa selamaa inii bububb udaa bertahann, udaa jadii perempuann yangg sangatt luarr biasaa, dann udaa adaa di idupp akuu.",
      "Maappp kaloo akuu seringg ngecewain bububb, masii seringg bikinn bububbb sedihhh, maraaa bahkann overthinkingg, akuu sadarr akuu beyumm sempurna tapii akuu akann teyuss belajarr jadii lakii lakii yangg baikk buatt bububbb.",
      "Sekalii agii celamatt ulangg tauu bububb nya akuu yangg cantikkkk, jangann pernahh ngerasaaa sendiriannn yaa bububbb, semogaa doaa baikk yangg bububb simpenn diemm diemm di kabulkann satuu persatuu yaaa.",
      "Tetepp lahh jadii dirii bububbbb yangg selaluu bisaaa bikinn orangg orangg sekitarrr bububbb ngerasaa beruntungg adanyaa bububbb. Bahagiaaa selaluuu yaaaa bububbbb, semogaaa tahunn inii jadiii tahunn yangg terbaikkk di dalam idupp bububbbb.",
      "Semogaaa di setiapp ulangg tahunn bububbb akuu masii di kasiii kesempatann buatt ngucapinn doaa doaa yangg terbaikk langsungg bahkann ke bububbbb. Akuu sayangg bububbb harii inii, besokk, dann selamaa lamanyaaa."
    ],
    introSignOff: "Duniaku, rumahku.\nMas mas ganteng",

    reasonsTitle1: "The Things",
    reasonsTitle2: "I Adore",
    reasons: [
      {
        title: "Rasa Syukurku",
        desc: "Bersyukur karena Allah masih kasih kesempatan kamu untuk terus hidup, tersenyum, dan jadi orang yang berarti."
      },
      {
        title: "Wanita Kuat",
        desc: "Semoga kamu tetap jadi perempuan kuat, lembut, baik hati, dan selalu bisa lewatin semua rintangan."
      },
      {
        title: "Maacii Ya",
        desc: "Maacii ya karena selama ini bububb udah bertahan dan jadi perempuan yang sangat luar biasa."
      },
      {
        title: "Belajar Lebih Baik",
        desc: "Maap sering ngecewain, aku akan terus belajar jadi laki-laki yang lebih baik buat bububbb."
      },
      {
        title: "Lucky To Have You",
        desc: "Tetap jadi diri bububbb yang selalu bisa bikin orang-orang sekitarmu merasa beruntung."
      },
      {
        title: "Selalu Sayang",
        desc: "Aku sayang bububbb hari ini, besok, dan selamanya. Celamatt ulang tauu sayangkuuu 💖"
      }
    ],

    galleryTitle1: "Our",
    galleryTitle2: "Memories",
    photos: photos,

    closingPreTitle: "ON YOUR SPECIAL DAY",
    closingTitle1: "Happy 18th",
    closingTitle2: "Birthday",
    closingParagraph: "Semoga Allah selalu menjagamu dimanapun bububbb berada. Celamatt ulang tahun sayangkuuu, duniaku, rumahkuuu 💖",
    sender: "Mas mas ganteng",
    celebrateBtnText: "celebrate ✨",
    closingLine: "Selalu di sini untukmu.",
    
    secretPhoto: secretPhoto,
    secretCaption: "Celamatt Ulang Tauu Bububbb 💖"
  };

  const draftMetadata = {
    slug: slug,
    theme: "vintage-burgundy",
    recipient: "Cayangkuu Yang Cantikk",
    sender: "Mas mas ganteng",
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
