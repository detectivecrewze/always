import { NextResponse } from 'next/server';
import { isKVConfigured, putGift, getGift } from '@/lib/kv';

/**
 * POST /api/generate-link
 * Called by the payment gateway webhook after successful payment.
 * Creates a new gift slot with a default template and returns the form link.
 * Body: { order_id: "ORDER-LOVES-1234567890" }
 */
export async function POST(request) {
  // Verify authorization
  const authHeader = request.headers.get('Authorization');
  const secret = process.env.GENERATOR_SECRET || 'digitalatelier2025';
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let order_id;
  try {
    const body = await request.json();
    order_id = body.order_id;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!order_id) {
    return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
  }

  // Derive slug from order_id  e.g. "ORDER-LOVES-1718343600000" → "gift-1718343600000"
  const slug = order_id.toLowerCase().replace('order-loves-', 'gift-');

  // Check if already exists (idempotent)
  try {
    if (isKVConfigured()) {
      const existing = await getGift(slug);
      if (existing) {
        return NextResponse.json({
          ok: true,
          slug,
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://love.for-you-always.my.id'}/form/${slug}`,
        });
      }
    }
  } catch { /* continue to create */ }

  // Build default template (same as Studio handleCreate)
  const template = {
    slug,
    recipient: 'My Love',
    sender: 'Someone Special',
    gateSubtitle: 'something made just for you',
    heroPreTitle: 'a love letter in bloom',
    heroLine1: 'My Love,',
    heroLine2: 'My Everything',
    heroSubtitle: 'Every petal holds a whisper of how much you mean to me.',
    introIcons: true,
    introPreTitle: 'from my heart',
    introHeadline1: 'You are my',
    introHeadline2: 'wildest dream',
    introHeadline3: 'come true.',
    introText: [
      'In a world full of ordinary moments, you are the extraordinary one. The way you laugh, the way you care, the way you simply exist — it fills every corner of my world with something I never knew I needed.',
      'These flowers are not enough. No words ever could be. But they carry every unspoken feeling I hold for you, pressed between their petals like tiny love letters waiting to be found.',
    ],
    introSignOff: '– Always yours 🌹',
    reasons: [
      { icon: '✦', title: 'Your Laugh', desc: 'The sound that makes every room feel like home.' },
      { icon: '✦', title: 'Your Patience', desc: 'How you wait for me even when I take too long.' },
      { icon: '✦', title: 'Your Kindness', desc: 'The way you care without ever being asked.' },
      { icon: '✦', title: 'Your Courage', desc: 'How you face the world even on the hardest days.' },
      { icon: '✦', title: 'Your Warmth', desc: 'The feeling of being next to you on a quiet night.' },
      { icon: '✦', title: 'Your Presence', desc: 'Just being with you is more than enough.' },
    ],
    reasonsTitle1: 'The Reasons',
    reasonsTitle2: 'I Love You',
    seasons: [
      { icon: 'spring', name: 'Spring', teaser: 'where it all began', message: 'Like the first bloom after a long winter, you arrived when I least expected — and everything grew.' },
      { icon: 'summer', name: 'Summer', teaser: 'when love was loudest', message: 'In the fullness of us, I felt the sun from the inside. No distance, no doubt — just warmth.' },
      { icon: 'autumn', name: 'Autumn', teaser: 'beautiful even as things changed', message: "Loving you through change taught me that some things don't need to stay the same to stay beautiful." },
      { icon: 'winter', name: 'Winter', teaser: "I stayed, and I'd stay again", message: 'In the quiet and the cold, I chose you still. I will always choose you still.' },
    ],
    seasonsTitle1: 'A Love For',
    seasonsTitle2: 'Every Season',
    seasonsHint: 'tap each season to discover its meaning',
    photos: [
      { url: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=600&auto=format&fit=crop', caption: 'you' },
      { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', caption: 'are' },
      { url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=600&auto=format&fit=crop', caption: 'loved' },
      { url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop', caption: '♡' },
    ],
    galleryTitle1: 'Our Beautiful',
    galleryTitle2: 'Memories',
    music: { title: 'Kita Punya Waktu', artist: 'Banda Neira', file: '/music/track.mp3', cover: '/photos/cover.jpg' },
    theme: 'vintage-burgundy',
    closingLine: 'always yours,',
    closingPreTitle: 'always & forever',
    closingTitle1: 'You Are Loved',
    closingTitle2: 'Beyond Words',
    closingParagraph: 'No matter where life takes us, know that somewhere in the universe, there is a garden blooming with every feeling I have ever held for you. You deserve the world. You deserve all the flowers. You deserve everything.',
    celebrateBtnText: 'celebrate ✨',
    secretPhoto: '/photos/1.jpg',
    secretCaption: 'this is just for you — my favourite memory of us.',
    createdAt: new Date().toISOString().split('T')[0],
    _autoCreated: true, // flag so Studio knows it came from payment
  };

  try {
    if (isKVConfigured()) {
      await putGift(slug, template);
    } else {
      // Local fallback — write to data/gifts.json
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'data', 'gifts.json');
      let gifts = [];
      if (fs.existsSync(filePath)) {
        gifts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      gifts.push(template);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(gifts, null, 2));
    }
  } catch (err) {
    console.error('Failed to save gift:', err);
    return NextResponse.json({ error: 'Failed to create gift slot' }, { status: 500 });
  }

  const formUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://love.for-you-always.my.id'}/form/${slug}`;

  return NextResponse.json({ ok: true, slug, url: formUrl });
}
