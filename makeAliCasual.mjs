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
  const kvId = 'gift-1784978642362';
  console.log(`Fetching gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // Update Hero Section
  gift.heroPreTitle = "to my prettiest girl";
  gift.heroLine1 = "Happy 19th Birthday,";
  gift.heroLine2 = "Nurul Aisyah 🤍✨";
  gift.heroSubtitle = "Selamat ulang tahun ke-19 sayangku, orang paling spesial yang selalu bikin aku bangga.";

  // Update Time Section
  gift.timeTitle = "The Story of You";
  gift.timeSubtitle = "menjadi bagian terindah di hidup aku sejak";

  // Update Intro Section (Casual & Natural Tone)
  gift.introPreTitle = "a letter for my favorite girl";
  gift.introHeadline1 = "Untuk";
  gift.introHeadline2 = "Sayangku";
  gift.introHeadline3 = "Nurul Aisyah";
  gift.introText = [
    "Selamat ulang tahun sayangkuuu... 🤍✨",
    "Semoga dengan bertambahnya usia kamu, kamu selalu jadi pribadi yang lebih baik lagi dari hari ke hari yaa.",
    "Semoga kamu selalu diberikan kesehatan, baik fisik maupun mentalnya, dilancarkan rezekinya, dipermudah semua urusannya, dan dikuatkan di setiap proses yang lagi kamu jalani.",
    "Makasih yaa udah hadir di hidup aku, makasih atas semua cinta, perhatian, dan kesabaran yang kamu kasih buat aku selama ini.",
    "Makasih udah jadi sosok yang tetap sama dari awal sampai sekarang, yang selalu berusaha bertahan dan berjuang walaupun capek dan lelah.",
    "Semoga semua tujuan dan impian kamu bisa tercapai satu per satu yaa. Jangan pernah menyerah, karena lelah itu wajar tapi berhenti bukan solusinya. Tetap jadi orang baik, meskipun dunia kadang gak selalu baik ke kamu.",
    "Ingat yaa, sejauh apa pun jarak dan sesibuk apa pun keadaan, aku selalu ada di sini buat mendoakan kamu dan mendukung setiap langkah serta usaha kamu.",
    "Tetap jaga diri, jaga sikap, dan jaga kepercayaan yang kita punya. Sekali lagi, happy birthday sayangkuuu! Semoga kebahagiaan selalu nyertain kamu. Aku bangga banget punya kamu. 🤍🎂✨"
  ];
  gift.introSignOff = "With all my love, Ali";

  // Update Reason Cards (Casual & Conversational)
  gift.reasonsTitle1 = "6 Reasons";
  gift.reasonsTitle2 = "Why";
  gift.reasonsHintTap = "tap the card to reveal";
  gift.reasonsHintAll = "✨ things I adore about you ✨";
  gift.reasons = [
    {
      icon: "🤍",
      title: "Your Kind Heart",
      desc: "Makasih udah hadir dan tetap jadi sosok yang manis dan hangat dari awal kenal sampai sekarang."
    },
    {
      icon: "🌸",
      title: "Always Patient",
      desc: "Makasih atas semua perhatian, cinta, dan kesabaran kamu yang gak pernah habis ngadepin aku."
    },
    {
      icon: "💪",
      title: "Your Hard Work",
      desc: "Aku bangga banget liat kamu yang selalu berusaha bertahan dan berjuang walau lagi capek."
    },
    {
      icon: "✨",
      title: "Good Soul",
      desc: "Tetap jadi orang baik yang selalu ngangenin yaa, biarpun dunia kadang suka gak ramah."
    },
    {
      icon: "🕊️",
      title: "Always Here For You",
      desc: "Sejauh apa pun jarak kita, aku bakal selalu ada di sini buat dukung dan doain kamu."
    },
    {
      icon: "👑",
      title: "So Proud Of You",
      desc: "Aku bersyukur dan bangga banget bisa punya pacar sehebat dan secantik kamu."
    }
  ];

  // Update Secret Section
  gift.secretTitle = "One More Thing...";
  gift.secretCaption = "Happy 19th Birthday, Nurul Aisyah sayang! Aku bangga banget punya kamu 🤍✨";

  // Update Closing Section
  gift.closingPreTitle = "always & forever";
  gift.closingTitle1 = "Happy 19th";
  gift.closingTitle2 = "Birthday 🎂✨";
  gift.closingParagraph = "Sekali lagi, selamat ulang tahun yang ke-19 yaa sayangku Nurul. Makasih udah selalu ada dan berjuang bareng aku. Sejauh apa pun jarak kita, aku bakal selalu ada di sini buat dukung kamu. I'm so proud of you! 🤍✨";
  gift.celebrateBtnText = "make a wish ✨";

  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ Updated gift ${kvId} with casual & warm writing tone across all sections!`);
}

main().catch(console.error);
