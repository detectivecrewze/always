/**
 * AI Gift Generator Engine (Powered by Google Gemini)
 * 
 * Menggantikan lib/giftGenerator.mjs (static templates).
 * Merangkai 6 section berikut secara dinamis berdasarkan konteks order:
 *  1. Hero Section
 *  2. Time Section (opsional, hanya untuk anniversary)
 *  3. Letter Section (introText)
 *  4. Reason Cards
 *  5. Gallery Quotes (caption per foto)
 *  6. Closing / Secret Media
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// ─── Ordinal helper ─────────────────────────────────────────────────────────
function ordinal(n) {
  if (!n) return '';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Output Schema (strict, no hallucination) ────────────────────────────────
const GiftSchema = z.object({
  // 1. Hero
  heroLine1: z.string().describe('Opening dedication line, e.g. "To The One I Love," or "To My Favorite Person,". Title Case. Max 6 words.'),
  heroSubtitle: z.string().describe('Short poetic subtitle for the hero section. Max 15 words. Title Case. No em dashes.'),

  // 2. Time (anniversary only, skip if birthday)
  timeTitle: z.string().describe('Title for the time counter, e.g. "2 Years of Us". Empty string if birthday.'),
  timeSubtitle: z.string().describe('Short poetic line under the timer. Empty string if birthday. No em dashes.'),

  // 3. Letter
  introHeadline1: z.string().describe('First word/phrase of the letter section heading. Max 3 words. Title Case.'),
  introHeadline2: z.string().describe('Second line of the letter section heading. Max 3 words. Title Case.'),
  introHeadline3: z.string().describe('Third line of the letter section heading, often the recipient name or a word. Title Case.'),
  introText: z.array(z.string()).length(3).describe('The letter body. Exactly 3 paragraphs. Each paragraph 3-5 sentences. Warm, personal, poetic. Incorporate the customer message naturally. No em dashes (—). No hyphens used as dashes.'),

  // 4. Reason Cards
  reasons: z.array(z.object({
    title: z.string().describe('Card title, e.g. "Your Smile". 2-3 words. Title Case.'),
    desc: z.string().describe('Card description. 2-3 sentences. Personal, poetic, no em dashes.'),
  })).length(6).describe('Exactly 6 reason cards, each unique and relevant to the customer context.'),

  // 5. Gallery Quotes (one word/short phrase per photo)
  galleryQuotes: z.array(z.string()).describe('One short word or phrase per photo slot. These appear as captions under each photo. Poetic, romantic, relevant to moment. Examples: "Always", "Paris", "Amore", "Distance Means Nothing". Each item max 3 words.'),

  // 6. Closing / Secret Media
  closingTitle1: z.string().describe('First line of the closing section heading. Max 4 words. Title Case.'),
  closingTitle2: z.string().describe('Second line of the closing section heading. Max 4 words. Title Case.'),
  closingParagraph: z.string().describe('Closing paragraph. 3-4 sentences. Deeply personal, poetic, referencing the metaphor theme. No em dashes.'),
  secretMediaQuote: z.string().describe('A single short, intimate quote for the secret media / final unlock screen. Max 2 sentences. Very poetic. No em dashes.'),
});

// ─── Main AI Generator ───────────────────────────────────────────────────────
export async function generateGiftDataAi(order) {
  const {
    slug,
    from,
    to,
    moment = 'birthday',
    nthYear = null,
    theme = 'blush-pink',
    metaphor = 'flowers',
    tone = ['puitis'],
    musicTitle = '',
    musicArtist = '',
    message = '',
    photoCount = 7,
    startDate = null,
  } = order;

  const isAnniv = moment === 'anniversary';
  const toneStr = Array.isArray(tone) ? tone.join(', ') : tone;
  const count = Math.max(1, Math.min(15, photoCount));

  // ── Determine time start date ──────────────────────────────────────────────
  let timeStartDate = startDate || null;
  if (isAnniv && nthYear && !timeStartDate) {
    const now = new Date();
    const startYear = now.getFullYear() - nthYear;
    timeStartDate = `${startYear}-01-01`; // placeholder, adjust in Studio if needed
  }

  // ── Build the AI prompt ───────────────────────────────────────────────────
  const systemPrompt = `You are a world-class romantic copywriter for a premium digital gift platform called "Loves Edition". 
Your job is to create deeply personal, beautiful, and emotionally resonant content for digital gifts.

RULES (never break these):
- Never use em dashes (—) or hyphens used as dashes (-)
- Never use generic, cliché phrasing like "love is a journey" or "every day is a blessing"
- Always follow the writing tone specified by the customer
- Incorporate specific details from the customer's message naturally (don't just quote it verbatim)
- The metaphor theme should subtly appear in the closing section
- All headings and titles must use Title Case
- Gallery quotes are single words or very short phrases (max 3 words each), like labels on polaroid photos
- For Full English tone: write entirely in English, no Indonesian
- For Indoglish tone: mix Indonesian and English naturally, like a millennial would speak
- For Indonesian tone: write entirely in natural, warm Indonesian
- For Puitis/Poetic tone: use poetic, literary language appropriate to the main language
- The letter (introText) should feel like a handwritten letter, not a social media caption
- The secretMediaQuote should feel like the most intimate, personal line in the entire gift`;

  const userPrompt = `Create a digital gift with these details:

SENDER: ${from}
RECIPIENT: ${to}
OCCASION: ${isAnniv ? `${nthYear ? ordinal(nthYear) + ' ' : ''}Anniversary` : 'Birthday'}
METAPHOR THEME: ${metaphor}
WRITING TONE: ${toneStr}
PHOTO COUNT: ${count} (generate exactly ${count} gallery quotes)
CUSTOMER MESSAGE (use this as the heart of the letter, expand it naturally):
"""
${message || 'No specific message provided. Create something universal and heartfelt.'}
"""

Generate content for all 6 sections. Make it feel real, personal, and unforgettable.`;

  // ── Call Gemini ───────────────────────────────────────────────────────────
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const { object: ai } = await generateObject({
    model: google('gemini-flash-latest'),
    schema: GiftSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });

  // ── Build final KV object ─────────────────────────────────────────────────
  const photos = ai.galleryQuotes.map(caption => ({ url: '', caption }));

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
    heroLine1: ai.heroLine1,
    heroLine2: to,
    heroSubtitle: ai.heroSubtitle,

    // Timer
    timeEnabled: isAnniv && !!timeStartDate,
    timeTitle: ai.timeTitle || '',
    timeSubtitle: ai.timeSubtitle || '',
    timeStartDate: timeStartDate || '',

    // Letter
    introEnabled: true,
    introIcons: true,
    introPreTitle: 'from my heart',
    introHeadline1: ai.introHeadline1,
    introHeadline2: ai.introHeadline2,
    introHeadline3: ai.introHeadline3,
    introText: ai.introText,
    introSignOff: `– ${from}`,

    // Reasons
    reasons: ai.reasons,
    reasonsTitle1: 'The Reasons',
    reasonsTitle2: 'I Adore You',

    // Gallery
    photos,
    galleryTitle1: 'Our Beautiful',
    galleryTitle2: isAnniv ? 'Journey' : 'Memories',

    // Closing / Secret Media
    outroEnabled: true,
    closingPreTitle: 'forever & always',
    closingTitle1: ai.closingTitle1,
    closingTitle2: ai.closingTitle2,
    closingParagraph: ai.closingParagraph,
    closingLine: 'always yours,',
    secretMediaQuote: ai.secretMediaQuote,
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
