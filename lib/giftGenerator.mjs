/**
 * Gift Generator Engine
 * Generates all KV fields from a structured order object.
 *
 * Order shape:
 * {
 *   slug: string,
 *   from: string,
 *   to: string,
 *   moment: "birthday" | "anniversary",
 *   nthYear: number | null,
 *   birthYear: number | null,       // for birthday, customer's birth year
 *   theme: string,
 *   metaphor: "flowers" | "keepsakes" | "stars" | "seasons" | "ocean",
 *   tone: string[],                 // e.g. ["puitis", "indoglish"]
 *   musicTitle: string,
 *   musicArtist: string,
 *   message: string,
 *   photoCount: number              // how many photo slots to prepare
 * }
 */

// ─── Ordinal helper ─────────────────────────────────────────────────────────
function ordinal(n) {
  if (!n) return '';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Gallery quote library ───────────────────────────────────────────────────
const galleryQuotes = {
  birthday: [
    "Selamat ulang tahun, cintaku. Semoga hari ini dan seterusnya selalu bahagia. 🤍",
    "Happy birthday, sayang. Every year with you is my favorite one yet. 🌸",
    "Semoga di hari spesialmu ini, semua doa dan harapanmu segera terwujud. 🌷",
    "You are my favorite reason to smile every single day. Happy birthday. 🤍",
    "Di setiap harimu, semoga kamu selalu merasa dicintai dan disayangi sepenuh hati. 🌸",
  ],
  anniversary: [
    "Terima kasih sudah berjuang bersamaku hingga detik ini. Mari terus melangkah bersama. 🤍",
    "Every day with you is a gift I never want to return. Happy anniversary, my love. 🌸",
    "Dua jiwa, satu perjalanan. Dan aku tidak ingin berjalan dengan siapapun selain kamu. 🌷",
    "Here's to us — to every laugh, every tear, and every moment in between. 🤍",
    "Semoga cinta ini terus tumbuh dan mekar, sama indahnya seperti hari pertama kita bertemu. 🌸",
  ],
};

// ─── Reason cards library ────────────────────────────────────────────────────
const reasonSets = {
  birthday: [
    { title: "Your Smile", desc: "Senyummu selalu berhasil mengalihkan duniaku dan membuatku melupakan semua beban harianku." },
    { title: "Your Heart", desc: "Hatimu yang tulus dan penuh kasih membuatku sangat bersyukur bisa memilikimu." },
    { title: "Your Laugh", desc: "Suara tawamu adalah musik favoritku yang selalu ingin aku dengar setiap saat." },
    { title: "Your Soul", desc: "Jiwa yang begitu murni dan jujur, kamu adalah orang paling luar biasa yang pernah aku temui." },
    { title: "Your Kindness", desc: "Kebaikan hatimu selalu memancarkan kehangatan untuk semua orang di sekitarmu." },
    { title: "Your Presence", desc: "Hanya dengan kehadiranmu saja sudah cukup untuk membuat hariku terasa sangat sempurna." },
  ],
  anniversary: [
    { title: "Your Loyalty", desc: "Kesetiaanmu adalah hal yang paling aku syukuri. Kamu selalu ada di setiap momen yang paling berarti." },
    { title: "Your Patience", desc: "Kesabaranmu dalam menghadapiku membuatku sadar betapa beruntungnya aku bisa bersamamu." },
    { title: "Your Support", desc: "Di setiap jatuh dan bangkit, kamu selalu ada. Terima kasih sudah tidak pernah melepaskan tanganku." },
    { title: "Your Love", desc: "Cara kamu mencintai dengan tulus dan sepenuh hati mengajarkanku arti cinta yang sesungguhnya." },
    { title: "Your Strength", desc: "Kekuatanmu dalam melewati segala rintangan bersama membuatku terus percaya pada kita." },
    { title: "Your Everything", desc: "Tidak ada satu pun yang ingin aku ubah dari kamu. You are perfect just the way you are." },
  ],
};

// ─── Metaphor outro library ──────────────────────────────────────────────────
const metaphorOutro = {
  flowers: {
    birthday: (to) =>
      `Sama seperti bunga yang membutuhkan waktu untuk merekah, setiap tahun yang kamu lewati telah membentukmu menjadi pribadi yang luar biasa indah. Teruslah mekar dan tebarkan pesonamu ke seluruh dunia. Kamu pantas mendapatkan semua bunga di semesta ini, ${to}.`,
    anniversary: (to) =>
      `Seperti bunga yang terus mekar setiap musim, cinta kita juga terus tumbuh dan semakin indah setiap harinya. Here's to our blooming love, dan semua musim indah yang masih menanti kita berdua, ${to}.`,
  },
  keepsakes: {
    birthday: (to) =>
      `Setiap momen bersamamu adalah kenangan berharga yang selalu ingin aku simpan selamanya. Semoga di setiap ulang tahunmu, kita terus menciptakan keepsakes baru yang indah bersama, ${to}.`,
    anniversary: (to) =>
      `Setiap detik perjalanan kita adalah kenangan yang tak ternilai harganya. Terima kasih sudah menciptakan begitu banyak keepsakes indah bersamaku, ${to}.`,
  },
  stars: {
    birthday: (to) =>
      `Di antara jutaan bintang di langit, kamu adalah yang paling bersinar di mataku. Semoga di hari jadimu ini, semua bintang bersekongkol untuk mewujudkan setiap doa dan harapanmu, ${to}.`,
    anniversary: (to) =>
      `Kalau aku harus memilih satu bintang dari seluruh langit, aku akan selalu memilihmu. Terima kasih sudah menjadi bintang pengarahku selama ini, ${to}.`,
  },
  ocean: {
    birthday: (to) =>
      `Seperti samudra yang luas dan tak berbatas, begitu pula rasa cinta dan kekagumanku padamu. Semoga hari ini membawamu ketenangan seperti deburan ombak yang menenangkan jiwa, ${to}.`,
    anniversary: (to) =>
      `Cinta kita sedalam samudra — tak terukur, tak terbatas, dan selalu kembali meski dihempas badai sekalipun. Terima kasih sudah menjadi tempat aku berlabuh, ${to}.`,
  },
  seasons: {
    birthday: (to) =>
      `Di setiap musim kehidupan, kamu selalu berhasil tumbuh dan beradaptasi dengan luar biasa. Semoga ulang tahunmu ini menjadi awal dari musim baru yang penuh keindahan, ${to}.`,
    anniversary: (to) =>
      `Kita telah melewati begitu banyak musim bersama — musim hujan, musim terang, musim yang berat, dan musim yang paling indah. Dan di setiap musim itu, aku selalu bersyukur ada kamu di sisiku, ${to}.`,
  },
};

// ─── Intro text generator ────────────────────────────────────────────────────
function generateIntroText(order) {
  const { from, to, moment, nthYear, message } = order;
  const isAnniv = moment === 'anniversary';
  const isIndoglish = (order.tone || []).map(t => t.toLowerCase()).includes('indoglish');
  const isEnglish = (order.tone || []).map(t => t.toLowerCase().trim()).includes('full english') || (order.tone || []).map(t => t.toLowerCase().trim()).includes('english');

  // Trim the customer message to use as one paragraph naturally
  const rawMsg = (message || '').trim();

  if (isAnniv) {
    if (isEnglish) {
      return [
        `Happy ${nthYear ? ordinal(nthYear) : ''} Anniversary, my love. I just want you to know how incredibly grateful I am to have you by my side.`,
        rawMsg || `Please keep being the amazing person that you are. You make every single day feel more beautiful and worth living for.`,
        `Thank you for everything we've shared. I hope we can keep walking this path, facing whatever comes our way, together. Always. 🤍`,
      ];
    } else if (isIndoglish) {
      return [
        `Happy ${nthYear ? ordinal(nthYear) : ''} Anniversary, sayang. ${nthYear ? `Nggak kerasa ya, kita udah sampai di tahun ke-${nthYear} ini.` : 'Nggak kerasa ya kita udah sampai sejauh ini.'} I just want you to know how grateful I am to have you by my side.`,
        rawMsg || `Please keep being the amazing person that you are. You make every single day feel more beautiful and worth living for.`,
        `Thank you for fighting and growing together with me. Harapanku, hopefully kita bisa terus jalan bareng, facing whatever comes our way, together. Always. 🤍`,
      ];
    }
    return [
      `${nthYear ? `Di hari jadi kita yang ke-${nthYear} ini,` : 'Di hari spesial kita ini,'} aku hanya ingin mengucapkan betapa bersyukurnya aku bisa memilikimu di sisiku.`,
      rawMsg || `Terima kasih sudah menjadi pasangan yang luar biasa. Kamu adalah alasan terbesar mengapa setiap hari terasa lebih bermakna dan indah bagiku.`,
      `Mari kita terus melangkah bersama, menghadapi setiap rintangan dengan tangan yang selalu bergandengan. Aku mencintaimu, hari ini, esok, dan selamanya. 🤍`,
    ];
  } else {
    if (isEnglish) {
      return [
        `Happy birthday, my love! I hope today is as amazing as you are — because trust me, that's a very high bar to reach.`,
        rawMsg || `You deserve all the best things in life, and I'm so grateful I get to be part of your story.`,
        `I hope this new chapter brings you everything you dream of. You are so loved, always and forever. 🤍`,
      ];
    } else if (isIndoglish) {
      return [
        `Happy birthday, sayang! I hope today is as amazing as you are — because trust me, that's a very high bar to reach.`,
        rawMsg || `You deserve all the best things in life, and I'm so grateful I get to be part of your story.`,
        `Semoga di usiamu yang baru ini, semua mimpi dan harapanmu segera terwujud. You are so loved, always and forever. 🤍`,
      ];
    }
    return [
      `Di hari spesialmu ini, aku hanya ingin mengucapkan betapa bersyukurnya aku bisa mengenalmu dan menjadi bagian dari hidupmu.`,
      rawMsg || `Semoga setiap langkah yang kamu ambil selalu dipenuhi kebahagiaan, kesehatan, dan keberhasilan yang kamu impikan.`,
      `Selamat bertambah usia, sayangku. Tetaplah menjadi dirimu yang luar biasa, dan ketahuilah bahwa kamu selalu dicintai. 🤍`,
    ];
  }
}

// ─── Gallery captions generator ──────────────────────────────────────────────
function generateGalleryCaptions(order) {
  const { moment, nthYear, to, photoCount = 7 } = order;
  const count = Math.max(1, Math.min(15, photoCount));

  // Pick the right base quote
  const idx = Math.floor(Math.random() * galleryQuotes[moment === 'anniversary' ? 'anniversary' : 'birthday'].length);
  const baseQuote = galleryQuotes[moment === 'anniversary' ? 'anniversary' : 'birthday'][idx];

  // Split into words
  const words = baseQuote.split(' ');

  // If we have more photos than words, pad with individual words from a second quote
  const allQuotes = [...galleryQuotes[moment === 'anniversary' ? 'anniversary' : 'birthday']];
  let pool = [...words];
  let qi = (idx + 1) % allQuotes.length;
  while (pool.length < count) {
    pool = [...pool, ...allQuotes[qi].split(' ')];
    qi = (qi + 1) % allQuotes.length;
  }

  return pool.slice(0, count).map(w => w);
}

// ─── Main generator ──────────────────────────────────────────────────────────
export function generateGiftData(order) {
  const {
    slug,
    from,
    to,
    moment = 'birthday',
    nthYear = null,
    birthYear = null,
    theme = 'blush-pink',
    metaphor = 'flowers',
    tone = ['puitis'],
    musicTitle = '',
    musicArtist = '',
    message = '',
    photoCount = 7,
  } = order;

  const isAnniv = moment === 'anniversary';
  const metaphorKey = (metaphor || 'flowers').toLowerCase().split(' ')[0];
  const momentKey = isAnniv ? 'anniversary' : 'birthday';

  // ── Time section ─────────────────────────────────────────────────────────
  let timeStartDate = null;
  if (isAnniv && nthYear) {
    const now = new Date();
    const startYear = now.getFullYear() - nthYear;
    const monthDay = '-07-08'; // default, will be overridden if provided
    timeStartDate = `${startYear}${monthDay}`;
  }

  // ── Intro ─────────────────────────────────────────────────────────────────
  const introText = generateIntroText({ from, to, moment, nthYear, tone, message });

  // ── Reasons ───────────────────────────────────────────────────────────────
  const reasons = reasonSets[momentKey] || reasonSets.birthday;

  // ── Gallery ───────────────────────────────────────────────────────────────
  const captions = generateGalleryCaptions({ moment, nthYear, to, photoCount });
  const photos = captions.map(c => ({ url: '', caption: c }));

  // ── Outro ─────────────────────────────────────────────────────────────────
  const outroText = (metaphorOutro[metaphorKey] || metaphorOutro.flowers)[momentKey](to);

  // ── Build final KV object ─────────────────────────────────────────────────
  const data = {
    slug,
    theme,

    // Gate
    gateSubtitle: isAnniv
      ? `a special ${nthYear ? ordinal(nthYear) + ' ' : ''}anniversary gift`
      : 'a special birthday gift',

    // Hero
    heroPreTitle: isAnniv
      ? `happy ${nthYear ? ordinal(nthYear) + ' ' : ''}anniversary, ${to.toLowerCase()}`
      : `happy birthday, ${to.toLowerCase()}`,
    heroLine1: isAnniv ? 'To The One I Love,' : 'To My Favorite Person,',
    heroLine2: to,
    heroSubtitle: isAnniv
      ? `I Hope Our Anniversary Brings You As Much Joy As You Give To Me Every Single Day.`
      : `I Hope Today Brings You As Much Joy As You Give To Everyone Around You.`,

    // Timer
    timeEnabled: isAnniv && !!timeStartDate,
    timeTitle: isAnniv ? `${nthYear ? nthYear + ' Years' : 'Years'} of Us` : '',
    timeSubtitle: isAnniv ? 'And every second feels like a dream.' : '',
    timeStartDate: timeStartDate || '',

    // Intro / Letter
    introEnabled: true,
    introIcons: true,
    introPreTitle: 'from my heart',
    introHeadline1: isAnniv ? 'The Best Part' : 'Happy Birthday,',
    introHeadline2: isAnniv ? 'Of My Entire' : 'My Dearest',
    introHeadline3: isAnniv ? 'Everyday Life.' : `${to}.`,
    introText,
    introSignOff: `– ${from}`,

    // Reasons
    reasons,
    reasonsTitle1: 'The Reasons',
    reasonsTitle2: 'I Adore You',

    // Gallery
    photos,
    galleryTitle1: 'Our Beautiful',
    galleryTitle2: isAnniv ? 'Journey' : 'Memories',

    // Outro
    outroEnabled: true,
    closingPreTitle: 'forever & always',
    closingTitle1: 'I Love You',
    closingTitle2: 'More Every Day',
    closingParagraph: outroText,
    closingLine: 'always yours,',
    celebrateBtnText: isAnniv ? 'celebrate us ✨' : 'make a wish ✨',

    // Music
    music: {
      title: musicTitle || '',
      artist: musicArtist || '',
      file: '',
      cover: '',
    },
  };

  return data;
}
