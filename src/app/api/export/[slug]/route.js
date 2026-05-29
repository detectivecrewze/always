import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { isKVConfigured, getGift } from '@/lib/kv';
import fs from 'fs';
import path from 'path';

function readLocalGifts() {
  const filePath = path.join(process.cwd(), 'data', 'gifts.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function GET(request, { params }) {
  if (!await verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  let gift;

  if (isKVConfigured()) {
    gift = await getGift(slug);
  } else {
    const gifts = readLocalGifts();
    gift = gifts.find((g) => g.slug === slug);
  }

  if (!gift) {
    return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
  }

  // Build export data — full project structure info + gift data
  const exportData = {
    _exportInfo: {
      exportedAt: new Date().toISOString(),
      slug: slug,
      instructions: [
        '1. Place this JSON file as data/gifts.json in your loves-edition project (wrap in array: [data])',
        '2. Copy any uploaded media files to public/ folder',
        '3. Run: npm install && npm run build && npm start',
        '4. Or deploy to Vercel: vercel --prod',
      ],
    },
    ...gift,
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  return new Response(jsonStr, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="gift-${slug}.json"`,
    },
  });
}
