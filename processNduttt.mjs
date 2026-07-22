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
  const kvId = 'auto-9391010';
  const orderId = 'ORD-MRUHWBZO';
  const customerName = 'nduttt';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Cowokuu",
    sender: "Nduttt",
    theme: "ocean-breeze",
    musicUrl: "FILL_MANUALLY: Tenang - Judika / Aku, Kamu dan Samudra",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Selamat Ulang Tahun,",
    heroLine2: "Cowokku 🤍",
    heroSubtitle: "Merayakan hari lahir seseorang yang kedatangannya tidak pernah kuduga, tapi selalu kusyukuri.",
    
    timeEnabled: true,
    timeTitle: "Jejak Langkahmu",
    timeSubtitle: "dunia jadi lebih indah sejak",
    timeStartDate: "2010-08-12",

    introPreTitle: "sebuah pesan manis",
    introHeadline1: "Untuk",
    introHeadline2: "Cowok",
    introHeadline3: "Tersayang",
    introText: [
      "Kalau disuruh memperkenalkan kamu, mungkin aku akan bilang kalau kamu adalah orang yang datang di waktu yang paling tidak kuduga. Saat itu aku benar-benar sudah tidak ingin menjalin hubungan lagi, memilih menutup hati karena takut merasakan kecewa.",
      "Lalu kamu datang. Bukan dengan kata-kata manis yang berlebihan, tetapi dengan usaha yang nyata. Kamu sabar menghadapi sikapku yang awalnya sulit percaya, dan perlahan membuktikan kalau niatmu memang serius.",
      "Sedikit demi sedikit, kamu berhasil membuatku membuka hati lagi. Kamu mengajarkanku kalau tidak semua orang datang hanya untuk menyakiti atau pergi begitu saja. Menerimamu menjadi salah satu keputusan yang paling aku syukuri.",
      "Kamu memang belum sempurna. Tapi aku tahu, di balik perbedaan pendapat atau salah paham kita, kamu selalu berusaha menjadi lebih baik. Kamu mau belajar dan memperbaiki kesalahan, dan bagiku itu jauh lebih berarti daripada berpura-pura menjadi sempurna.",
      "Terima kasih karena sudah memilih bertahan, memperjuangkanku saat aku bahkan tidak ingin diperjuangkan, dan sudah menjadi seseorang yang membuatku kembali percaya bahwa dicintai dengan tulus itu benar-benar ada."
    ],
    introSignOff: "Dengan seluruh cintaku, Nduttt",

    reasonsTitle1: "6 Hal yang Paling",
    reasonsTitle2: "Aku Syukuri",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ tentang kita ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Kehadiranmu",
        desc: "Momen saat kamu datang tanpa kuduga dan membuktikan niat seriusmu lewat usaha yang nyata."
      },
      {
        icon: "🌊",
        title: "Kesabaranmu",
        desc: "Kamu sabar menghadapi aku yang awalnya sulit percaya dan perlahan membuatku membuka hati."
      },
      {
        icon: "🌱",
        title: "Usahamu",
        desc: "Selalu mau belajar, berubah, dan memperbaiki kesalahan walau kita terkadang berbeda pendapat."
      },
      {
        icon: "🧸",
        title: "Rasa Aman",
        desc: "Bersamamu aku selalu merasa sangat aman, dihargai, didengar, dan dicintai apa adanya."
      },
      {
        icon: "🏡",
        title: "Tempat Berpulang",
        desc: "Kamu sudah menjadi tempat pulangku, dan aku ingin selalu menjadi tempat pulangmu juga."
      },
      {
        icon: "✨",
        title: "Memilih Bertahan",
        desc: "Memperjuangkanku di saat sulit, dan membuatku kembali percaya bahwa cinta tulus itu sungguh ada."
      }
    ],

    galleryTitle1: "Kumpulan",
    galleryTitle2: "Memori Kita",
    galleryHint: "ketuk fotonya buat liat lebih deket yaa",
    photos: [],

    secretPhoto: secretPhoto,
    secretTitle: "Satu Lagi...",
    secretCaption: "Aku menyayangimu lebih dari yang bisa kujelaskan 🤍",

    closingPreTitle: "doa dari hati",
    closingTitle1: "Selamat",
    closingTitle2: "Ulang Tahun 🤍",
    closingParagraph: "Kalau suatu hari nanti kamu merasa lelah dan merasa dunia tidak berpihak padamu, ingatlah aku selalu ada di sini. Kamu tidak harus menghadapi semuanya sendirian. Semoga kita bisa terus bertumbuh bersama, saling memahami, saling memaafkan, dan tetap memilih satu sama lain setiap hari. Selamat ulang tahun yang ke-16 ya, cowokku. Aku sayang banget sama kamu.",
    celebrateBtnText: "cuddle time ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Cowokuu",
    customerName: customerName,
    theme: "ocean-breeze",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
