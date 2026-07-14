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
  return await res.json();
}

async function cfSet(key, value) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(value)
  });
  return res.json();
}

async function main() {
  const orderId = 'ORD-MRKNF9OM';
  const kvId = 'gift-1784025199118';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "24th", "Birthday", "My", "Love", "Thank", "You", "For", 
    "Being", "My", "Home", "I", "Love", "You", "Forever"
  ];
  const words = baseWords.slice(0, orderPhotos.length);
  while (words.length < orderPhotos.length) {
    words.push("✨");
  }

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    id: kvId,
    recipient: 'Glin Raihan',
    nickname: 'Sayang',
    theme: 'ocean-breeze',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 24th birthday',
    heroLine1: 'To My Everything,',
    heroLine2: 'Glin Raihan',
    heroSubtitle: '24 beautiful years of your journey. Thank you for being the home my heart always longed for.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2002-07-20',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "*Untukmu di Hari Lahirmu*",
      "Selamat ulang tahun, sayang.",
      "Hari ini semesta merayakan hari kamu pertama kali hadir, dan aku bersyukur karena sejak saat itu dunia jadi punya alasan untuk lebih indah.",
      "Jika aku diminta menghitung semua alasan mengapa aku mencintaimu, mungkin malam ini tidak akan cukup.",
      "Karena cinta ini bukan sekadar tentang tertawa bersama atau tentang rindu yang datang saat kita berjarak.",
      "Cinta ini tentang bagaimana kamu membuatku percaya lagi bahwa rumah itu bukan bangunan, tapi seseorang. Dan rumah itu adalah kamu.",
      "Terima kasih.",
      "Terima kasih sudah memilih untuk tetap tinggal di hari-hari yang tidak mudah.",
      "Terima kasih sudah menjadi tempat pulang yang tidak pernah menghakimi, yang mendengarkan ceritaku yang panjang, dan yang tetap menggenggam tanganku bahkan saat aku sendiri bingung dengan diriku.",
      "Aku bersyukur pada Tuhan, karena di antara milyaran kemungkinan, Dia mempertemukan kita.",
      "Bersyukur karena kamu mengajariku mencintai dengan sabar. Mengajariku bahwa sayang itu bukan menuntut sempurna, tapi menerima dan bertumbuh bersama.",
      "Bersyukur karena setiap \"capek\" berubah jadi tenang hanya dengan mendengar suaramu. Karena setiap hari kelabu berubah jadi hangat hanya dengan keberadaanmu.",
      "Di usiamu yang baru ini, aku hanya punya satu doa:",
      "Semoga Allah selalu menjaga kesehatanmu, melapangkan rezekimu, dan menambahkan kebahagiaan di setiap langkahmu.",
      "Semoga tahun ini dan tahun-tahun setelahnya kita lalui bersama, saling menguatkan, saling mendoakan.",
      "Aku sayang kamu.",
      "Sayang pada caramu mengingat hal-hal kecil tentangku.",
      "Sayang pada caramu menenangkan saat aku panik.",
      "Sayang pada mimpi-mimpi yang sekarang kita sebut \"kita\".",
      "Aku tidak berjanji bahwa besok akan selalu mudah.",
      "Tapi aku berjanji akan terus memilihmu. Dalam versi terbaikku, maupun versi berantakanku.",
      "Aku berjanji akan terus bersyukur, karena memiliki kamu adalah anugerah yang tidak ingin aku sia-siakan.",
      "Terima kasih sudah menjadi cinta, teman, dan doa yang dikabulkan.",
      "Selamat ulang tahun sekali lagi.",
      "Jaga aku, dan izinkan aku menjagamu. Sampai waktu tua nanti, kita masih saling tertawa mengingat semua ini.",
      "Aku mencintaimu, hari ini, kemarin, dan untuk semua hari yang belum kita lalui."
    ],
    introSignOff: 'Forever yours, Amanda Ramadhani',
    reasonSectionTitle: 'Why I Am Grateful For You',
    reasons: [
      {
        title: 'My Safe Haven',
        desc: 'Thank you for making me believe that home is not a place, but a person. And that person is you.'
      },
      {
        title: 'Your Endless Patience',
        desc: 'I am forever grateful for your patience, holding my hand even when I am lost within myself.'
      },
      {
        title: 'The Calm To My Chaos',
        desc: 'Thank you for turning my exhaustion into peace, just by hearing the warmth of your voice.'
      },
      {
        title: 'Our Growing Love',
        desc: 'You taught me that love isn\'t about demanding perfection, but about accepting and growing together.'
      },
      {
        title: 'Loving The Little Things',
        desc: 'I love the way you remember the smallest details about me and calm me down when I panic.'
      },
      {
        title: 'A Prayer Answered',
        desc: 'Thank you for being my love, my best friend, and the most beautiful prayer God has answered.'
      }
    ],
    photos,
    closingLine: 'I will always choose you.',
    sender: 'Amanda Ramadhani',
    secretPhoto,
    secretCaption: 'Happy Birthday, my home. ✨',
    closingPreTitle: 'here is to us,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'I promise to always choose you, through all the easy and hard days. Happy 24th Birthday, my love!',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Glin Raihan',
    theme: 'ocean-breeze',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Glin Raihan (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Let Team Decide'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
