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

function toTitleCase(str) {
  if (!str) return str;
  return str.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

async function run() {
  const data = await getGift('untuk-nadia');
  if (!data) {
    console.log('untuk-nadia not found in KV!');
    return;
  }
  
  // Timer settings
  data.timeSubtitle = 'Time Your Existence';
  data.timeTitle = 'On This Earth';
  
  // Apply Title Case to the requested fields
  data.heroPreTitle = 'Happy Birthday, Zee';
  data.heroLine1 = 'To The Birthday Girl,';
  data.heroLine2 = 'Zee';
  data.heroSubtitle = 'I Hope Today Brings You As Much Joy As You Give To Everyone Around You.';
  
  data.introPreTitle = 'A Special Day';
  data.introHeadline1 = 'Wishing You';
  data.introHeadline2 = 'The Happiest';
  data.introHeadline3 = 'Of Birthdays.';
  
  // Keep paragraphs as sentences
  data.introText = [
    "Another year older, and somehow you keep getting better. I wanted to make something a little different for your birthday this year.",
    "Consider this a small reminder of how much you mean to me, and to everyone lucky enough to have you in their lives."
  ];
  data.introSignOff = '– Your Favorite Person 😉';
  
  data.reasonsTitle1 = 'Things I Love';
  data.reasonsTitle2 = 'About You';
  
  data.seasonsTitle1 = 'A Year Of';
  data.seasonsTitle2 = 'Great Moments';
  
  data.galleryTitle1 = 'Some Of Our';
  data.galleryTitle2 = 'Best Times';
  
  data.closingPreTitle = 'Once Again';
  data.closingTitle1 = 'Have The';
  data.closingTitle2 = 'Best Day Ever';
  
  data.celebrateBtnText = 'Make A Wish ✨';
  data.secretCaption = 'Here Is To Many More Birthdays Together.';

  await putGift('untuk-nadia', data);
  console.log('Successfully updated KV!');
}

run();
