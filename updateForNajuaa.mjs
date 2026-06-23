import fs from 'fs';
import path from 'path';

// load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
for (const line of envStr.split('\n')) {
  if (line.includes('=')) {
    const [k, ...vs] = line.split('=');
    process.env[k.trim()] = vs.join('=').trim().replace(/^"|"$/g, '');
  }
}

import { getGift, putGift } from './src/lib/kv.js';

async function run() {
  let data = await getGift('for-najuaa');
  if (!data) {
    console.log('for-najuaa not found in KV! Creating a new one...');
    data = {};
  }
  
  data.recipientName = 'Gendut';
  data.senderName = 'Culle Ganteng';
  data.sender = 'Culle Ganteng';
  data.theme = 'blush-pink';
  data.musicChoice = 'Apocalypse - Cigarettes After Sex';

  // Copywriting for an Apology / Santai Indoglish / Flower Metaphor
  data.timeSubtitle = 'Every Second';
  data.timeTitle = 'Thinking About You';
  
  data.heroPreTitle = 'I Am So Sorry, Sayang';
  data.heroLine1 = 'To My One And Only,';
  data.heroLine2 = 'Gendut';
  data.heroSubtitle = 'Maaf banget akhir-akhir ini aku sibuk sendiri dengan hal yang nggak jelas.';
  
  data.introPreTitle = 'My Sincerest Apology';
  data.introHeadline1 = 'You Are';
  data.introHeadline2 = 'Always In';
  data.introHeadline3 = 'My Mind.';
  
  data.introText = [
    "Maaff yaa sayangg, akuu akhir-akhir ini terlihatt sibuk sendiri dengan kesibukan aku yang agak random dan gak jelas.",
    "But I want you to know, kesibukan itu sama sekali ga ngurangin rasa cinta dan sayang aku ke kamu kokk ndutt ehekk.",
    "So please don't overthink it yaa. Akuu sayanggg banget sama kamuuu!"
  ];
  data.introSignOff = '– Culle Ganteng';
  
  data.reasonsTitle1 = 'Things I Love';
  data.reasonsTitle2 = 'About You';
  
  data.seasonsTitle1 = 'Through All';
  data.seasonsTitle2 = 'The Seasons';
  
  data.galleryTitle1 = 'Moments I';
  data.galleryTitle2 = 'Cherish Forever';
  
  data.closingPreTitle = 'Once Again';
  data.closingTitle1 = 'Please';
  data.closingTitle2 = 'Forgive Me';
  data.closingParagraph = "I know words alone can't fix everything, but I truly hope this little message shows you how much you mean to me. Maafin aku ya sayang, and I promise to make it up to you. You deserve all the happiness in the world, and I want to be the one giving it to you.";
  
  data.celebrateBtnText = 'I Love You ✨';
  data.secretCaption = 'No matter how busy it gets, it’s always you.';

  // Disable the time counter
  data.timeEnabled = false;

  if (data.photos && data.photos.length > 0) {
    const words = ["I", "love", "you", "more", "than", "anything", "in", "this", "entire", "world."];
    data.photos = data.photos.map((photo, index) => {
      const url = typeof photo === 'string' ? photo : photo.url;
      const word = words[index] || "";
      return { url, caption: word };
    });
  }

  await putGift('for-najuaa', data);
  console.log('Successfully updated KV for for-najuaa!');
  console.log('Preview of Intro Text:', data.introText);
}

run();
